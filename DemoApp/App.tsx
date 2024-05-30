import "partysocket/event-target-polyfill";

import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { createMachine } from "xstate";
import { useMachine } from "@xstate/react";
import * as Inspector from "expo-xstate-inspect";
console.log(Inspector);

function getNextEvents(snapshot) {
  return [...new Set([...snapshot._nodes.flatMap((sn) => sn.ownEvents)])];
}

export default function App() {
  const inspector = Inspector.useXStateInspector();

  if (!inspector) {
    return <Text>Waiting for inspector to connect...</Text>;
  }
  return <Demo inspector={inspector} />;
}

const Demo = ({ inspector }) => {
  const [state, send] = useMachine(DemoMachine, {
    inspect: inspector.inspect,
  });

  const nextEvents = getNextEvents(state);

  return (
    <View style={styles.container}>
      <Text>Current State: {JSON.stringify(state.value)}</Text>
      {nextEvents.map((event) => (
        <Button
          key={event}
          title={event}
          onPress={() => send({ type: event })}
        />
      ))}
      <StatusBar style="auto" />
    </View>
  );
};

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
      on: {
        Success: "Success",
        Error: "Failure",
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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
