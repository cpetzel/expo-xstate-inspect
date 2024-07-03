import React, { ReactNode, createContext, useContext } from "react";
import { useXStateInspectorDevTool, type Inspector } from "./useXStateInspect";
import { InspectorOptions } from "react-native-xstate-inspect-core";
const XStateInspectContext = createContext<Inspector | null>(null);

/**
 * Provider to place at the root of your app to enable the xstate inspector.
 */
export const XStateInspectorDevToolProvider: React.FC<{
  children: ReactNode;
  options?: InspectorOptions;
}> = ({ children, options }) => {
  const inspector = useXStateInspectorDevTool(options);

  return (
    <XStateInspectContext.Provider value={inspector}>
      {children}
    </XStateInspectContext.Provider>
  );
};

/**
 * Provides access to the xstate inspector instance.
 */
export const useProvidedXstateInspectorDevTool = () => {
  const inspector = useContext(XStateInspectContext);
  return inspector;
};
