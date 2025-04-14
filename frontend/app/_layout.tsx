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
      {/* {!animationFinished ? (
        <Animation onAnimationFinished={handleAnimationFinished} />
      ) : ( */}
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            animationDuration: 200,
            gestureEnabled: true,
            gestureDirection: "horizontal",
            fullScreenGestureEnabled: true,
            contentStyle: {
              backgroundColor: "#fff",
            },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="contact" />
          <Stack.Screen
            name="modals/search"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
              animationDuration: 200,
              gestureEnabled: true,
              gestureDirection: "vertical",
            }}
          />
          <Stack.Screen
            name="categories/[id]"
            options={{
              animation: "slide_from_right",
              animationDuration: 200,
              gestureEnabled: true,
              gestureDirection: "horizontal",
            }}
          />
          <Stack.Screen
            name="items/[id]"
            options={{
              animation: "slide_from_right",
              animationDuration: 200,
              gestureEnabled: true,
              gestureDirection: "horizontal",
            }}
          />
          <Stack.Screen
            name="photos/gallery"
            options={{
              animation: "fade",
              animationDuration: 200,
              gestureEnabled: true,
              gestureDirection: "vertical",
            }}
          />
        </Stack>
       {/* )}  */}
    </>
  );
}
