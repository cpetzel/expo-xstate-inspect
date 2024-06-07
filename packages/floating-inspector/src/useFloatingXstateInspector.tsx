import { createInspector } from "@statelyai/inspect";
import { useMemo } from "react";
import safeStringify from "fast-safe-stringify";

import { Inspector as XStateInspector } from "@statelyai/inspect/src/types";
import { WebViewAdapter } from "./WebViewAdapter";
import {
  InspectorOptions,
  createActorAwareInspector,
} from "xstate-floating-inspect-shared";
export type Inspector = XStateInspector<WebViewAdapter>;

export function useFloatingXStateInspector(
  options?: InspectorOptions
): Inspector | null {
  const inspector = useMemo(() => {
    const resolvedOptions = {
      filter: () => true,
      serialize: (inspectionEvent) =>
        JSON.parse(safeStringify(inspectionEvent)),
      autoStart: true,
      ...options,
    } as Required<InspectorOptions>;

    const inspector = createActorAwareInspector(
      new WebViewAdapter(),
      resolvedOptions
    );
    if (resolvedOptions.autoStart) {
      inspector.start();
    }
    return inspector;
  }, []);

  return inspector;
}
