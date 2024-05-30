import { StatelyInspectionEvent } from "@statelyai/inspect";
import { DevToolsPluginClient, EventSubscription } from "expo/devtools";

export class WebSocketAdapter implements Adapter {
    // private ws: WebSocket;
    private status = 'closed' as 'closed' | 'open';
    private deferredEvents: StatelyInspectionEvent[] = [];
    // private options: Required<WebSocketInspectorOptions>;
    private subscriptions: EventSubscription[] = [];

    private client: DevToolsPluginClient;
  
    constructor(/* options?: WebSocketInspectorOptions */ client: DevToolsPluginClient) {
        this.client = client;   
    //   this.options = {
    //     filter: () => true,
    //     serialize: (inspectionEvent) =>
    //       JSON.parse(safeStringify(inspectionEvent)),
    //     autoStart: true,
    //     url: 'ws://localhost:8080',
    //     ...options,
    //   };
    }
    public start() {
        this.subscriptions.push(
            this.client.addMessageListener('ping', (data) => {
                alert(`Received ping from ${data.from}`);
                this.client.sendMessage('ping', { from: 'web' });
                //   inspect?.actor('test')
            })
        );
      /* const start = () => {
        this.ws = new WebSocket(this.options.url);
  
        this.ws.onopen = () => {
          console.log('websocket open');
          this.status = 'open';
          this.deferredEvents.forEach((inspectionEvent) => {
            const serializedEvent = this.options.serialize(inspectionEvent);
            this.ws.send(safeStringify(serializedEvent));
          });
        };
  
        this.ws.onclose = () => {
          console.log('websocket closed');
        };
  
        this.ws.onerror = async (event: unknown) => {
          console.error('websocket error', event);
          await new Promise((res) => setTimeout(res, 5000));
          console.warn('restarting');
          start();
        };
  
        this.ws.onmessage = (event: { data: unknown }) => {
          if (typeof event.data !== 'string') {
            return;
          }
  
          console.log('message', event.data);
        };
      };
  
      start(); */
    }
    public stop() {
      this.ws.close();
      this.status = 'closed';
    }
    public send(inspectionEvent: StatelyInspectionEvent) {
      if (this.status === 'open') {
        this.ws.send(safeStringify(inspectionEvent));
      } else {
        this.deferredEvents.push(inspectionEvent);
      }
    }
  }