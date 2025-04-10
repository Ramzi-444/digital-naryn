import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import Animation from "./animation";

export default function RootLayout() {
  const [animationFinished, setAnimationFinished] = useState(false);
  const router = useRouter();

  const handleAnimationFinished = () => {
    setAnimationFinished(true);
  };

  useEffect(() => {
    if (animationFinished) {
      router.replace("/dashboard"); // Use replace to prevent going back to the animation
    }
  }, [animationFinished, router]);

  return (
    <>
      {!animationFinished ? (
        <Animation onAnimationFinished={handleAnimationFinished} />
      ) : (
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
      )}
    </>
  );
}
