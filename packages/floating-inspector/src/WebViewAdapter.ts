import { StatelyInspectionEvent, StatelyActorEvent } from "@statelyai/inspect";
import pkg from "@statelyai/inspect/package.json";
import WebView from "react-native-webview";
import { WebViewRegistry, WebViewAddedListener } from "./WebViewRegistry";
import { RefObject } from "react";
import { AnyActorRef } from "xstate";
import {
  ActorAwareAdapter,
  getRootId,
  isEventObject,
} from "xstate-floating-inspect-shared";
import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";
import safeStringify from "safe-stable-stringify";

// TODO move this logic to a machine? like the plugin?
export class WebViewAdapter implements ActorAwareAdapter, WebViewAddedListener {
  private currentWebViewRef?: RefObject<WebView<{}>> = undefined;
  private currentEventEmitter?: EventEmitter = undefined;

  private actorMap: Map<string, AnyActorRef> = new Map();

  /**
   * The inspector hands us the raw actor ref, and also will hand us the same StatelyActorEvent in the send function below
   */
  handleNewActor(actorRef: AnyActorRef) {
    console.log(
      "🚀 ~ WebViewAdapter ~ handleNewActor ~ actorRef:",
      actorRef.id
    );
    // always cache every actor ref... so if the inspector view is mounted, unmounted, and mounted again, we can send over all snapshots and definitions
    this.actorMap.set(actorRef.id, actorRef);
  }

  onWebViewAdded(
    webViewRef: RefObject<WebView<{}>>,
    eventEmitter: EventEmitter
  ) {
    console.log(
      "🚀 ~ WebViewAdapter ~ onWebViewAdded ~ webViewRef",
      webViewRef
    );

    this.currentWebViewRef = webViewRef;
    this.currentEventEmitter = eventEmitter;

    this.currentEventEmitter.addListener("message", (data: any) => {
      console.log("🚀 ~ WebViewAdapter ~ event from webviw ~ data:", data);

      if (!isEventObject(data)) {
        console.error(
          "🚀 ~ WebViewAdapter ~ event from webviw ~ data is not an event object"
        );
        return;
      }
      // TODO or xstate.inspecting ?
      if (data.type === "@statelyai.connected") {
        // send all actor and snapthos
        this.actorMap.forEach((actorRef) => {
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

          const snapshot = actorRef.getSnapshot();
          const actorEvent = {
            type: "@xstate.actor",
            name,
            sessionId,
            createdAt: Date.now().toString(),
            _version: pkg.version,
            rootId,
            parentId,
            id: null as any,
            definition,
            snapshot: snapshot ?? { status: "active" },
          } satisfies StatelyActorEvent;
          console.log(
            "🚀 ~ WebViewAdapter ~ this.actorMap.forEach ~ SENDING ACTOR:",
            actorEvent
          );

          this.send(actorEvent);
        });
      }
    });
  }

  public start() {
    // console.log("🚀 ~ WebViewAdapter ~ start");
    WebViewRegistry.addOnWebViewListener(this);
  }

  public stop() {
    // console.log("🚀 ~ WebViewAdapter ~ stop");
    this.currentEventEmitter?.removeAllListeners();
    this.currentEventEmitter = undefined;
    WebViewRegistry.removeOnWebViewListener(this);
  }

  public send(event: StatelyInspectionEvent) {
    // console.log("🚀 ~ WebViewAdapter ~ send ~ event:", event);
    if (
      this.currentWebViewRef?.current === null ||
      this.currentWebViewRef?.current === undefined
    ) {
      console.log("🚀 ~ WebViewAdapter ~ send ~ NO WEB VIEW YET!!!");
      return;
    }

    this.currentWebViewRef?.current?.injectJavaScript(`
    (function(){
      window.ogPost(${JSON.stringify(event)}, '*');
    })();
    true;
`);
  }
}
