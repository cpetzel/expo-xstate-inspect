import { RefObject } from "react";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";

export interface WebViewAddedListener {
  onWebViewAdded(webViewRef: RefObject<WebView>, eventEmitter: EventEmitter);
}

type WebViewMessagePair = {
  webViewRef: RefObject<WebView>;
  eventEmitter: EventEmitter;
};

class Registry {
  private webViewMessagePairs: WebViewMessagePair[] = [];

  private listeners: WebViewAddedListener[] = [];

  addOnWebViewListener(listener: WebViewAddedListener) {
    // console.log("🚀 ~ Registry ~ addOnWebViewListener ~ listener", listener);
    this.listeners.push(listener);

    this.webViewMessagePairs.forEach((webViewPair) => {
      // console.log(
      //   "🚀 ~ Registry ~ already have a webview... notifying the listener",
      //   webViewPair
      // );
      listener.onWebViewAdded(webViewPair.webViewRef, webViewPair.eventEmitter);
    });
  }

  removeOnWebViewListener(listener: WebViewAddedListener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  // right now, communication seems one way... the machines can send events to the inspector, but the inspector cannot send messages to the machines
  // the only events we have to send from the webview are "connecting"
  registerWebView(webViewRef: RefObject<WebView>, eventEmitter: EventEmitter) {
    this.webViewMessagePairs.push({ webViewRef, eventEmitter });

    this.listeners.forEach((l) => l.onWebViewAdded(webViewRef, eventEmitter));

    const cleanup = () => {
      // console.log("🚀 ~ Registry ~ cleanup ~ removing webViewRef", webViewRef);
      this.webViewMessagePairs = this.webViewMessagePairs.filter(
        (ref) => ref.webViewRef !== webViewRef
      );
    };

    return cleanup;
  }
}

export const WebViewRegistry = new Registry();
