import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";

const API_URL = "http://localhost:8001";

interface User {
  id: string;
  username: string;
  role: string;
  is_active: boolean;
  masa_aktif_hingga?: string;
  max_devices: number;
  current_devices: number;
  is_online: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string, deviceId: string, deviceName: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (username, password, deviceId, deviceName) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/api/auth/login`, {
            username,
            password,
            device_id: deviceId,
            device_name: deviceName,
          });

          const { access_token, user } = response.data;
          
          // Set default axios header
          axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
          
          set({ 
            user, 
            token: access_token, 
            isLoading: false,
            error: null 
          });

          // Redirect based on role
          if (user.role === "admin") {
            router.replace("/admin-dashboard");
          } else {
            router.replace("/user-home");
          }
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.detail || "Login failed" 
          });
        }
      },

      logout: async () => {
        try {
          const { token } = get();
          if (token) {
            await axios.post(`${API_URL}/api/auth/logout`, {}, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Clear axios header
          delete axios.defaults.headers.common["Authorization"];
          // Clear state
          set({ user: null, token: null });
          router.replace("/login");
        }
      },

      loadUser: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          set({ user: response.data });
        } catch (error) {
          // Token expired or invalid
          set({ user: null, token: null });
          router.replace("/login");
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
