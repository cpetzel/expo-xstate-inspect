import { createInspector } from "@statelyai/inspect";
import { useDevToolsPluginClient } from "expo/devtools";
import { useMemo } from "react";
import { ExpoAdapter } from "./ExpoAdapter";
import { Inspector as XStateInspector } from "@statelyai/inspect/src/types";
export type Inspector = XStateInspector<ExpoAdapter>;

export function useXStateInspect(): Inspector | null {
  const client = useDevToolsPluginClient("xstate-inspect");

  const inspector = useMemo(() => {
    if (client) {
      const inspector = createInspector(new ExpoAdapter(client));
      inspector.start();
      return inspector;
    }
    return null;
  }, [client]);

  return inspector;
}
