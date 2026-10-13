import { useMemo } from "react";
import safeStringify from "fast-safe-stringify";

import type { Inspector as XStateInspector } from "react-native-xstate-inspect-core";
import { WebViewAdapter } from "./WebViewAdapter";
import {
  InspectorOptions,
  createActorAwareInspector,
} from "react-native-xstate-inspect-core";
export type Inspector = XStateInspector<WebViewAdapter>;

export function useFloatingXStateInspector(
  options?: InspectorOptions
): Inspector {
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
