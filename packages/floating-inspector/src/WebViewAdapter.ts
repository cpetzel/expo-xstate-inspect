import type { StatelyInspectionEvent } from "react-native-xstate-inspect-core";
import WebView from "react-native-webview";
import { WebViewRegistry, WebViewAddedListener } from "./WebViewRegistry";
import { RefObject } from "react";
import { AnyActorRef } from "xstate";
import {
  ActorAwareAdapter,
  convertActorToStatelyEvent,
  isEventObject,
} from "react-native-xstate-inspect-core";
import { EventEmitter } from "./EventEmitter";

// TODO move this logic to a machine? like the plugin?
export class WebViewAdapter implements ActorAwareAdapter, WebViewAddedListener {
  private currentWebViewRef?: RefObject<WebView<{}>> = undefined;
  private currentEventEmitter?: EventEmitter = undefined;

  private actorMap: Map<string, AnyActorRef> = new Map();

  /**
   * The inspector hands us the raw actor ref, and also will hand us the same StatelyActorEvent in the send function below
   */
  handleNewActor(actorRef: AnyActorRef) {
    // console.log(
    //   "🚀 ~ WebViewAdapter ~ handleNewActor ~ actorRef:",
    //   actorRef.id
    // );
    // always cache every actor ref... so if the inspector view is mounted, unmounted, and mounted again, we can send over all snapshots and definitions
    this.actorMap.set(actorRef.id, actorRef);
  }

  onWebViewAdded(
    webViewRef: RefObject<WebView<{}>>,
    eventEmitter: EventEmitter
  ) {
    // console.log(
    //   "🚀 ~ WebViewAdapter ~ onWebViewAdded ~ webViewRef",
    //   webViewRef,
    //   this.actorMap.size
    // );

    this.currentWebViewRef = webViewRef;
    this.currentEventEmitter = eventEmitter;

    this.currentEventEmitter.addListener("message", (data: any) => {
      // console.log("🚀 ~ WebViewAdapter ~ event from webviw ~ data:", data);

      if (!isEventObject(data)) {
        return;
      }
      // TODO or xstate.inspecting ?
      if (data.type === "@statelyai.connected") {
        // send all actor and snapthos
        this.actorMap.forEach((actorRef) => {
          const actorEvent = convertActorToStatelyEvent(actorRef);
          if (actorEvent) {
            this.send(actorEvent);
          }
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
    if (
      this.currentEventEmitter === undefined ||
      (this.currentEventEmitter?.listenerCount("message") ?? 0) < 1
    ) {
      return;
    }
    // console.log("🚀 ~ WebViewAdapter ~ send ~ event:", event);
    if (
      this.currentWebViewRef?.current === null ||
      this.currentWebViewRef?.current === undefined
    ) {
      // console.log("🚀 ~ WebViewAdapter ~ send ~ NO WEB VIEW YET!!!");
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
