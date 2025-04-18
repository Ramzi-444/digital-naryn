import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const CIRCLE_SIZE = width * 0.7;

interface AnimationProps {
  onAnimationFinished: (value: boolean) => void; // Assuming you want to pass a boolean argument
}

const Animation: React.FC<AnimationProps> = ({ onAnimationFinished }) => {
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;

  const dot1 = useRef(new Animated.ValueXY({ x: -10, y: -10 })).current;
  const dot2 = useRef(new Animated.ValueXY({ x: 10, y: -10 })).current;
  const dot3 = useRef(new Animated.ValueXY({ x: -10, y: 10 })).current;
  const dot4 = useRef(new Animated.ValueXY({ x: 10, y: 10 })).current;

  const dots = [dot1, dot2, dot3, dot4];
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }),
      Animated.timing(backgroundAnim, {
        toValue: 2,
        duration: 2000,
        useNativeDriver: false,
      }),
      Animated.timing(circleOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start(() => {
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setTimeout(() => animateDots(3), 200);
      });
    });
  }, []);

  const animateDots = (times: number) => {
    if (times === 0) {
      return onAnimationFinished(false);
    }

    const radius = 20;
    const duration = 1000;

    const angleSteps = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

    const orbitAnimation = angleSteps.map((angle, i) => {
      return Animated.timing(dots[i], {
        toValue: {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
        },
        duration,
        useNativeDriver: false,
      });
    });

    const toCenter = dots.map((dot) =>
      Animated.timing(dot, {
        toValue: { x: 0, y: 0 },
        duration: 400,
        useNativeDriver: false,
      })
    );

    const backToStart = dots.map((dot, i) =>
      Animated.timing(dot, {
        toValue: {
          x: Math.cos(angleSteps[i]) * radius,
          y: Math.sin(angleSteps[i]) * radius,
        },
        duration: 400,
        useNativeDriver: false,
      })
    );

    Animated.sequence([
      Animated.parallel(orbitAnimation),
      Animated.parallel(toCenter),
      Animated.delay(300),
      Animated.parallel(backToStart),
    ]).start(() => animateDots(times - 1));
  };

  const backgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ["#ffffff", "#eaf4ff", "#ffffff"],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <Animated.View
        style={[
          styles.circle,
          { opacity: circleOpacity, position: "absolute" },
        ]}
      />

      {/* Image Overlay */}
      <Animated.Image
        source={require("../assets/branding/animation.png")}
        style={[styles.circle, { opacity: imageOpacity, position: "absolute" }]}
        resizeMode="cover"
      />

      {/* Dot Orbit Container */}
      <Animated.View style={[styles.dotWrapper, { opacity: dotsOpacity }]}>
        {[dot1, dot2, dot3, dot4].map((dot, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                transform: dot.getTranslateTransform(),
              },
            ]}
          />
        ))}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    top: CIRCLE_SIZE / 2,
    backgroundColor: "#d8eaff",
  },
  dotWrapper: {
    position: "absolute",
    bottom: CIRCLE_SIZE / 2 + 40,
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
  },
  dot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#000",
  },
});

export default Animation;
