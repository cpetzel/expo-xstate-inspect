import React from "react";
import DragView from "./DragResizeView";
import { XStateDebuggerWebView } from "./XStateDebuggerWebView";

interface Props {
  onClosePress: () => void;
}

export function FloatingInspector({ onClosePress }: Props) {
  return (
    <DragView
      height={250}
      width={250}
      x={20}
      y={50}
      onClosePress={onClosePress}
    >
      <XStateDebuggerWebView />
    </DragView>
  );
}
