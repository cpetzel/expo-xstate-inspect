import { createInspector } from "@statelyai/inspect";
import { useDevToolsPluginClient } from "expo/devtools";
import { useMemo } from "react";
import { ExpoAdapter } from "./ExpoAdapter";
import safeStringify from "fast-safe-stringify";

import { Inspector as XStateInspector } from "@statelyai/inspect/src/types";
import { InspectorOptions } from ".";
export type Inspector = XStateInspector<ExpoAdapter>;

export function useXStateInspector(
  options?: InspectorOptions
): Inspector | null {
  const client = useDevToolsPluginClient("xstate-inspect");

  const inspector = useMemo(() => {
    if (client) {
      const resolvedOptions = {
        filter: () => true,
        serialize: (inspectionEvent) =>
          JSON.parse(safeStringify(inspectionEvent)),
        autoStart: true,
        ...options,
      } as Required<InspectorOptions>;
      const inspector = createInspector(
        new ExpoAdapter(client),
        resolvedOptions
      );
      if (resolvedOptions.autoStart) {
        inspector.start();
      }
      return inspector;
    }
    return null;
  }, [client]);

  return inspector;
}
