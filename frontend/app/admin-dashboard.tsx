import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../src/store/authStore";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "http://localhost:8001";

interface User {
  id: string;
  username: string;
  is_active: boolean;
  masa_aktif_hingga: string;
  max_devices: number;
  current_devices: number;
  is_online: boolean;
}

interface Request {
  id: string;
  username: string;
  nomor_whatsapp: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"users" | "requests">("users");
  
  // User management states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [masaAktif, setMasaAktif] = useState("30");
  const [maxDevices, setMaxDevices] = useState("3");
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Request management states
  const [requests, setRequests] = useState<Request[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.role !== "admin") {
      router.replace("/login");
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else {
      fetchRequests();
    }
  }, [activeTab]);

  // Auto refresh every 5 seconds for online status
  useEffect(() => {
    if (activeTab === "users") {
      const interval = setInterval(fetchUsers, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axios.get(`${API_URL}/api/admin/users`);
      setUsers(response.data);
    } catch (error) {
      Alert.alert("Error", "Gagal mengambil data users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await axios.get(`${API_URL}/api/admin/requests`);
      setRequests(response.data);
    } catch (error) {
      Alert.alert("Error", "Gagal mengambil data requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "users") {
      await fetchUsers();
    } else {
      await fetchRequests();
    }
    setRefreshing(false);
  };

  const handleCreateUser = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Username dan password harus diisi");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/admin/users`, {
        username,
        password,
        masa_aktif_hari: parseInt(masaAktif),
        max_devices: parseInt(maxDevices),
      });

      Alert.alert("Sukses", "User berhasil dibuat");
      setUsername("");
      setPassword("");
      setMasaAktif("30");
      setMaxDevices("3");
      fetchUsers();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.detail || "Gagal membuat user");
    }
  };

  const handleDeleteUser = (userId: string, username: string) => {
    Alert.alert(
      "Hapus User",
      `Yakin ingin menghapus user ${username}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/api/admin/users/${userId}`);
              Alert.alert("Sukses", "User berhasil dihapus");
              fetchUsers();
            } catch (error) {
              Alert.alert("Error", "Gagal menghapus user");
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      await axios.put(`${API_URL}/api/admin/requests/${requestId}/status`, {
        status: newStatus,
      });
      fetchRequests();
    } catch (error) {
      Alert.alert("Error", "Gagal update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "#f59e0b";
      case "PROSES": return "#3b82f6";
      case "SELESAI": return "#10b981";
      case "GAGAL": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome, {user?.username}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "users" && styles.activeTab]}
          onPress={() => setActiveTab("users")}
        >
          <Ionicons 
            name="people-outline" 
            size={20} 
            color={activeTab === "users" ? "#6366f1" : "#666"} 
          />
          <Text style={[styles.tabText, activeTab === "users" && styles.activeTabText]}>
            Kelola User
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "requests" && styles.activeTab]}
          onPress={() => setActiveTab("requests")}
        >
          <Ionicons 
            name="document-text-outline" 
            size={20} 
            color={activeTab === "requests" ? "#6366f1" : "#666"} 
          />
          <Text style={[styles.tabText, activeTab === "requests" && styles.activeTabText]}>
            Data Request
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === "users" ? (
          <View style={styles.content}>
            {/* Create User Panel */}
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>➕ Create New User</Text>
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Masa Aktif (hari)"
                    value={masaAktif}
                    onChangeText={setMasaAktif}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Max Devices"
                    value={maxDevices}
                    onChangeText={setMaxDevices}
                    keyboardType="numeric"
                  />
                </View>
                <TouchableOpacity style={styles.createButton} onPress={handleCreateUser}>
                  <Text style={styles.createButtonText}>Buat User</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Users List Panel */}
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>👥 Daftar Users</Text>
              {loadingUsers ? (
                <ActivityIndicator size="large" color="#6366f1" />
              ) : (
                users.map((item) => (
                  <View key={item.id} style={styles.userCard}>
                    <View style={styles.userInfo}>
                      <View style={styles.userHeader}>
                        <Text style={styles.username}>{item.username}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: item.is_online ? "#10b981" : "#ef4444" }]}>
                          <Text style={styles.statusText}>
                            {item.is_online ? "Online" : "Offline"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.userDetails}>
                        <Text style={styles.detailText}>
                          Devices: {item.current_devices}/{item.max_devices}
                        </Text>
                        <Text style={[styles.detailText, isExpired(item.masa_aktif_hingga) && styles.expiredText]}>
                          Expiry: {formatDate(item.masa_aktif_hingga)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteUser(item.id, item.username)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>📋 Data Request Users</Text>
              {loadingRequests ? (
                <ActivityIndicator size="large" color="#6366f1" />
              ) : (
                <FlatList
                  data={requests}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item, index }) => (
                    <View style={styles.requestCard}>
                      <View style={styles.requestHeader}>
                        <Text style={styles.requestNo}>#{index + 1}</Text>
                        <Text style={styles.requestUser}>{item.username}</Text>
                      </View>
                      <Text style={styles.requestNumber}>📱 {item.nomor_whatsapp}</Text>
                      <View style={styles.requestFooter}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                          <Text style={styles.statusText}>{item.status}</Text>
                        </View>
                        <View style={styles.statusButtons}>
                          {["PENDING", "PROSES", "SELESAI", "GAGAL"].map((status) => (
                            <TouchableOpacity
                              key={status}
                              style={[
                                styles.statusButton,
                                item.status === status && styles.activeStatusButton,
                              ]}
                              onPress={() => handleUpdateStatus(item.id, status)}
                            >
                              <Text
                                style={[
                                  styles.statusButtonText,
                                  item.status === status && styles.activeStatusButtonText,
                                ]}
                              >
                                {status.charAt(0)}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                      <Text style={styles.requestDate}>{formatDate(item.created_at)}</Text>
                    </View>
                  )}
                />
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#6366f1",
    padding: 20,
    paddingTop: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginTop: 5,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#eef2ff",
  },
  tabText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#6366f1",
  },
  content: {
    padding: 20,
  },
  panel: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  form: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  createButton: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  userDetails: {
    flexDirection: "row",
    gap: 15,
  },
  detailText: {
    fontSize: 12,
    color: "#666",
  },
  expiredText: {
    color: "#ef4444",
  },
  deleteButton: {
    padding: 8,
  },
  requestCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  requestNo: {
    fontSize: 14,
    color: "#666",
  },
  requestUser: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  requestNumber: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 10,
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusButtons: {
    flexDirection: "row",
    gap: 5,
  },
  statusButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  activeStatusButton: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
  },
  activeStatusButtonText: {
    color: "#fff",
  },
  requestDate: {
    fontSize: 10,
    color: "#999",
    textAlign: "right",
  },
});