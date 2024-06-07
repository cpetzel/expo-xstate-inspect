import React, { useEffect, useMemo, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import { WebViewRegistry } from "./WebViewRegistry";
import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";

const disableTextSelection = Platform.select({
  android: `document.body.style.userSelect = 'none';`,
  ios: 'document.body.style.webkitUserSelect = "none";',
});

const iosZoomFix =
  "const meta = document.createElement('meta'); " +
  "meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=1'); " +
  "meta.setAttribute('name', 'viewport'); " +
  "document.getElementsByTagName('head')[0].appendChild(meta); " +
  "true; ";

/**
 * This is injected AFTER the page loads
 */
const INJECTED_JAVASCRIPT = `(function() {
  ${disableTextSelection}
  ${iosZoomFix}
})();`;

/**
 * This is injected before the page loads. This will allow the inspector to communicate with our RN JS.
 */
const PRELOAD_INJECTED_JAVASCRIPT = `(function() {
    window.opener = window;
    window.ogPost = window.postMessage

    window.postMessage = function(event, thing){
      try{
        window.ReactNativeWebView.postMessage(JSON.stringify(event));
        window.ogPost(event, thing)
      }catch(e){
        console.error('error in webview postMessage', e)
      }
    }

    console.log('attaching message event listener from webview to RN')
})();`;

interface Props {
  onClosePress: () => void;
}

// TODO support the old inspector?
export const XStateDebuggerWebView = () => {
  const ref = useRef<WebView>(null);

  const eventEmitter = useMemo(() => new EventEmitter(), []);

  const onMessage = (event: WebViewMessageEvent) => {
    eventEmitter.emit("message", JSON.parse(event.nativeEvent.data));
  };

  useEffect(() => {
    if (ref.current) {
      let cleanup = WebViewRegistry.registerWebView(ref, eventEmitter);
      return cleanup;
    }
  }, [ref]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
        },
      }),
    []
  );
  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        ref={ref}
        style={styles.container}
        webviewDebuggingEnabled
        scrollEnabled={false}
        textInteractionEnabled={false}
        setBuiltInZoomControls={false}
        automaticallyAdjustContentInsets={false}
        scalesPageToFit={false}
        bounces={false}
        source={{ uri: "https://stately.ai/inspect" }} //
        injectedJavaScriptBeforeContentLoaded={PRELOAD_INJECTED_JAVASCRIPT}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        onMessage={onMessage}
        onShouldStartLoadWithRequest={(event) => {
          // Prevent clicking and following hrefs or links
          if (event.navigationType === "click") {
            return false;
          }
          return true;
        }}
      />
    </View>
  );
};
