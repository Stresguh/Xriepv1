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
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "http://localhost:8001";

export default function InstagramDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [mediaType, setMediaType] = useState<"photo" | "video" | null>(null);

  const handleDownload = async () => {
    if (!url) {
      Alert.alert("Error", "URL Instagram harus diisi");
      return;
    }

    if (!url.includes("instagram.com")) {
      Alert.alert("Error", "URL tidak valid. Masukkan URL Instagram yang benar");
      return;
    }

    setLoading(true);
    try {
      // Mock response - in production, this would call actual Instagram API
      const response = await axios.post(`${API_URL}/api/user/download/instagram`, {
        url: url,
      });
      
      setResult(response.data);
      // Randomly set media type for mock
      setMediaType(Math.random() > 0.5 ? "video" : "photo");
    } catch (error) {
      Alert.alert("Error", "Gagal memproses media");
    } finally {
      setLoading(false);
    }
  };

  const openMockMedia = () => {
    Alert.alert(
      "Info",
      "Ini adalah fitur MOCK untuk development. Di production, foto/video akan didownload."
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="logo-instagram" size={80} color="#e4405f" />
        </View>

        <Text style={styles.title}>Instagram Downloader</Text>
        <Text style={styles.subtitle}>
          Download foto dan video Instagram
        </Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>URL Post/Reel Instagram</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="link-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="https://www.instagram.com/p/ABC123/"
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
                <Text style={styles.resultTitle}>Media Siap!</Text>
              </View>
              
              <View style={styles.mediaInfo}>
                <Ionicons 
                  name={mediaType === "video" ? "videocam" : "image"} 
                  size={40} 
                  color="#e4405f" 
                />
                <View style={styles.mediaDetails}>
                  <Text style={styles.mediaName}>
                    instagram_{mediaType === "video" ? "video" : "photo"}.{mediaType === "video" ? "mp4" : "jpg"}
                  </Text>
                  <Text style={styles.mediaSize}>
                    {mediaType === "video" ? "~ 8.5 MB" : "~ 2.1 MB"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.downloadButton} onPress={openMockMedia}>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.downloadButtonText}>
                  Download {mediaType === "video" ? "Video" : "Foto"} (MOCK)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Format yang Didukung:</Text>
            <View style={styles.optionsList}>
              <View style={styles.optionItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.optionText}>Foto Post</Text>
              </View>
              <View style={styles.optionItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.optionText}>Video Post</Text>
              </View>
              <View style={styles.optionItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.optionText}>IGTV</Text>
              </View>
              <View style={styles.optionItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.optionText}>Reels</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#e4405f" />
            <Text style={styles.infoText}>
              Fitur ini masih dalam mode MOCK untuk development. Untuk production, 
              perlu integrasi dengan API Instagram downloader.
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
    backgroundColor: "#fce8e8",
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
    backgroundColor: "#e4405f",
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
  mediaInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    gap: 15,
  },
  mediaDetails: {
    flex: 1,
  },
  mediaName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  mediaSize: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  downloadButton: {
    backgroundColor: "#e4405f",
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
  optionsContainer: {
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  optionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 5,
  },
  optionText: {
    fontSize: 12,
    color: "#666",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#fce8e8",
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#e4405f",
    lineHeight: 18,
  },
});