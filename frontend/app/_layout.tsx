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
      router.replace("/contact");
    }
  }, [animationFinished, router]);

  return (
    <>
      <Stack>
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="contact" options={{ headerShown: false }} />
        <Stack.Screen 
          name="modals/search" 
          options={{ 
            headerShown: false,
            presentation: "modal",
            animation: "slide_from_bottom"
          }} 
        />
      </Stack>
    </>
  );
};

export default RootLayout;

/*{!animationFinished ? (
  <Animation onAnimationFinished={handleAnimationFinished} />
) : (

)} */
