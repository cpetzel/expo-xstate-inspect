import { StatelyInspectionEvent } from "@statelyai/inspect/src/types";
import { convertActorToStatelyEvent } from "react-native-xstate-inspect-core";

import {
  DevToolsPluginClient,
  getDevToolsPluginClientAsync,
} from "expo/devtools";
import {
  AnyActorRef,
  assertEvent,
  assign,
  fromCallback,
  fromPromise,
  setup,
  stateIn,
} from "xstate";

export const inspectMachine = setup({
  types: {
    context: {} as {
      actors: AnyActorRef[];
      client?: DevToolsPluginClient;
    },
    events: {} as
      | {
          type: "InspectorEvent";
          event: StatelyInspectionEvent;
        }
      | {
          type: "NewActor";
          actorRef: AnyActorRef;
        }
      | { type: "MetroSocketDisconnected" }
      | { type: "InspectorConnected" }
      | { type: "Start" }
      | { type: "Stop" },
  },
  actors: {
    clientMessages: fromCallback<any, { client: DevToolsPluginClient }>(
      ({ sendBack, input }) => {
        // console.log(
        //   "🚀 ~ clientMessages - listening for web inspect events, and socket events"
        // );
        const sub = input.client.addMessageListener(
          "@stately.connected",
          () => {
            sendBack({ type: "InspectorConnected" });
          }
        );

        const onClose = () => {
          // console.log("🚀 ~ clientMessages ~ socket closed! ");
          sendBack({ type: "MetroSocketDisconnected" });
        };

        input.client
          .getWebSocketBackingStore()
          .ws?.addEventListener("close", onClose);

        return () => {
          // console.log("🚀 ~ clientMessages ~ cleanup");
          sub.remove();
          input.client
            .getWebSocketBackingStore()
            .ws?.removeEventListener("close", onClose);
        };
      }
    ),
    connectDevClient: fromPromise(async () => {
      // console.log("🚀 ~ connectDevClient");
      return await getDevToolsPluginClientAsync("xstate-inspect");
    }),
    disconnectDevClient: fromPromise<any, { client: DevToolsPluginClient }>(
      async ({ input }) => {
        await input.client.closeAsync();
      }
    ),
  },
  actions: {
    assignNewActor: assign(({ context, event }) => {
      assertEvent(event, "NewActor");

      return {
        actors: [...context.actors, event.actorRef],
      };
    }),
    sendActors: ({ context }) => {
      // send all actors
      context.actors.forEach((actorRef) => {
        const actorEvent = convertActorToStatelyEvent(actorRef);
        // console.log(
        //   "🚀 ~ WebViewAdapter ~ this.actorMap.forEach ~ SENDING ACTOR:",
        //   actorEvent
        // );
        context.client!!.sendMessage("event", actorEvent);
      });
    },
    sendEventToInspector: ({ context, event }) => {
      assertEvent(event, "InspectorEvent");

      if (context.client!!.isConnected()) {
        context.client!!.sendMessage("event", event.event);
      }
    },
  },
  guards: {
    isRunning: stateIn({ Status: "Running" }),
    hasDevClient: ({ context }) => !!context.client,
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEsB2sAOYDGAXABALYCG2AFmmAMQByYA7gIJ4D2ATgNoAMAuoqBhaxkuZC1T8QAT0QBaAJwAOAHRLFAZgCMigKw71igOw7NANgA0IAB6JNAJkNdlp0wBYumw-L2vDvgL7+lmiYOAQk5JTKAMLiqGFiqFQAkuhYrGyxqPF4kNx8SCCCwqLikjYIxsrq6lzqxpqu6jpcdq6aljIIZprKdnW+mprySnbyhoqBwWlhRKQU8TFxCeJL2WGQVACyYLhsLADKLNgA1rsAIsiw2Mu5EPmSxSKJ5YgOTjqKXErq8m2Ghka6k6iFcSmUXAmmi4GiMLhMhimIBC6XC8yiWRypVQayxm1SoQyAFEAG5gVC4B6FJ7Y14IHRuPp2RTyVwtMys9QWaS2EaqeSmJRNQx2eyGUyTILImZ4OaRRaYlY4xV3KgHXDENiU3iPITPMqFCrydR2ZSKYVcHRsq1+HQghCilQA9SuOx2F2A3zjJEo2YRBZgZTq4i4ACusGUACVQ9k0FA1bgWBgqQI9bTDYhTKajFx3EClDDanaed16vIzW4TFotC0uKYfTK0fLA8GwxH1UmsBAE5rtQVUyUXhmELJ9MoGXZTFboS1xm77fYmqoWS6mp4BZOG4SmwHlOcwCTogAbZDk3C4hKoeMQcSBtAklhnZS+2X+qL7w8ns8XvBxhD344Q0SfIUyKNMh1ACpHGUIY2k8eodHeVxFHtYxsyzF1TBhdwxh0LdUTlXcP2PU8KWUIk2H2NhNisWANVwQNiAAMwYtgAAp+i4LgAEoqBfHd3wPEjvwoqi8h1alwINSDQRaVRJ20bx6khUV7XGXpTG0MFvjZY17Hwv10UWYivzIlUGO7HY9kOY4zlwS5rluCzQJpCDrEzXxx0nNcWnFKduS6cVemadwvEQvxc0lKVUBYCA4EkfjCMoXVB2k9yR2rVRak0EwuPXb5gRLWRNHUZQvCnF0lAmK02QM18jMDcy3NctKKlkOxPnHYZBTBLRGk8VDSscTCJVdLkvFcOqBIVJzEmUGgWFwczIBS-UJGHdroS6gVWT0-rAQXAUysQqcGTBCVxnkKakpm9Zf1WZaIFW9MZMqMFnAZZ01G0PR7XqU0tEUc082aN0XGut9FlbcNnrctrJx0LKPFyjwvAKhcctMZRkL+d1Pkq7QIYaoN6PDKMY1QONYda2xdDNEwSsLEVQsKrpGfLXQRUMAx6mGN0iebEmQzJjsMC7an1tezbDCRnLoVR+RvgC2xag5nQRRZT4hlcHWBaIoTTNwCW6XarM+hKnKDBhfRXGVhAsycRQMK8E1FGGPCpUSyHAxM0jzyaq9jY20VXHNmsrd0TDWcQTnqitSFvAcdwwT1wTPz98jKPYFbJNSyX0sFFQ3VtqdWhqGo1Kw6pmUnX46izRFPcbG6fYNjPHqD16TV6d1ucFLi-L0O2grj0LE4i5DAkCIA */
  id: "inspect machine",

  context: {
    isConnected: false,
    actors: [],
  },
  on: {
    NewActor: {
      actions: ["assignNewActor"],
    },
  },

  states: {
    Connection: {
      states: {
        NotConnected: {},

        Connected: {
          on: {
            MetroSocketDisconnected: {
              target: "NotConnected",
            },
            InspectorEvent: [
              {
                guard: "isRunning",
                actions: ["sendEventToInspector"],
              },
            ],

            Start: {
              actions: "sendActors",
            },
          },
        },
      },

      initial: "NotConnected",

      on: {
        InspectorConnected: {
          target: ".Connected",
          actions: "sendActors",
          description: `The web inspector has connected and sent an @stately.connected event`,
        },
      },
    },

    Status: {
      initial: "Stopped",

      states: {
        Running: {
          on: {
            Stop: "Stopped",
          },
        },

        Stopped: {
          on: {
            Start: { target: "Running", actions: "sendActors" },
          },
        },
      },
    },

    DevClient: {
      states: {
        Connecting: {
          invoke: {
            src: "connectDevClient",
            onDone: {
              target: "Connected",
              actions: assign({
                client: ({ event }) => event.output,
              }),
            },
          },
        },

        Errored: {
          after: {
            2000: "Connecting",
          },
        },

        Connected: {
          on: {
            MetroSocketDisconnected: {
              target: "Errored",
            },
          },
          invoke: {
            src: "clientMessages",
            input: ({ context }) => ({
              client: context.client!!,
            }),
          },
        },
      },

      initial: "Connecting",
      description: `Manages the connection to the metro bundler`,
    },
  },

  type: "parallel",
});
