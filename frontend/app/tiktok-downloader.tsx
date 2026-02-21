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
  Linking,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "http://localhost:8001";

export default function TikTokDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDownload = async () => {
    if (!url) {
      Alert.alert("Error", "URL TikTok harus diisi");
      return;
    }

    if (!url.includes("tiktok.com")) {
      Alert.alert("Error", "URL tidak valid. Masukkan URL TikTok yang benar");
      return;
    }

    setLoading(true);
    try {
      // Mock response - in production, this would call actual TikTok API
      const response = await axios.post(`${API_URL}/api/user/download/tiktok`, {
        url: url,
      });
      
      setResult(response.data);
    } catch (error) {
      Alert.alert("Error", "Gagal memproses video");
    } finally {
      setLoading(false);
    }
  };

  const openMockVideo = () => {
    Alert.alert(
      "Info",
      "Ini adalah fitur MOCK untuk development. Di production, video akan didownload."
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="logo-tiktok" size={80} color="#000" />
        </View>

        <Text style={styles.title}>TikTok Video Downloader</Text>
        <Text style={styles.subtitle}>
          Download video TikTok tanpa watermark
        </Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>URL Video TikTok</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="link-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="https://www.tiktok.com/@user/video/123456789"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleDownload}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Proses Download</Text>
              </>
            )}
          </TouchableOpacity>

          {result && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text style={styles.resultTitle}>Video Siap!</Text>
              </View>
              
              <View style={styles.videoInfo}>
                <Ionicons name="videocam-outline" size={40} color="#6366f1" />
                <View style={styles.videoDetails}>
                  <Text style={styles.videoName}>tiktok_video.mp4</Text>
                  <Text style={styles.videoSize}>~ 5.2 MB</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.downloadButton} onPress={openMockVideo}>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.downloadButtonText}>Download Video (MOCK)</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#6366f1" />
            <Text style={styles.infoText}>
              Fitur ini masih dalam mode MOCK untuk development. Untuk production, 
              perlu integrasi dengan API TikTok downloader.
            </Text>
          </View>
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
    backgroundColor: "#f0f0f0",
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
    fontSize: 14,
  },
  button: {
    backgroundColor: "#000",
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
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
  resultContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10b981",
  },
  videoInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    gap: 15,
  },
  videoDetails: {
    flex: 1,
  },
  videoName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  videoSize: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  downloadButton: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#eef2ff",
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#6366f1",
    lineHeight: 18,
  },
});