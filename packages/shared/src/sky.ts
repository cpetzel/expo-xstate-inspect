import type { InspectorOptions } from "./";
import { Inspector } from "@statelyai/inspect/src/types";

import { createActorAwareInspector } from "./createInspector";
import { PartySocketAdapter } from "./PartySocketAdapter";

export type TSkyInspector = Inspector<PartySocketAdapter>;

// TODO make these match the OG params... so I can update easily
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
