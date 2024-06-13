import { InspectorOptions } from "react-native-xstate-inspect-shared";

export let useXStateInspectorDevTool: typeof import("./useXStateInspect").useXStateInspectorDevTool;
export let XStateInspectorDevToolProvider: typeof import("./context").XStateInspectorDevToolProvider;
export let useProvidedXstateInspectorDevTool: typeof import("./context").useProvidedXstateInspectorDevTool;

// @ts-ignore process.env.NODE_ENV is defined by metro transform plugins
if (process.env.NODE_ENV !== "production") {
  useXStateInspectorDevTool =
    require("./useXStateInspect").useXStateInspectorDevTool;
  XStateInspectorDevToolProvider =
    require("./context").XStateInspectorDevToolProvider;
  useProvidedXstateInspectorDevTool =
    require("./context").useProvidedXstateInspectorDevTool;
} else {
  //@ts-ignore
  useXStateInspectorDevTool = () => null;
  XStateInspectorDevToolProvider = ({ children }) => children;
  useProvidedXstateInspectorDevTool = () => null;
}
interface ReactNativeInspectorOptions extends InspectorOptions {
  // TODO maybe add some flags here for filtering events? deferred events?
}
export type DevPluginInspector = ReturnType<typeof useXStateInspectorDevTool>;
