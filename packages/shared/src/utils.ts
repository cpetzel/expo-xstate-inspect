import safeStringify from "safe-stable-stringify";
import { AnyActorRef } from "xstate";
import type { StatelyActorEvent } from "@statelyai/inspect";

// @statelyai/inspect does not export package.json, so keep the version here
export const INSPECT_VERSION = "0.7.2";

const replacer = (_key: string, value: any) =>
  typeof value === "function" ? { type: value.name } : value;

function getRoot(actorRef: AnyActorRef) {
  let marker: AnyActorRef | undefined = actorRef;

  do {
    marker = marker._parent;
  } while (marker?._parent);

  return marker;
}

function getRootId(actorRefOrId: AnyActorRef | string): string | undefined {
  const rootActorRef =
    typeof actorRefOrId === "string"
      ? undefined
      : getRoot(actorRefOrId)?.sessionId;

  return rootActorRef ?? undefined;
}

export function convertActorToStatelyEvent(actorRef: AnyActorRef) {
  const snapshot = actorRef.getSnapshot();

  if (snapshot.status !== "active") {
    return;
  }

  const sessionId =
    typeof actorRef === "string" ? actorRef : actorRef.sessionId;
  const definitionObject = (actorRef as any)?.logic?.config;
  const definition = definitionObject
    ? safeStringify(definitionObject)
    : undefined;
  const rootId =
    /*  info?.rootId ?? */ typeof actorRef === "string"
      ? undefined
      : getRootId(actorRef);
  const parentId =
    /*  info?.parentId ??  */ typeof actorRef === "string"
      ? undefined
      : actorRef._parent?.sessionId;
  const name = definitionObject ? definitionObject.id : sessionId;

  return {
    type: "@xstate.actor",
    name,
    sessionId,
    createdAt: Date.now().toString(),
    _version: INSPECT_VERSION,
    rootId,
    parentId,
    id: null as any,
    definition,
    // plain JSON so replayed events survive any transport (circular refs, fns, actor refs)
    snapshot: JSON.parse(safeStringify(snapshot, replacer) ?? "null") ?? {
      status: "active",
    },
  } satisfies StatelyActorEvent;
}
