export let useXStateInspect: typeof import("./useXStateInspect").useXStateInspect;
export let XStateInspectorProvider: typeof import("./context").XStateInspectorProvider;
export let useXstateInspector: typeof import("./context").useXstateInspector;

// @ts-ignore process.env.NODE_ENV is defined by metro transform plugins
if (process.env.NODE_ENV !== "production") {
  useXStateInspect = require("./useXStateInspect").useXStateInspect;
  XStateInspectorProvider = require("./context").XStateInspectorProvider;
  useXstateInspector = require("./context").useXstateInspector;
} else {
  //@ts-ignore
  useXStateInspect = () => {};
  XStateInspectorProvider = ({ children }) => children;
  useXstateInspector = () => null;
}
