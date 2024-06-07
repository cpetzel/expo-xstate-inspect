import React from "react";
import { View, StyleSheet } from "react-native";

const CloseIcon = ({
  size = 32,
  backgroundColor = "#d9534f",
  xColor = "white",
}) => {
  const circleSize = size;
  const lineThickness = size / 8;

  return (
    <View style={[styles.container, { width: circleSize, height: circleSize }]}>
      <View
        style={[
          styles.circle,
          {
            backgroundColor,
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
          },
        ]}
      />
      <View
        style={[
          styles.line,
          styles.line1,
          {
            backgroundColor: xColor,
            width: circleSize * 0.7,
            height: lineThickness,
          },
        ]}
      />
      <View
        style={[
          styles.line,
          styles.line2,
          {
            backgroundColor: xColor,
            width: circleSize * 0.7,
            height: lineThickness,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  shadow: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  circle: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  line: {
    position: "absolute",
  },
  line1: {
    transform: [{ rotate: "45deg" }],
  },
  line2: {
    transform: [{ rotate: "-45deg" }],
  },
});

export default CloseIcon;
