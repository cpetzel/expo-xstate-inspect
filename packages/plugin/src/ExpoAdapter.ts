import { StatelyInspectionEvent } from "@statelyai/inspect";
import { DevToolsPluginClient } from "expo/devtools";
import { ActorRefFrom, AnyActorRef, createActor } from "xstate";
import { inspectMachine } from "./machine";
import { ActorAwareAdapter } from "react-native-xstate-inspect-shared";

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
    // what if, instead of deferring events, I can reach into the system to get all of the actors, and send over their definition and latest snapshot???

    this.inspector.send({
      type: "InspectorEvent",
      event,
    });
  }
}
