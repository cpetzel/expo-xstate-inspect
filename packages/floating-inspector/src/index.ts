import { WebViewAdapter } from "./WebViewAdapter";
import { Inspector } from "@statelyai/inspect/src/types";
export * from "./FloatingInspector";
export * from "./context";
export { useFloatingXStateInspector } from "./useFloatingXstateInspector";

export type TFloatingInspector = Inspector<WebViewAdapter>;
