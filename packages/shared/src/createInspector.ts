import { ActorAwareAdapter, InspectorOptions } from "./";
import type { StatelyInspectionEvent } from "@statelyai/inspect/src/types";
import { Inspector } from "@statelyai/inspect/src/types";
import { idleCallback } from "@statelyai/inspect/src/idleCallback";
import {
  convertXStateEvent,
  createInspector,
} from "@statelyai/inspect/src/createInspector";
// import pkg from "@statelyai/inspect/package.json";
import { InspectionEvent, Observer } from "xstate";

export function createActorAwareInspector<TAdapter extends ActorAwareAdapter>(
  adapter: TAdapter,
  options?: InspectorOptions
): Inspector<TAdapter> {
  const statelyInspector = createInspector(adapter, options);

  // copied from their inspector
  function sendAdapter(event: StatelyInspectionEvent): void {
    if (options?.filter && !options.filter(event)) {
      // Event filtered out
      return;
    }
    const serializedEvent = options?.serialize?.(event) ?? event;
    // idleCallback(() => {
    adapter.send(serializedEvent);
    // })
  }

  // override their inspect method to catch the actorRef
  statelyInspector.inspect = {
    next: (event) => {
      idleCallback(function inspectNext() {
        const convertedEvent = convertXStateEvent(event);
        if (event.type === "@xstate.actor") {
          adapter.handleNewActor(event.actorRef);
        }
        if (convertedEvent) {
          sendAdapter(convertedEvent);
        }
      });
    },
  } as Observer<InspectionEvent>;

  return statelyInspector;
}
