import { StatelyInspectionEvent } from "@statelyai/inspect/src/types";
import { stringify } from "superjson";
import { convertActorToStatelyEvent } from "./utils";

import uuid from "react-native-uuid";
import PartySocket, { WebSocket } from "partysocket";

import {
  AnyActorRef,
  assertEvent,
  assign,
  fromCallback,
  fromPromise,
  setup,
  stateIn,
} from "xstate";

const host = "stately-sky-beta.mellson.partykit.dev";

export const inspectMachine = setup({
  types: {
    input: {} as {
      onSkyConnect?: (url: string) => void;
    },
    context: {} as {
      actors: AnyActorRef[];
      socket?: WebSocket;
      sessionId: string;
      onSkyConnect?: (url: string) => void;
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
      | { type: "SkyDisconnected" }
      | { type: "SkyConnected" }
      | { type: "Start" }
      | { type: "Stop" },
  },
  actors: {
    createSocket: fromPromise<WebSocket, { sessionId: string }>(({ input }) => {
      return new Promise((resolve, reject) => {
        const { sessionId } = input;
        const room = `inspect-${sessionId}`;
        const socket = new PartySocket({
          host,
          room,
          WebSocket,
        });
        resolve(socket);
      });
    }),

    listenToSocket: fromCallback<
      any,
      {
        sessionId: string;
        socket: WebSocket;
        onSkyConnect?: (url: string) => void;
      }
    >(({ sendBack, input }) => {
      const { socket, onSkyConnect, sessionId } = input;
      /* 
         console.log(
        "🚀 ~ listenToSocket - listening for web inspect events, and socket events"
      );

         socket.addEventListener("message", (event) => {
        console.log(
          "🚀 ~ addEventListener ~ received event from inspector/socket",
          event
        );
      });

      socket.onmessage = (event) => {
        console.log(
          "🚀 ~ listenToSocket ~ received event from inspector/socket",
          event
        );
      }; */

      socket.onclose = () => {
        sendBack({ type: "SkyDisconnected" });
      };

      socket.onopen = () => {
        const liveInspectUrl = `https://stately.ai/registry/inspect/${sessionId}`;
        sendBack({ type: "SkyConnected" });

        // TODO move to side effect? then i would have to store the live inspect url in context, which I already know....
        onSkyConnect?.(liveInspectUrl);
      };

      return () => {
        // console.log("🚀 ~ listenToSocket ~ cleanup");

        socket.onclose = null;
        socket.onopen = null;
        socket.onmessage = null;
      };
    }),
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
        context.socket!!.send(stringify(actorEvent));
      });
    },
    sendEventToInspector: ({ context, event }) => {
      assertEvent(event, "InspectorEvent");

      // console.log(
      //   "🚀 ~ sendEventToInspector ~ state, event",
      //   context.socket.readyState,
      //   event
      // );
      context.socket!!.send(stringify(event.event));
    },
  },
  guards: {
    isRunning: stateIn({ Status: "Running" }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEsB2sAOYDGAXABALYCG2AFmmAMQByYA7gIJ4D2ATgNoAMAuoqBhaxkuZC1T8QAD0QBGLlwDMAOgAsATlnqArOq4A2HftUB2ADQgAnogC027frUaTADm1d72l+pMBfXxZomDgEJOSUygDC4qghYqhUAMoA1pbRqLF4kNx8SCCCwqLikjIIsgBMyrK6qoqKJibaWuVe5RbWCDbl5arKTVzersYu+lzlLv6B6Fh4RKQUsVExceJLGSGQSakAIsiw2MtZEDmSBSLxJbbNyoYm8k0mPfp12u2I5SqyiuMuLrIV5R8dT8ARAQRmoXmEXSmSKqDWsM2AElpiF2ABRABuYFQuBOeTOcMuCH0XjUihc5S+Jgphipb06VN6LRMGkU6n08nKHlkkzBqNmYQWYARK3hMI2ECSuGIbDxvFOQnOxTypVU8mUjUBqlU2gaOhcSgZXUeygGDi4bMUWm05T54JCc3Ci0SMtwAFdYMoAErujJoKDSlgYfECJVE1WIdQqFpcIEU7kVQwM+QNG5NBzVLxuRTae0CyHOkWu4ger2u4NYKUluWh-Lhi6RxmfSkDKn6cbqcblfQM9TqzUmZ5d1naa3aVT54KCqEuljYZJgXCivABqgQcQitCYliL5QOmdF5SJeeL5cS1eoKAIbfz0vxHJ1wmN0ClaPKNxdrSmKktXtWRBrRcKoew7WRfgnfspwhJ1hWPU8l2UdE2DYdhNikWA3RFYgADNcDANgAApuQUABKKgD0LOCTwXRDkNQthsgVAkGxVV85HAj9nlqAZRlUMYTHUBljC4M0Wm6HV-nUFx2Wgx0hQiGizxXfDqx2PYDnWI4n1YiQm0UTlyTcFxGiTDxGgZDRtC4rgaV1exRgnfR-FBVAWAgOBJEo2DKEVQoX2kWxAUcWyGkBCcTN+FxjR1EwzTcTlVD+XNvknUFvIUxYLwjMN-LYwLGX4m4fHuWRHlUZ5c2NXN1D6BK6gUUdnPSgsfKyw44WUGgWFwbLID85U9PYzpwLizkaQcFweI7AZjVkHVlD0bMJNJCrFDkw84Oy+IVP6li8qGgqMxuX4dUMbwyqm41pLNDQ9H0GTc0ef4NqoxS3U9AacoKrpcz6KzBI8A1SX-Do3GZIcgP48YTCUV62uLD6vV9f0ry+gLSnbZQPjKgTBJ1JpFBTRqbh1b5umMCc8xa6c3pdJHj1wSs9tywbiRsUb-p0QHdC8EHids0nagpBQpp8O0aZgzLiwQ3B0fy0ouiSs0GkeHQktcX4UymqolC0fGZI+LheUl+TZxl2jzw6gN5cOxWSJVsL1cirWAIQa1HHka1BNxupDDSqZaYR+DLaQlC0IgW3iQpYDZH0IdWUNQYRiJt3nmA21bVTHx+00eHpZD5S+sj-a2f02o6thwE7m5DlbIZD3de9zRYb9qCXKAA */
  id: "inspect machine",

  context: ({ input }) => ({
    sessionId: uuid.v4() as string,
    actors: [],
    onSkyConnect: input.onSkyConnect,
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
            SkyDisconnected: {
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
        SkyConnected: {
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

    Socket: {
      states: {
        Connecting: {
          invoke: {
            src: "createSocket",
            input: ({ context }) => ({
              sessionId: context.sessionId,
            }),
            onDone: {
              target: "Connected",
              actions: assign({
                socket: ({ event }) => event.output,
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
          invoke: {
            src: "listenToSocket",
            input: ({ context }) => ({
              socket: context.socket,
              sessionId: context.sessionId,
              onSkyConnect: context.onSkyConnect,
            }),
          },
          on: {
            SkyDisconnected: {
              target: "Errored",
            },
          },
        },
      },

      initial: "Connecting",
      description: `Manages the connection to the metro bundler`,
    },
  },

  type: "parallel",
});
