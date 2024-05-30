import { StatelyInspectionEvent } from "@statelyai/inspect/src/types";

export let useXStateInspector: typeof import("./useXStateInspect").useXStateInspector;
export let XStateInspectorProvider: typeof import("./context").XStateInspectorProvider;
export let useProvidedXstateInspector: typeof import("./context").useProvidedXstateInspector;

// @ts-ignore process.env.NODE_ENV is defined by metro transform plugins
if (process.env.NODE_ENV !== "production") {
  useXStateInspector = require("./useXStateInspect").useXStateInspector;
  XStateInspectorProvider = require("./context").XStateInspectorProvider;
  useProvidedXstateInspector = require("./context").useProvidedXstateInspector;
} else {
  //@ts-ignore
  useXStateInspector = () => null;
  XStateInspectorProvider = ({ children }) => children;
  useProvidedXstateInspector = () => null;
}

interface ReactNativeInspectorOptions extends InspectorOptions {
  // TODO maybe add some flags here for filtering events? deferred events?
}

export interface InspectorOptions {
  filter?: (event: StatelyInspectionEvent) => boolean;
  serialize?: (event: StatelyInspectionEvent) => StatelyInspectionEvent;
  /**
   * Whether to automatically start the inspector.
   *
   * @default true
   */
  autoStart?: boolean;
}
