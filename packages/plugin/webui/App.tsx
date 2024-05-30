import { useDevToolsPluginClient } from "expo/devtools";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  StatelyInspectionEvent,
  createBrowserInspector,
} from "@statelyai/inspect";

export default function App() {
  const client = useDevToolsPluginClient("xstate-inspect");
  const ref = useRef<HTMLIFrameElement>(null);

  const [isInspectorConnected, setIsInspectorConnected] = useState(false);

  /*  useEffect(() => {
    // TODO https://github.com/statelyai/feedback/issues/388

    const receiver = createBrowserReceiver({
      // window,
    });
    sub = receiver.subscribe((event) => {
      console.log("received event from web inspector222", event);
    });

    or


  }, []); */
  // useEffect(() => {
  //   if (client) {
  //     console.log("sending connected event to client");
  //     client.sendMessage("@stately.connected", {});
  //   }
  // }, [client]);

  useEffect(() => {
    window.parent.addEventListener("message", (event) => {
      console.log("received event from window.parent.addEventListener", event);

      if (event.data?.type === "@statelyai.connected") {
        setIsInspectorConnected(true);
        return;
      }
    });
  }, []);

  const inspect = useMemo(() => {
    if (isInspectorConnected) {
      const iframe = ref.current;
      const inspector = createBrowserInspector({
        iframe: ref.current,
        autoStart: true,
      });
      // console.log("created inspector", inspector, iframe);
      return inspector;
    }
    return null;
  }, [isInspectorConnected]);

  useEffect(() => {
    if (!inspect) return;

    const subscription = client?.addMessageListener(
      "event",
      (data: StatelyInspectionEvent) => {
        console.log("received event from client", data, inspect);
        inspect?.adapter.send(data);
      }
    );
    if (client) {
      console.log("sending connected event to client"); // will send over deferred events
      client.sendMessage("@stately.connected", {});
    }
    return () => {
      subscription?.remove();
    };
  }, [inspect]);

  return (
    <View style={styles.container}>
      <iframe
        src="https://stately.ai/inspect"
        style={{ width: "100%", height: "100%", border: "0" }}
        id="data-xstate"
        data-xstate
        ref={ref}
        sandbox="allow-same-origin allow-scripts"
      />
      {/* <Text style={styles.text}>
        That's the Web UI of the DevTools plugin. You can now edit the UI in the
        App.tsx.
      </Text>
      <Text style={[styles.text, styles.devHint]}>
        For development, you can also add `devServer` query string to specify
        the WebSocket target to the app's dev server.
      </Text>
      <Text style={[styles.text, styles.devHint]}>For example:</Text>
      <Pressable
        onPress={() => {
          window.location.href =
            window.location.href + '?devServer=localhost:8081';
        }}
      >
        <Text style={[styles.text, styles.textLink]}>
          {`${window.location.href}?devServer=localhost:8081`}
        </Text>
      </Pressable> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    marginBottom: 16,
  },
  devHint: {
    color: "#666",
  },
  textLink: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
});
