import "partysocket/event-target-polyfill";

import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text } from "react-native";
import { createMachine, fromPromise } from "xstate";
import { useMachine } from "@xstate/react";
import { useXStateInspector } from "expo-xstate-inspect";
import { TamaguiProvider, createTamagui, View, Button } from "tamagui";
import { config } from "@tamagui/config/v3";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  FloatingInspector,
  useFloatingXStateInspector,
} from "react-native-xstate-floating-inspect";
import { useMemo } from "react";
import { Observer, InspectionEvent } from "xstate";

import { combineObservers } from "xstate-floating-inspect-shared";
const tamaguiConfig = createTamagui(config);

function getNextEvents(snapshot) {
  return [...new Set([...snapshot._nodes.flatMap((sn) => sn.ownEvents)])];
}

export default function App() {
  const floatingInspector = useFloatingXStateInspector();
  const inspector = useXStateInspector({
    autoStart: true,
    /*  filter: (event) => {
      if (event.type === "@xstate.event" && event.event.type === "Start") {
        return false;
      }
      return true;
    }, */
  });

  const combinedInspectors = useMemo(() => {
    if (inspector && floatingInspector) {
      return combineObservers([inspector.inspect, floatingInspector.inspect]);
    }
  }, [inspector, floatingInspector]);

  if (!inspector) {
    return <Text>Waiting for inspector to connect...</Text>;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1, width: "100%", height: "100%" }}>
      <TamaguiProvider config={tamaguiConfig}>
        <Demo combinedInspectors={combinedInspectors} />
        <FloatingInspector />
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}

const Demo = ({
  combinedInspectors,
}: {
  combinedInspectors: Observer<InspectionEvent>;
}) => {
  const [state, send] = useMachine(DemoMachine, {
    inspect: combinedInspectors.next,
  });

  const nextEvents = getNextEvents(state);

  return (
    <View style={styles.container}>
      <Text>Current State: {JSON.stringify(state.value)}</Text>
      {nextEvents.map((event) => (
        <Button key={event} onPress={() => send({ type: event })}>
          {event}
        </Button>
      ))}
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          marginTop: 40,
        }}
      >
        <Button onPress={() => inspector.start()}>Start Inspector</Button>
        <Button onPress={() => inspector.stop()}>Stop Inspector</Button>
      </View>
      <StatusBar style="auto" />
    </View>
  );
};

const doWork = async () =>
  new Promise((res, rej) => {
    setTimeout(() => {
      const shouldReject = Math.random() > 0.5;

      if (shouldReject) {
        rej(new Error("Random rejection"));
      } else {
        res(true);
      }
    }, 1000);
  });

const promiseLogic = fromPromise(async () => {
  await doWork();
  return true;
});

const DemoMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QTAWwPYDoCSA7AlgC74CGANgMQDKhJAToQNoAMAuoqAA7qxH7q4OIAB6IAtAEYATAA5MAVikB2AMwAWFUvkAaEAE9ESgGyY1ATiPNjU+TJlKZEowF9nulBkwB1dHQDW+LhQFAAKAlAs7Egg3LzEAkKiCBLyaqZq8irSOvqIMibMUupSzKV2Dk6u7mhYVACuAMYNcLDUtAwA8gBuYHSRQrF8CdFJWXJqSlJG8kY2ugYIYiYSEpPM5mYrUhIyKjJVIB5YPv6BwQCidHS+-dGD8YIjiE4SmCsqstnzz0ZKmEZqZhGfLMFTyFKzeQHI6YABiJHwZDqdDAFAASnB2kw2AMeENHqAkpJtpgzCowWStN8ELI0kZVlI1DJMuCZjZXG4QLh0Ch4NEjri4vwCSJxMoVJhmalgVTcoszFJ-gz1mZNtIdmpoTUcARiORBfjEmKbJL5NL7DkFlpMIzLNZbPZHC5OTCTgEggaHkbFnJFKoNLKrcxTBYrJDyk6tZ56k0Wp7hd6PoqzczKZbDPIbWo7eHHZUXdr4YjkWB48NCYgPnIzGoJIDIdSnH8AUCQWCIeyOUA */
  id: "demo",

  states: {
    Initial: {
      on: {
        Start: "Working",
      },
    },

    Working: {
      invoke: {
        src: promiseLogic,
        onDone: "Success",
        onError: "Failure",
      },
    },

    Success: {
      on: {
        StartOver: "Working",
      },
    },

    Failure: {
      on: {
        Restart: "Initial",
      },
    },
  },

  initial: "Initial",
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

// make TypeScript type everything based on your config
type Conf = typeof tamaguiConfig;
declare module "@tamagui/core" {
  // or 'tamagui'
  interface TamaguiCustomConfig extends Conf {}
}
