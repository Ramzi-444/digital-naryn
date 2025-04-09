import { Stack, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import Animation from "./animaiton";

const RootLayout = () => {
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
        <Stack>
          <Stack.Screen name="dashboard" options={{ headerShown: false }} />
          {/* Add other screens in your stack here */}
        </Stack>
      )}
    </>
  );
};

export default RootLayout;