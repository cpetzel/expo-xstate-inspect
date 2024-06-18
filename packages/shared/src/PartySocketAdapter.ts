import { ActorAwareAdapter } from "./";
import { ActorRefFrom, AnyActorRef, createActor } from "xstate";
import { inspectMachine } from "./sky-machine";
import { StatelyInspectionEvent } from "@statelyai/inspect/src/types";

export class PartySocketAdapter implements ActorAwareAdapter {
  private inspector: ActorRefFrom<typeof inspectMachine>;

  constructor(onSkyConnect?: (url: string) => void) {
    this.inspector = createActor(inspectMachine, {
      input: { onSkyConnect },
    }).start();
  }

  handleNewActor(actorRef: AnyActorRef) {
    this.inspector.send({
      type: "NewActor",
      actorRef,
    });
  }

  public start() {
    this.inspector.send({ type: "Start" });
  }

  public stop() {
    this.inspector.send({ type: "Stop" });
  }

  public send(event: StatelyInspectionEvent) {
    this.inspector.send({
      type: "InspectorEvent",
      event,
    });
  }
}
