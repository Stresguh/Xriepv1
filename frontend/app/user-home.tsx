import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../src/store/authStore";
import { Ionicons } from "@expo/vector-icons";

export default function UserHome() {
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      title: "Request Nomor",
      icon: "chatbubbles-outline",
      route: "/request-nomor",
      color: "#6366f1",
    },
    {
      title: "TikTok Downloader",
      icon: "logo-tiktok",
      route: "/tiktok-downloader",
      color: "#000000",
    },
    {
      title: "Instagram Downloader",
      icon: "logo-instagram",
      route: "/instagram-downloader",
      color: "#e4405f",
    },
    {
      title: "Daftar Request",
      icon: "document-text-outline",
      route: "/request-list",
      color: "#10b981",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Xriepv1</Text>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user?.username}</Text>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Menu Grid */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Layanan</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + "20" }]}>
                <Ionicons name={item.icon as any} size={32} color={item.color} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Device Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informasi Akun</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Device Terdaftar:</Text>
            <Text style={styles.infoValue}>
              {user?.current_devices}/{user?.max_devices}
            </Text>
          </View>
          {user?.masa_aktif_hingga && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Masa Aktif:</Text>
              <Text style={styles.infoValue}>
                {new Date(user.masa_aktif_hingga).toLocaleDateString("id-ID")}
              </Text>
            </View>
          )}
        </View>
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
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontSize: 16,
    color: "#fff",
    marginRight: 10,
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 4,
  },
  onlineText: {
    color: "#fff",
    fontSize: 12,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});