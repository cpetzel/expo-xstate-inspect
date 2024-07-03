import { StatelyInspectionEvent } from "@statelyai/inspect";
import { ActorRefFrom, AnyActorRef, createActor } from "xstate";
import { inspectMachine } from "./machine";
import { ActorAwareAdapter } from "react-native-xstate-inspect-core";

export class ExpoAdapter implements ActorAwareAdapter {
  private inspector: ActorRefFrom<typeof inspectMachine>;

  constructor() {
    this.inspector = createActor(inspectMachine).start();
  }

  handleNewActor(actorRef: AnyActorRef) {
    this.inspector.send({
      type: "NewActor",
      actorRef,
    });
  }

  public start() {
    // console.log("ExpoAdapter -start");
    this.inspector.send({ type: "Start" });
  }

  public stop() {
    // console.log("🚀 ~ ExpoAdapter ~ stop");
    this.inspector.send({ type: "Stop" });
  }

  public send(event: StatelyInspectionEvent) {
    this.inspector.send({
      type: "InspectorEvent",
      event,
    });
  }
}
