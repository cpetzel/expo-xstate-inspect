import type { StatelyInspectionEvent } from "@statelyai/inspect";
import type {
  ActorRefLike,
  AnyActorRef,
  AnyEventObject,
  Observer,
  InspectionEvent,
} from "xstate";

export type { StatelyInspectionEvent };

/** An adapter receives the inspection events and ships them somewhere */
export interface Adapter {
  start?: () => void;
  stop?: () => void;
  send(event: StatelyInspectionEvent): void;
}

type InspectedSnapshot = {
  status?: string;
  context?: any;
  value?: any;
  output?: any;
};

/** The inspector returned by `createActorAwareInspector` */
export interface Inspector<TAdapter extends Adapter> {
  adapter: TAdapter;
  snapshot(
    actor: ActorRefLike | string,
    snapshot: InspectedSnapshot,
    info?: { event?: AnyEventObject }
  ): void;
  event(
    actor: ActorRefLike | string,
    event: AnyEventObject | string,
    info?: { source?: ActorRefLike | string }
  ): void;
  actor(
    actor: ActorRefLike | string,
    snapshot?: InspectedSnapshot,
    info?: { definition?: string; parentId?: string; rootId?: string }
  ): void;
  start: () => void;
  stop: () => void;
  /** Observer to pass as the `inspect` option when creating actors */
  inspect: Observer<InspectionEvent>;
}

export interface InspectorOptions {
  filter?: (event: StatelyInspectionEvent) => boolean;
  serialize?: (event: StatelyInspectionEvent) => StatelyInspectionEvent;
  /** Whether to automatically start the inspector. @default true */
  autoStart?: boolean;
  /** Maximum depth for serialization. @default 10 */
  serializationDepthLimit?: number;
  /** Sanitizes events sent to the inspector */
  sanitizeEvent?: (event: AnyEventObject) => AnyEventObject;
  /** Sanitizes actor snapshot context sent to the inspector */
  sanitizeContext?: (context: any) => any;
}

export { createActorAwareInspector } from "./createInspector";
export { convertActorToStatelyEvent } from "./utils";

export {
  createSkyInspector,
  type TSkyInspector,
  useSkyXstateInspector,
  useProvidedSkyInspector,
  SkyInspectorProvider,
} from "./sky";

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
      inspectors.forEach((i) => i.inspect.error?.(err));
    },
    complete: () => {
      inspectors.forEach((i) => i.inspect.complete?.());
    },
  };
}
