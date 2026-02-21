import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "http://localhost:8001";

export default function RequestNomor() {
  const [nomor, setNomor] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!nomor) {
      Alert.alert("Error", "Nomor WhatsApp harus diisi");
      return;
    }

    if (!nomor.match(/^[0-9]+$/)) {
      Alert.alert("Error", "Nomor hanya boleh berisi angka");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/user/requests`, {
        nomor_whatsapp: nomor,
      });

      Alert.alert(
        "Sukses",
        "Request berhasil dikirim",
        [
          {
            text: "Lihat Daftar Request",
            onPress: () => router.push("/request-list"),
          },
          {
            text: "Request Lagi",
            style: "cancel",
            onPress: () => setNomor(""),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Gagal mengirim request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="chatbubbles" size={80} color="#6366f1" />
        </View>

        <Text style={styles.title}>Request Perbaikan Nomor</Text>
        <Text style={styles.subtitle}>
          Masukkan nomor WhatsApp yang ingin diperbaiki
        </Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nomor WhatsApp</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contoh: 628123456789"
                value={nomor}
                onChangeText={setNomor}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
            <Text style={styles.hint}>
              * Gunakan format internasional (62 untuk Indonesia)
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Kirim Request</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewRequestsButton}
            onPress={() => router.push("/request-list")}
          >
            <Ionicons name="list" size={20} color="#6366f1" />
            <Text style={styles.viewRequestsText}>Lihat Daftar Request Saya</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  form: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  inputIcon: {
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  viewRequestsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  viewRequestsText: {
    color: "#6366f1",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
});