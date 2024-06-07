import React, { ReactNode, useEffect, useMemo, useRef } from "react";
import {
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import CloseIcon from "./icons/close";
import ResizeIcon from "./icons/resize";

const clamp = (value: number, lowerBound: number, upperBound: number) => {
  "worklet";
  return Math.min(Math.max(lowerBound, value), upperBound);
};

export type Props = {
  x: number;
  y: number;
  width: number;
  height: number;
  children: ReactNode;
  onClosePress: () => void;
};

export type OnAnimationEnd = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DragProps = {
  x: number;
  y: number;
  limitationHeight: number;
  limitationWidth: number;
  height?: number;
  width?: number;
  minHeight?: number;
  minWidth?: number;
  onDragEnd: (response: OnAnimationEnd) => void;
  onResizeEnd: (response: OnAnimationEnd) => void;
  children: any;
  resizable?: boolean;
  draggable?: boolean;
  resizerImageSource?: ImageSourcePropType;
  onClosePress: () => void;
};

function DragView(props: Props) {
  const xShared = useSharedValue(props.x);
  const yShared = useSharedValue(props.y);

  const heightShared = useSharedValue(props.height);
  const widthShared = useSharedValue(props.width);

  return (
    // @ts-ignore
    <DragAndResizeView
      onClosePress={props.onClosePress}
      height={heightShared.value}
      width={widthShared.value}
      x={xShared.value}
      y={yShared.value}
      onDragEnd={(boxPosition) => {
        xShared.value = boxPosition.x;
        yShared.value = boxPosition.y;
        heightShared.value = boxPosition.height;
        widthShared.value = boxPosition.width;
      }}
      onResizeEnd={(boxPosition) => {
        xShared.value = boxPosition.x;
        yShared.value = boxPosition.y;
        heightShared.value = boxPosition.height;
        widthShared.value = boxPosition.width;
      }}
    >
      {props.children}
    </DragAndResizeView>
  );
}

function DragAndResizeView(props: DragProps) {
  const {
    x,
    y,
    height = 100,
    width = 100,
    minHeight = height / 2,
    minWidth = width / 2,
    onDragEnd,
    onResizeEnd,
    children,
    resizable = true,
    draggable = true,
    onClosePress,
  } = props;

  const xRef = useRef(x);
  const yRef = useRef(y);
  const heightRef = useRef(height);
  const widthRef = useRef(width);
  const boxX = useSharedValue(0);
  const boxY = useSharedValue(0);
  const boxHeight = useSharedValue(heightRef.current ?? 100);
  const boxWidth = useSharedValue(widthRef.current ?? 100);

  const tempBoxHeight = useSharedValue(boxHeight.value);
  const tempBoxWidth = useSharedValue(boxWidth.value);

  const start = useSharedValue({ x, y });
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  useEffect(() => {
    boxX.value = withTiming(xRef.current);
    boxY.value = withTiming(yRef.current);
  }, [boxX, boxY]);

  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      boxX.value = e.translationX + start.value.x;
      boxY.value = e.translationY + start.value.y;
    })
    .onEnd(() => {
      if (!draggable) {
        return;
      }
      start.value = {
        x: boxX.value,
        y: boxY.value,
      };
      if (onDragEnd) {
        runOnJS(onDragEnd)({
          x: boxX.value,
          y: boxY.value,
          height: boxHeight.value,
          width: boxWidth.value,
        });
      }
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    })
    .cancelsTouchesInView(true);

  const resizeHandler = Gesture.Pan()
    .onUpdate((e) => {
      if (!resizable) {
        return;
      }
      const scaleFactor = 1 / savedScale.value;

      boxWidth.value = clamp(
        tempBoxWidth.value + e.translationX * scaleFactor,
        minWidth,
        2000
      );
      boxHeight.value = clamp(
        tempBoxHeight.value + e.translationY * scaleFactor,
        minHeight,
        2000
      );
    })
    .onEnd(() => {
      "worklet";
      tempBoxHeight.value = boxHeight.value;
      tempBoxWidth.value = boxWidth.value;

      if (onResizeEnd) {
        runOnJS(onResizeEnd)({
          x: boxX.value,
          y: boxY.value,
          height: boxHeight.value,
          width: boxWidth.value,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    // @ts-ignore
    transform: [
      {
        translateX: boxX.value,
      },
      {
        translateY: boxY.value,
      },
      { scale: scale.value },
    ],
    height: boxHeight.value,
    width: boxWidth.value,
    position: "absolute",
    flexDirection: "row",
  }));

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
          transformOrigin: "top left",
        },
        imageStyle: {
          height: 32,
          width: 32,
          transform: [{ rotate: "90deg" }],
        },
      }),
    []
  );

  const animatedResizeHandlerStyle = useAnimatedStyle(() => ({
    position: "absolute",
    zIndex: 1,
    right: 0,
    bottom: 0,
    transform: [{ scale: 1 / scale.value }],
  }));
  const animatedCloseButtonStyle = useAnimatedStyle(() => ({
    position: "absolute",
    zIndex: 1,
    right: -40 / 4,
    top: -40 / 4,
    transform: [{ scale: 1 / scale.value }],
  }));

  const composed = Gesture.Simultaneous(dragGesture, pinchGesture);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[animatedStyle, styles.container]}>
        <GestureDetector gesture={resizeHandler}>
          <Animated.View style={animatedResizeHandlerStyle}>
            <ResizeIcon />
          </Animated.View>
        </GestureDetector>
        {children}
        <TouchableOpacity onPress={onClosePress}>
          <Animated.View style={animatedCloseButtonStyle}>
            <CloseIcon />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

export default DragView;
