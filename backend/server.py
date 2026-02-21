from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
from typing import Optional, List
import jwt
import bcrypt
import os
from dotenv import load_dotenv
import logging

load_dotenv()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "xriepv1-super-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database connection
client = MongoClient(MONGODB_URL)
db = client["xriepv1_db"]
users_collection = db["users"]
requests_collection = db["requests"]
devices_collection = db["devices"]

app = FastAPI(title="Xriepv1 API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class UserCreate(BaseModel):
    username: str
    password: str
    masa_aktif_hari: int = 30
    max_devices: int = 3

class UserLogin(BaseModel):
    username: str
    password: str
    device_id: str
    device_name: Optional[str] = "Unknown Device"

class UserOut(BaseModel):
    id: str
    username: str
    role: str
    is_active: bool
    masa_aktif_hingga: Optional[datetime]
    max_devices: int
    current_devices: int
    is_online: bool

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class RequestCreate(BaseModel):
    nomor_whatsapp: str

class RequestOut(BaseModel):
    id: str
    user_id: str
    username: str
    nomor_whatsapp: str
    status: str
    created_at: datetime

class RequestUpdate(BaseModel):
    status: str

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def get_current_user(token: str):
    payload = verify_token(token)
    if not payload:
        return None
    user = users_collection.find_one({"_id": ObjectId(payload["sub"])})
    return user

def check_device_limit(user_id: str, device_id: str, max_devices: int):
    user_devices = list(devices_collection.find({"user_id": user_id}))
    
    for device in user_devices:
        if device["device_id"] == device_id:
            return True, device
    
    if len(user_devices) < max_devices:
        return True, None
    
    return False, None

def update_user_online_status(user_id: str, is_online: bool):
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_online": is_online}}
    )

# Create default admin
def create_default_admin():
    admin = users_collection.find_one({"username": "admin"})
    if not admin:
        admin_data = {
            "username": "admin",
            "password": hash_password("admin123"),
            "role": "admin",
            "is_active": True,
            "masa_aktif_hingga": None,
            "max_devices": 999,
            "is_online": False,
            "created_at": datetime.utcnow()
        }
        users_collection.insert_one(admin_data)
        logger.info("Default admin created: username=admin, password=admin123")

@app.on_event("startup")
async def startup_event():
    create_default_admin()

# Auth Endpoints
@app.post("/api/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    user = users_collection.find_one({"username": login_data.username})
    
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="Account is disabled")
    
    if user.get("masa_aktif_hingga") and user["masa_aktif_hingga"] < datetime.utcnow():
        raise HTTPException(status_code=403, detail="Account has expired")
    
    can_login, existing_device = check_device_limit(
        str(user["_id"]), 
        login_data.device_id, 
        user["max_devices"]
    )
    
    if not can_login:
        raise HTTPException(
            status_code=403, 
            detail=f"Maximum devices ({user['max_devices']}) reached"
        )
    
    device_data = {
        "user_id": str(user["_id"]),
        "device_id": login_data.device_id,
        "device_name": login_data.device_name,
        "last_active": datetime.utcnow()
    }
    
    if existing_device:
        devices_collection.update_one(
            {"_id": existing_device["_id"]},
            {"$set": {"last_active": datetime.utcnow()}}
        )
    else:
        devices_collection.insert_one(device_data)
    
    update_user_online_status(str(user["_id"]), True)
    
    current_devices = devices_collection.count_documents({"user_id": str(user["_id"])})
    
    token = create_token({"sub": str(user["_id"]), "role": user["role"]})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "username": user["username"],
            "role": user["role"],
            "is_active": user["is_active"],
            "masa_aktif_hingga": user.get("masa_aktif_hingga"),
            "max_devices": user["max_devices"],
            "current_devices": current_devices,
            "is_online": True
        }
    }

@app.post("/api/auth/logout")
async def logout(token_data: dict = Depends(lambda: None)):
    auth_header = token_data.get("authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="No token provided")
    
    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    update_user_online_status(payload["sub"], False)
    return {"message": "Logged out successfully"}

@app.get("/api/auth/me")
async def get_me(token_data: dict = Depends(lambda: None)):
    auth_header = token_data.get("authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="No token provided")
    
    token = auth_header.replace("Bearer ", "")
    user = get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    current_devices = devices_collection.count_documents({"user_id": str(user["_id"])})
    
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "role": user["role"],
        "is_active": user["is_active"],
        "masa_aktif_hingga": user.get("masa_aktif_hingga"),
        "max_devices": user["max_devices"],
        "current_devices": current_devices,
        "is_online": user.get("is_online", False)
    }

# Admin Endpoints
@app.post("/api/admin/users")
async def create_user(user_data: UserCreate, token_data: dict = Depends(lambda: None)):
    auth_header = token_data.get("authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="No token provided")
    
    token = auth_header.replace("Bearer ", "")
    admin = get_current_user(token)
    
    if not admin or admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    existing = users_collection.find_one({"username": user_data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    masa_aktif_hingga = datetime.utcnow() + timedelta(days=user_data.masa_aktif_hari)
    
    user = {
        "username": user_data.username,
        "password": hash_password(user_data.password),
        "role": "user",
        "is_active": True,
        "masa_aktif_hingga": masa_aktif_hingga,
        "max_devices": user_data.max_devices,
        "is_online": False,
        "created_at": datetime.utcnow()
    }
    
    result = users_collection.insert_one(user)
    
    return {
        "id": str(result.inserted_id),
        "username": user["username"],
        "message": "User created successfully"
    }

@app.get("/api/admin/users")
async def get_users(token_data: dict = Depends(lambda: None)):
    auth_header = token_data.get("authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="No token provided")
    
    token = auth_header.replace("Bearer ", "")
    admin = get_current_user(token)
    
    if not admin or admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = []
    for user in users_collection.find({"role": "user"}):
        current_devices = devices_collection.count_documents({"user_id": str(user["_id"])})
        users.append({
            "id": str(user["_id"]),
            "username": user["username"],
            "is_active": user["is_active"],
            "masa_aktif_hingga": user.get("masa_aktif_hingga"),
            "max_devices": user["max_devices"],
            "current_devices": current_devices,
            "is_online": user.get("is_online", False)
        })
    
    return users

@app.delete("/api/admin/users/{user_id}")
async def delete_user(user_id: str, token_data: dict = Depends(lambda: None)):
    auth_header = token_data.get("authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="No token provided")
    
    token = auth_header.replace("Bearer ", "")
    admin = get_current_user(token)
    
    if not admin or admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = users_collection.delete_one({"_id": ObjectId(user_id)})
    devices_collection.delete_many({"user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

@app.get("/api/admin/requests")
async def get_all_requests(token_data: dict = Depends(lambda: None)):
    auth_header = token_data.get("authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="No token provided")
    
    token = auth_header.replace("Bearer ", "")
    admin = get_current_user(token)
    
    if not admin or admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    requests = []
    for req in requests_collection.find().sort("created_at", -1):
        user = users_collection.find_one({"_id": ObjectId(req["user_id"])})
        requests.append({
            "id": str(req["_id"]),
            "user_id": req["user_id"],
            "username": user["username"] if user else "Unknown",
            "nomor_whatsapp": req["nomor_whatsapp"],
            "status": req["status"],
            "created_at": req["created_at"]
        })
    
    return requests

@app.put("/api/admin/requests/{request_id}/status")
async def update_request_status(request_id: str, update: RequestUpdate, token_data: dict = Depends(lambda: None)):
    auth_header = token_data.get("authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="No token provided")
    
    token = auth_header.replace("Bearer ", "")
    admin = get_current_user(token)
    
    if not admin or admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = requests_collection.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": update.status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    
    return {"message": "Status updated successfully"}

# User Endpoints
@app.post("/api/user/requests")
async def create_request(req_data: RequestCreate, token_data: dict = Depends(lambda: None)):
    auth_header = token_data.get("authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="No token provided")
    
    token = auth_header.replace("Bearer ", "")
    user = get_current_user(token)
    
    if not user or user["role"] != "user":
        raise HTTPException(status_code=403, detail="User access required")
    
    request_data = {
        "user_id": str(user["_id"]),
        "nomor_whatsapp": req_data.nomor_whatsapp,
        "status": "PENDING",
        "created_at": datetime.utcnow()
    }
    
    result = requests_collection.insert_one(request_data)
    
    return {
        "id": str(result.inserted_id),
        "message": "Request created successfully"
    }

@app.get("/api/user/requests")
async def get_user_requests(token_data: dict = Depends(lambda: None)):
    auth_header = token_data.get("authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="No token provided")
    
    token = auth_header.replace("Bearer ", "")
    user = get_current_user(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    requests = []
    for req in requests_collection.find({"user_id": str(user["_id"])}).sort("created_at", -1):
        requests.append({
            "id": str(req["_id"]),
            "nomor_whatsapp": req["nomor_whatsapp"],
            "status": req["status"],
            "created_at": req["created_at"]
        })
    
    return requests

# Mock Download Endpoints
@app.post("/api/user/download/tiktok")
async def download_tiktok(token_data: dict = Depends(lambda: None)):
    return {
        "success": True,
        "message": "TikTok download mock - In production, this would return video URL",
        "video_url": "https://example.com/mock-video.mp4"
    }

@app.post("/api/user/download/instagram")
async def download_instagram(token_data: dict = Depends(lambda: None)):
    return {
        "success": True,
        "message": "Instagram download mock - In production, this would return media URL",
        "media_url": "https://example.com/mock-image.jpg"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
