import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="contact" />
      <Stack.Screen 
        name="modals/search" 
        options={{ 
          presentation: "modal",
          animation: "slide_from_bottom"
        }} 
      />
      <Stack.Screen name="items/[id]" />
      <Stack.Screen name="photos/gallery" />
    </Stack>
  );
}
