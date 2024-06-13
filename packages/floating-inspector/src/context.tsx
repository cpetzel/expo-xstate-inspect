import React, { ReactNode, createContext, useContext } from "react";
import {
  Inspector,
  useFloatingXStateInspector,
} from "./useFloatingXstateInspector";

const FloatingXStateInspectContext = createContext<Inspector>(null);

/**
 * Provider to place at the root of your app to enable the floating xstate inspector.
 */
export const FloatingXStateInspectorProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const inspector = useFloatingXStateInspector();

  return (
    <FloatingXStateInspectContext.Provider value={inspector}>
      {children}
    </FloatingXStateInspectContext.Provider>
  );
};

/**
 * Provides access to the xstate inspector instance.
 */
export const useProvidedXstateFloatingInspector = () => {
  const inspector = useContext(FloatingXStateInspectContext);
  return inspector;
};
