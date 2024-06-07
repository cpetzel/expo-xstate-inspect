import React, { useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import DragView from "./DragResizeView";
import { XStateDebuggerWebView } from "./XStateDebuggerWebView";

export function FloatingInspector() {
  return (
    <DragView height={200} width={200} x={0} y={200}>
      <XStateDebuggerWebView onClosePress={() => console.log("close")} />
    </DragView>
  );
}
