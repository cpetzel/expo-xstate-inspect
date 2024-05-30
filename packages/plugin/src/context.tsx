import React, { ReactNode, createContext, useContext } from "react";
import { useXStateInspector, type Inspector } from "./useXStateInspect";
const XStateInspectContext = createContext<Inspector | null>(null);

/**
 * Provider to place at the root of your app to enable the xstate inspector.
 */
export const XStateInspectorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const inspector = useXStateInspector();

  return (
    <XStateInspectContext.Provider value={inspector}>
      {children}
    </XStateInspectContext.Provider>
  );
};

/**
 * Provides access to the xstate inspector instance.
 */
export const useProvidedXstateInspector = () => {
  const inspector = useContext(XStateInspectContext);
  return inspector;
};
