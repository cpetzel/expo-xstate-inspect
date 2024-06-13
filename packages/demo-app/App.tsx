import "partysocket/event-target-polyfill";

import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text } from "react-native";
import { createMachine, fromPromise } from "xstate";
import { useMachine } from "@xstate/react";
import {
  useProvidedXstateInspectorDevTool,
  useXStateInspectorDevTool,
  XStateInspectorDevToolProvider,
} from "expo-xstate-inspect";
import { TamaguiProvider, createTamagui, View, Button } from "tamagui";
import { config } from "@tamagui/config/v3";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  FloatingInspector,
  TFloatingInspector,
  useFloatingXStateInspector,
  FloatingXStateInspectorProvider,
  useProvidedXstateFloatingInspector,
} from "react-native-xstate-floating-inspect";
import { useMemo, useState } from "react";
import { combineObservers } from "react-native-xstate-inspect-shared";
import type { DevPluginInspector } from "expo-xstate-inspect";
const tamaguiConfig = createTamagui(config);

function getNextEvents(snapshot) {
  return [...new Set([...snapshot._nodes.flatMap((sn) => sn.ownEvents)])];
}

/** Toggle this boolean to render demo app using context providers */
const useContextProviders = true;

export default function App() {
  return (
    <GestureHandlerRootView>
      <TamaguiProvider config={tamaguiConfig}>
        {useContextProviders ? <AppUsingProvider /> : <AppUsingHooks />}
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}

const AppUsingHooks = () => {
  const floatingInspector = useFloatingXStateInspector();
  const expoPluginInspector = useXStateInspectorDevTool({
    autoStart: true,
    /*  filter: (event) => {
      if (event.type === "@xstate.event" && event.event.type === "Start") {
        return false;
      }
      return true;
    }, */
  });
  const [isFloatingVisible, setIsFloatingVisible] = useState(true);

  return (
    <View style={styles.container}>
      <FloatingXStateInspectorProvider>
        <Demo
          floatingInspector={floatingInspector}
          expoPluginInspector={expoPluginInspector}
          isFloatingVisible={isFloatingVisible}
          setIsFloatingVisible={setIsFloatingVisible}
        />
      </FloatingXStateInspectorProvider>
      {isFloatingVisible && (
        <FloatingInspector onClosePress={() => setIsFloatingVisible(false)} />
      )}
    </View>
  );
};

const ProvidedDemo = () => {
  const floatingInspector = useProvidedXstateFloatingInspector();
  const expoPluginInspector = useProvidedXstateInspectorDevTool();
  const [isFloatingVisible, setIsFloatingVisible] = useState(true);

  return (
    <View style={styles.container}>
      <Demo
        floatingInspector={floatingInspector}
        expoPluginInspector={expoPluginInspector}
        isFloatingVisible={isFloatingVisible}
        setIsFloatingVisible={setIsFloatingVisible}
      />
      {isFloatingVisible && (
        <FloatingInspector onClosePress={() => setIsFloatingVisible(false)} />
      )}
    </View>
  );
};

function AppUsingProvider() {
  return (
    <FloatingXStateInspectorProvider>
      <XStateInspectorDevToolProvider>
        <ProvidedDemo />
      </XStateInspectorDevToolProvider>
    </FloatingXStateInspectorProvider>
  );
}

const Demo = ({
  floatingInspector,
  expoPluginInspector,
  isFloatingVisible,
  setIsFloatingVisible,
}: {
  floatingInspector: TFloatingInspector;
  expoPluginInspector: DevPluginInspector;
  isFloatingVisible: boolean;
  setIsFloatingVisible: (visible: boolean) => void;
}) => {
  const inspectors = [expoPluginInspector, floatingInspector];
  const combinedInspectors = useMemo(() => {
    return combineObservers(inspectors);
  }, [expoPluginInspector, floatingInspector]);

  const [state, send] = useMachine(DemoMachine, {
    inspect: combinedInspectors,
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
        <Button onPress={() => inspectors.forEach((i) => i.start())}>
          Start All Inspectors
        </Button>
        <Button onPress={() => inspectors.forEach((i) => i.stop())}>
          Stop All Inspectors
        </Button>
      </View>
      {!isFloatingVisible && (
        <Button onPress={() => setIsFloatingVisible(true)}>
          Show Floating Inspector
        </Button>
      )}
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
    width: "100%",
    height: "100%",
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
