import type { InspectorOptions } from ".";
import { Inspector } from "@statelyai/inspect/src/types";

import { createActorAwareInspector } from "./createInspector";
import { PartySocketAdapter } from "./PartySocketAdapter";
import React, { ReactNode, createContext, useContext, useMemo } from "react";
import safeStringify from "fast-safe-stringify";

export function useSkyXstateInspector(options: SkyOptions = {}): TSkyInspector {
  const inspector = useMemo(() => {
    const resolvedOptions = {
      filter: () => true,
      serialize: (inspectionEvent) =>
        JSON.parse(safeStringify(inspectionEvent)),
      autoStart: true,
      ...options,
    } as Required<SkyOptions>;

    const inspector = createSkyInspector(options);
    if (resolvedOptions.autoStart) {
      inspector.start();
    }
    return inspector;
  }, []);

  return inspector;
}

const SkyInspectContext = createContext<TSkyInspector>(null);

/**
 * Provider to place at the root of your app to enable the sky xstate inspector.
 */
export const SkyInspectorProvider: React.FC<{
  children: ReactNode;
  options: SkyOptions;
}> = ({ children, options = {} }) => {
  const inspector = useSkyXstateInspector(options);

  return (
    <SkyInspectContext.Provider value={inspector}>
      {children}
    </SkyInspectContext.Provider>
  );
};

/**
 * Provides access to the sky xstate inspector instance.
 */
export const useProvidedSkyInspector = () => {
  return useContext(SkyInspectContext);
};

export type TSkyInspector = Inspector<PartySocketAdapter>;

export type SkyOptions = {
  onerror?: (error: Error) => void;
  onSkyConnect?: (url: string) => void;
} & InspectorOptions;

export function createSkyInspector(options: SkyOptions = {}): TSkyInspector {
  const { autoStart = true, onSkyConnect, ...coreOptions } = options;
  const inspector = createActorAwareInspector(
    new PartySocketAdapter(onSkyConnect),
    coreOptions
  );

  return inspector;
}
