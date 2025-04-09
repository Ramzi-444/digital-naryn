import { useEffect } from "react";
import { router } from "expo-router";

export default function StartHere() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/index");
    }, 100); // small delay to wait for layout to mount

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
