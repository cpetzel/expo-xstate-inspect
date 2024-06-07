import React, { useMemo, useRef } from "react";
import DragView from "./DragResizeView";
import { XStateDebuggerWebView } from "./XStateDebuggerWebView";

interface Props {
  onClosePress: () => void;
}

export function FloatingInspector({ onClosePress }: Props) {
  return (
    <DragView
      height={200}
      width={200}
      x={20}
      y={200}
      onClosePress={onClosePress}
    >
      <XStateDebuggerWebView />
    </DragView>
  );
}
