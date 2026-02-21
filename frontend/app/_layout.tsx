import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useAuthStore } from "../src/store/authStore";

export default function RootLayout() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#6366f1",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: "Xriepv1",
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            title: "Login",
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="admin-dashboard" 
          options={{ 
            title: "Admin Dashboard",
            headerLeft: () => null
          }} 
        />
        <Stack.Screen 
          name="user-home" 
          options={{ 
            title: "Xriepv1",
            headerLeft: () => null
          }} 
        />
        <Stack.Screen 
          name="request-nomor" 
          options={{ 
            title: "Request Nomor" 
          }} 
        />
        <Stack.Screen 
          name="request-list" 
          options={{ 
            title: "Daftar Request" 
          }} 
        />
        <Stack.Screen 
          name="tiktok-downloader" 
          options={{ 
            title: "TikTok Downloader" 
          }} 
        />
        <Stack.Screen 
          name="instagram-downloader" 
          options={{ 
            title: "Instagram Downloader" 
          }} 
        />
      </Stack>
    </>
  );
}