import safeStableStringify from "safe-stable-stringify";
import type {
  ActorRefLike,
  AnyActorRef,
  AnyEventObject,
  InspectionEvent,
  Observer,
} from "xstate";
import type {
  ActorAwareAdapter,
  Inspector,
  InspectorOptions,
  StatelyInspectionEvent,
} from "./";
import { INSPECT_VERSION } from "./utils";

/**
 * React Native friendly port of `createInspector` from @statelyai/inspect.
 *
 * The upstream package resolves to a node-only build under Metro
 * (`#uuid` -> `node:crypto`), so we keep our own implementation and only use
 * upstream for types. It also hands the adapter the raw actor ref (not just the
 * serialized actor event) so adapters can replay every active actor when an
 * inspector connects late.
 */

const DEFAULT_DEPTH_LIMIT = 10;
const DEFAULT_OPTIONS = {
  filter: () => true,
  serialize: (event: StatelyInspectionEvent) => event,
  autoStart: true,
  serializationDepthLimit: DEFAULT_DEPTH_LIMIT,
  sanitizeEvent: (event: AnyEventObject) => event,
  sanitizeContext: (context: any) => context,
};

function safeReplacer(_key: string, value: any) {
  if (typeof value === "function") {
    return { type: value.name };
  }
  return value;
}

function getRootId(actorRef: ActorRefLike & { _parent?: any }) {
  let marker: any = actorRef;
  do {
    marker = marker._parent;
  } while (marker?._parent);
  return marker?.sessionId as string | undefined;
}

const toEventObject = (event: AnyEventObject | string): AnyEventObject =>
  typeof event === "string" ? { type: event } : event;

export function createActorAwareInspector<TAdapter extends ActorAwareAdapter>(
  adapter: TAdapter,
  options: InspectorOptions = {}
): Inspector<TAdapter> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const stringify = safeStableStringify.configure({
    maximumDepth: opts.serializationDepthLimit,
  });

  function sendAdapter(inspectionEvent: StatelyInspectionEvent) {
    if (!opts.filter(inspectionEvent)) return;

    const event: any = { ...inspectionEvent };
    if (event.type === "@xstate.actor" || event.type === "@xstate.snapshot") {
      event.snapshot = {
        ...event.snapshot,
        context: opts.sanitizeContext(event.snapshot?.context),
      };
    }
    if (event.type === "@xstate.event" || event.type === "@xstate.snapshot") {
      event.event = opts.sanitizeEvent(event.event);
    }
    adapter.send(opts.serialize(event) ?? event);
  }

  const base = {
    _version: INSPECT_VERSION,
    id: null as any,
  };

  function convert(inspectionEvent: InspectionEvent) {
    switch (inspectionEvent.type) {
      case "@xstate.actor": {
        const actorRef = inspectionEvent.actorRef as AnyActorRef;
        const definitionObject = (actorRef as any).logic?.config;
        let name = actorRef.id;
        if (name === actorRef.sessionId && definitionObject) {
          name = definitionObject.id;
        }
        return {
          ...base,
          type: "@xstate.actor",
          name,
          definition: stringify(definitionObject ?? { id: name }, safeReplacer),
          createdAt: Date.now().toString(),
          rootId: inspectionEvent.rootId,
          parentId: actorRef._parent?.sessionId,
          sessionId: actorRef.sessionId,
          snapshot: actorRef.getSnapshot(),
        } as StatelyInspectionEvent;
      }
      case "@xstate.event":
        return {
          ...base,
          type: "@xstate.event",
          event: inspectionEvent.event,
          sourceId: inspectionEvent.sourceRef?.sessionId,
          sessionId: inspectionEvent.actorRef.sessionId,
          createdAt: Date.now().toString(),
          rootId: inspectionEvent.rootId,
        } as StatelyInspectionEvent;
      case "@xstate.snapshot":
        return {
          ...base,
          type: "@xstate.snapshot",
          event: inspectionEvent.event,
          snapshot: JSON.parse(
            stringify(inspectionEvent.snapshot, safeReplacer) ?? "null"
          ),
          sessionId: inspectionEvent.actorRef.sessionId,
          createdAt: Date.now().toString(),
          rootId: inspectionEvent.rootId,
        } as StatelyInspectionEvent;
      default:
        return undefined;
    }
  }

  const inspect: Observer<InspectionEvent> = {
    next: (event) => {
      // let xstate finish its current microstep before we read snapshots
      setTimeout(() => {
        if (event.type === "@xstate.actor") {
          adapter.handleNewActor(event.actorRef as AnyActorRef);
        }
        const converted = convert(event);
        if (converted) sendAdapter(converted);
      }, 0);
    },
    error: () => {},
    complete: () => {},
  };

  return {
    adapter,
    inspect,
    start: () => adapter.start?.(),
    stop: () => adapter.stop?.(),
    actor: (actorRef, snapshot, info) => {
      const ref = actorRef as any;
      const sessionId = typeof ref === "string" ? ref : ref.sessionId;
      const definitionObject = ref?.logic?.config;
      sendAdapter({
        ...base,
        type: "@xstate.actor",
        name: definitionObject ? definitionObject.id : sessionId,
        sessionId,
        createdAt: Date.now().toString(),
        rootId: info?.rootId ?? (typeof ref === "string" ? undefined : getRootId(ref)),
        parentId: info?.parentId ?? (typeof ref === "string" ? undefined : ref._parent?.sessionId),
        definition: definitionObject
          ? stringify(definitionObject, safeReplacer)
          : undefined,
        snapshot: snapshot ?? { status: "active" },
      } as StatelyInspectionEvent);
    },
    event: (target, event, info) => {
      const t = target as any;
      sendAdapter({
        ...base,
        type: "@xstate.event",
        sourceId: !info?.source
          ? undefined
          : typeof info.source === "string"
          ? info.source
          : info.source.sessionId,
        sessionId: typeof t === "string" ? t : t.sessionId,
        event: toEventObject(event),
        id: Math.random().toString(),
        createdAt: Date.now().toString(),
        rootId: "anonymous",
      } as StatelyInspectionEvent);
    },
    snapshot: (actor, snapshot, info) => {
      const a = actor as any;
      sendAdapter({
        ...base,
        type: "@xstate.snapshot",
        snapshot: { status: "active", ...snapshot },
        event: info?.event ?? { type: "" },
        sessionId: typeof a === "string" ? a : a.sessionId,
        createdAt: Date.now().toString(),
        rootId: "anonymous",
      } as StatelyInspectionEvent);
    },
  };
}
