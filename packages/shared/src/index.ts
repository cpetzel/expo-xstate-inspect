import {
  StatelyInspectionEvent,
  Adapter,
  Inspector,
} from "@statelyai/inspect/src/types";
import { AnyActorRef, Observer, InspectionEvent } from "xstate";

export { createActorAwareInspector } from "./createInspector";

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

/**
 * Special Adapter that gets notified whenever an actor is created
 * (not just the actor inspect events, but the actor ref itself)
 */
export interface ActorAwareAdapter extends Adapter {
  handleNewActor: (actorRef: AnyActorRef) => void;
}

export function isEventObject(event: unknown) /*:  event is AnyEventObject */ {
  return (
    typeof event === "object" &&
    event !== null &&
    typeof (event as any).type === "string"
  );
}

export function getRoot(actorRef: AnyActorRef) {
  let marker: AnyActorRef | undefined = actorRef;

  do {
    marker = marker._parent;
  } while (marker?._parent);

  return marker;
}

export function getRootId(
  actorRefOrId: AnyActorRef | string
): string | undefined {
  const rootActorRef =
    typeof actorRefOrId === "string"
      ? undefined
      : getRoot(actorRefOrId)?.sessionId;

  return rootActorRef ?? undefined;
}

/**
 * Combines multiple inspectors into one
 */
export function combineObservers(
  inspectors: Array<Inspector<any>>
): Observer<InspectionEvent> {
  return {
    next: (value: InspectionEvent) => {
      inspectors.forEach((i) => i.inspect.next(value));
    },
    error: (err: any) => {
      inspectors.forEach((i) => i.inspect.error(err));
    },
    complete: () => {
      inspectors.forEach((i) => i.inspect.complete());
    },
  };
}
