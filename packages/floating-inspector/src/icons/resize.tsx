import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";

const ResizeIcon: React.FC<{ size?: number }> = ({ size = 20 }) => {
  const backgroundColor = "grey";
  const styles = useMemo(() => {
    const diagonal = Math.sqrt(2) * size;
    return StyleSheet.create({
      container: {
        height: size,
        width: size,
        justifyContent: "center",
        alignItems: "center",
        transformOrigin: "bottom right",
      },
      line1: {
        width: diagonal,
        height: size / 8,
        backgroundColor,
        borderRadius: 10,
        position: "absolute",
        transform: [{ rotate: "-45deg" }],
      },
      line2: {
        width: diagonal / 1.6,
        height: size / 8,
        backgroundColor,
        borderRadius: 10,
        position: "absolute",
        bottom: "28%",
        left: "23%",
        transform: [{ rotate: "-45deg" }],
      },
      line3: {
        width: diagonal / 4,
        height: size / 8,
        backgroundColor,
        borderRadius: 10,
        position: "absolute",
        bottom: "10%",
        left: "66%",
        transform: [{ rotate: "-45deg" }],
      },
    });
  }, [size]);
  return (
    <View style={styles.container}>
      <View style={styles.line1} />
      <View style={styles.line2} />
      <View style={styles.line3} />
    </View>
  );
};

export default ResizeIcon;
