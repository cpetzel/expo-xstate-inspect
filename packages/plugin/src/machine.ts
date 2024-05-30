import {
  StatelyActorEvent,
  StatelyInspectionEvent,
} from "@statelyai/inspect/src/types";
import { DevToolsPluginClient } from "expo/devtools";
import { assertEvent, assign, fromCallback, setup, stateIn } from "xstate";

export const inspectMachine = setup({
  types: {
    input: {} as {
      client: DevToolsPluginClient;
    },
    context: {} as {
      actorEvents: StatelyActorEvent[];
      snapshotsMap: Map<string, StatelyInspectionEvent>;
      client: DevToolsPluginClient;
    },
    events: {} as
      | {
          type: "InspectorEvent";
          event: StatelyInspectionEvent;
        }
      | { type: "InspectorConnected" }
      | { type: "Start" }
      | { type: "Stop" },
  },
  actors: {
    listenForConnections: fromCallback<any, { client: DevToolsPluginClient }>(
      ({ sendBack, input }) => {
        input.client.addMessageListener("@stately.connected", (data) => {
          sendBack({ type: "InspectorConnected" });
        });

        return () => {};
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
    sendDeferredEvents: ({ context }) => {
      context.actorEvents.forEach((event) => {
        context.client.sendMessage("event", event);
      });

      context.snapshotsMap.forEach((event) => {
        context.client.sendMessage("event", event);
      });
    },
    sendEventToInspector: ({ context, event }) => {
      assertEvent(event, "InspectorEvent");

      if (context.client.isConnected()) {
        context.client.sendMessage("event", event.event);
      }
    },
  },
  guards: {
    isRunning: stateIn({ Status: "Running" }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEsB2sAOYDGAXABALYCG2AFmmAHQDCA9qqjrsgwMQCS6WedATvUbNIAbQAMAXUSgMdWMhYNpIAB6IAtAEYA7FQAcAVgMAWAGx7tBgDQgAnok0BOAExVnY048fbHxx2M1TDwBfYJs0TGYiUgomWgYmPFZUKgA5OlxBRNxITm5mfgBRADcwVFxxKSQQWXlFVGU1BHUAZlNNNxdHPRaW400xPVNtG3sENtMqU2Me-3aDD0DTUPD8vGjySnihJIZt7NyuSN4+ErKKyWVahWTGxANnPSovIJbtYxaxFsDnUcRtSYBQJ6TTGMyaZwzYwrEARHgEEibOJZZjJfbCCB5Y64IqlcoiTRVGRyG5KapNB66bzOdqWAxDTR9P4IJyudzaMQBPSGTn9GFwqKI2LUFG7FKinKYgDKuGIfAuRJqJPqdwQjharj0Hw5JiMxne1jsiGcmie2m0fWczj62lBPm0-LWCJiWxlxFwAFdYFQAEoexhoKBsGV0DCVK7K27kxAtRz6QKxwJgjXc5mmNr6brGMTObQgywWx3YjbCqhuz3ekMYLDS2Xy8PVa4q6PNTQGXR6dzOFw5xkPHrMi1PMQzRlDL45gzLGGoOgQODKAXrIWUCN1KOgJrqMwtKbZ0zOQ1jLTGAzPbnfQwGFoWAyBIvwktbCUbpXrsmbjTZuPd7s9PoDEMIxGq2HQzD0ppGDelj3mEsJOk+yIJKiezpJkyF4JAa6kg0LbqF2bieEYkH0lqDzMpCuicje0xfC0CxWnoD6Ci6SE7PU6KYRA2HNp+CAApMFofH0-Tdv4vwgX0u56FmAwQoyeZTsxy6sdQ5Zejxr5bv0Z60QeR73H4VCxlqOZ5jo7YtMpzpImpsoVr6-qoIGmkfqoMaTKCHhTrMXyBI4g43lQI4gjRE6HtOqzFiucTqZWOLVlhjaRm5W5tLoemHoFw6jiYfSeOajihKEQA */
  id: "inspect machine",

  context: ({ input }) => ({
    client: input.client,
    isConnected: false,
    actorEvents: [],
    snapshotsMap: new Map(),
  }),

  states: {
    Connection: {
      states: {
        NotConnected: {
          on: {
            InspectorEvent: {
              actions: ["assignNewEvent"],
            },
          },
        },

        Connected: {
          on: {
            InspectorEvent: [
              {
                guard: "isRunning",
                actions: ["assignNewEvent", "sendEventToInspector"],
              },
              {
                actions: ["assignNewEvent"],
              },
            ],

            Start: {
              target: "Connected",
              actions: "sendDeferredEvents",
            },
          },
        },
      },

      initial: "NotConnected",

      on: {
        InspectorConnected: {
          target: ".Connected",
          actions: "sendDeferredEvents",
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
  },

  invoke: {
    src: "listenForConnections",
    input: ({ context }) => ({
      client: context.client,
    }),
  },

  type: "parallel",
});