import { useDevToolsPluginClient } from "expo/devtools";
import { useMemo } from "react";
import { ExpoAdapter } from "./ExpoAdapter";
import safeStringify from "fast-safe-stringify";

import { Inspector as XStateInspector } from "@statelyai/inspect/src/types";
import {
  InspectorOptions,
  createActorAwareInspector,
} from "react-native-xstate-inspect-shared";

export type Inspector = XStateInspector<ExpoAdapter>;

export function useXStateInspectorDevTool(
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
      new ExpoAdapter(),
      resolvedOptions
    );
    if (resolvedOptions.autoStart) {
      inspector.start();
    }
    return inspector;
  }, []);

  return inspector;
}
