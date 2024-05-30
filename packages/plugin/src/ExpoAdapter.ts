import { StatelyInspectionEvent } from "@statelyai/inspect";
import { Adapter } from "@statelyai/inspect/src/types";
import { DevToolsPluginClient } from "expo/devtools";
import { ActorRefFrom, createActor } from "xstate";
import { inspectMachine } from "./machine";

export function isEventObject(event: unknown) /*:  event is AnyEventObject */ {
  return (
    typeof event === "object" &&
    event !== null &&
    typeof (event as any).type === "string"
  );
}

export class ExpoAdapter implements Adapter {
  private inspector: ActorRefFrom<typeof inspectMachine>;

  constructor(client: DevToolsPluginClient) {
    this.inspector = createActor(inspectMachine, {
      input: {
        client,
      },
    }).start();

    /*  this.inspector.subscribe((state) => {
      console.log("🚀 ~ ExpoAdapter ~ state::: ", JSON.stringify(state.value));
    }); */
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
