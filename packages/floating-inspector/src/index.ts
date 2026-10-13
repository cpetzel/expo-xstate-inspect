import { WebViewAdapter } from "./WebViewAdapter";
import type { Inspector } from "react-native-xstate-inspect-core";
export * from "./FloatingInspector";
export * from "./context";
export { useFloatingXStateInspector } from "./useFloatingXstateInspector";

export type TFloatingInspector = Inspector<WebViewAdapter>;
