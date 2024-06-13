import {
  StatelyActorEvent,
  StatelyInspectionEvent,
} from "@statelyai/inspect/src/types";
import pkg from "@statelyai/inspect/package.json";

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
import safeStringify from "safe-stable-stringify";
import { getRootId } from "react-native-xstate-inspect-shared";

export const inspectMachine = setup({
  types: {
    context: {} as {
      actorEvents: StatelyActorEvent[];
      actors: AnyActorRef[];
      snapshotsMap: Map<string, StatelyInspectionEvent>;
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
    assignNewEvent: assign(({ context, event }) => {
      assertEvent(event, "InspectorEvent");

      const { actorEvents } = context;
      if (event.event.type === "@xstate.actor") {
        actorEvents.push(event.event as StatelyActorEvent);
      }
      const { snapshotsMap } = context;
      if (event.event.type === "@xstate.snapshot") {
        snapshotsMap.set(event.event.sessionId, event.event);
      }
      return {
        actorEvents,
        snapshotsMap,
      };
    }),
    assignNewActor: assign(({ context, event }) => {
      assertEvent(event, "NewActor");

      return {
        actors: [...context.actors, event.actorRef],
      };
    }),
    sendActors: ({ context }) => {
      // send all actors
      context.actors.forEach((actorRef) => {
        const snapshot = actorRef.getSnapshot();

        if (snapshot.status !== "active") {
          return;
        }

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
  /** @xstate-layout N4IgpgJg5mDOIC5QEsB2sAOYDGAXABALYCG2AFmmAMQByYA7gIJ4D2ATgNoAMAuoqBhaxkuZC1T8QAT0QBaAJwAOAHRLFAZgCMigKw71igOw7NANgA0IAB6JNAJkNdlp0wBYumw-L2vDvgL7+lmiYOAQk5JTKAMLiqGFiqFQAkuhYrGyxqPF4kNx8SCCCwqLikjYImvKuyhpc8oZ+ipp6La6WMpWmmspV8nZ2iqZ2JlwOgcFpYUSkFPExcQniC9lhkFQAsmC4bCwAyizYANbbACLIsNiLuRD5ksUiieWIjvLKOsamOm7qJupcFmkiFcSne2i4OjGdnkXGaLQmIBC6XCsyiWRypVQKwx61SoQyAFEAG5gVC4O6FB6Y54Ib41AaKaqQszVdSAzp9VTyUxKVzqQx2eyGUyKBFI6YROZgbFLLHotYQKh7XDENjk3j3ISPMqFCrydR2Wp8xw6Vw+Pw6DqIQUqRrqVwDe2GTS+BpiqZ4GaRebK4i4ACusGUACV-dk0FAlbgWBgKQItdTdYhhrVHO4XeolLD-pagZV+W8hmbNFotJCAe78SjvdLfQGg8qY1hFb61XGigmnkmELJ9O9hl9XJoIfUBXYrZU7HzVIz7XzPNy7KZK8ivVLlKcwETogAbZCk3DKGgsXDym5UCDiaVoIksE7KcWeyVRTfbvcHo8ns+4SAIG+HP1EnydsqS7UA9XpRRmkUVxYOGZolwnBoakZDRNCqM0XGqQIghAVAWAgOBJEfaspU1EowOsORS1Uf4WmHDwvHqdQJ1kEtai4LhGnLMx0P0VwVwlVF5m-SjQJ1cC5CXGo+S4WDoS+AZXCMCdDHUZx5H6AZhn4rhfkEp9hOlUTlmPU9rh-CByO1CRu1kQVTGUWT5O5HQlJUvN3B0ZQARGBSsK8AzSLRCzEhlG5rMTSSED8N4vlMO01G0PQJ35Q0tCg2CPF+bTl1wki1yiOtA0iyiKnsr5aI8UZGJhfUJz4xzlP6UwtFMbLhSCwqfRVesQzDVAI1KiSqMqXRahMEtswFdw1Ia-5Cw+BwDH5KoBi658er9QNlEbDBm2G2zovszwqvoziF3qdlbAWiaBUZHQ4VggT8o9YL5lfXd9zJQ6aXsvt2q4hx0JGe17QnZpDFqJRfjcTSzTNDajI3Lcvo-Mzv0gX67LsCFnE4gVnXsfjwbzapCxhh1kM8Z0kZrFG32+w9MasylOxGioDULEEvA+PSXEe3NOnJ6GNCpvwaZewIgA */
  id: "inspect machine",

  context: () => ({
    isConnected: false,
    actorEvents: [],
    actors: [],
    snapshotsMap: new Map(),
  }),

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
            Start: "Running",
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
