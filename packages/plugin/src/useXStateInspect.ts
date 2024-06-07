import { useDevToolsPluginClient } from "expo/devtools";
import { useMemo } from "react";
import { ExpoAdapter } from "./ExpoAdapter";
import safeStringify from "fast-safe-stringify";

import { Inspector as XStateInspector } from "@statelyai/inspect/src/types";
import {
  InspectorOptions,
  createActorAwareInspector,
} from "xstate-floating-inspect-shared";
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

      // better yet, I could write my own Inspector... this way, I could get references to all of the actors, and then get their definitions and snapshots only when needed!!

      const inspector = createActorAwareInspector(
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
