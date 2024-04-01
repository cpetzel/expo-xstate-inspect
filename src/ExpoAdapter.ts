import { StatelyInspectionEvent } from "@statelyai/inspect";
import { Adapter } from "@statelyai/inspect/src/types";
import { DevToolsPluginClient } from "expo/devtools";
import safeStringify from "fast-safe-stringify";

export function isEventObject(event: unknown) /*:  event is AnyEventObject */ {
  return (
    typeof event === "object" &&
    event !== null &&
    typeof (event as any).type === "string"
  );
}

export class ExpoAdapter implements Adapter {
  private deferredEvents: StatelyInspectionEvent[] = [];
  client: DevToolsPluginClient;

  constructor(client: DevToolsPluginClient) {
    this.client = client;
  }
  public start() {
    this.client.addMessageListener("@stately.connected", (data) => {
      this.deferredEvents.forEach((event) => {
        // TODO move this to the options
        const serializedEvent = JSON.parse(
          safeStringify(event)
        ) as StatelyInspectionEvent;
        this.client.sendMessage("event", serializedEvent);
      });
    });
  }
  public stop() {
    // console.log("ExpoAdapter -stop");
    // this.client.sendMessage("ExpoInspectorStopped", {});
  }
  public send(event: StatelyInspectionEvent) {
    // TODO handle filtering
    // const shouldSendEvent = this.options.filter(event);
    // if (!shouldSendEvent) {
    //      return;
    // }

    const serializedEvent = JSON.parse(
      safeStringify(event)
    ) as StatelyInspectionEvent;

    if (this.client.isConnected()) {
      this.client.sendMessage("event", serializedEvent);
    }
    console.log("test");
    // for now we always defer the events so if the webpage is refreshed, the web inspector can receive all of the actor and events
    // without this, the website would error because it doesn't know the actor config json (when they are created)
    // this.deferredEvents.push(serializedEvent);
  }
}
