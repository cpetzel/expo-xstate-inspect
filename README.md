## React Native Xstate Inspector

Inspect your V5 xstate machines using [StatelyAI's inspect tool](https://stately.ai/blog/2024-01-15-stately-inspector/) with React Native and Expo apps

See the [Demo App](./packages/demo-app/App.tsx) for reference implementation

# Expo Dev Tool Plugin

##### Activate the plugin by pressing Shift + 'm' in the expo packager terminal and select `expo-xstate-inspect`
![](./static/expo-select.png)


This should open up the inpsector in a web browser


![Inspector in action](./static/devpluginactordemo.gif)

##### See the [README](./packages/plugin/README.md) for implementation details. 


# Sky Inspector (stately.ai hosted webpage inspector)
As of June 2024, the createSkyInspector from stately does not work with React Native. I've created a tool that allows this to work with React Native. 
This behaves just like the expo dev tool, but it allows anyone to view the inspector through a web browser using a public URL. 

##### See the [README](./packages/shared/SKY-README.md) for implementation details. 




## In-App Floating Inspector 
This should work for all React Native projects (not only Expo)


<img src="./static/FloatingInspectDemo.gif" alt="Inspector in action" width="400"/>
<img src="./static/FloatingResizeDemo.gif" alt="Resizeable" width="400"/>

See the [floating-inspector README](./packages/floating-inspector/README.md) for info on how to use the in-app floating inspector. 




### Using multiple inspectors
You can use both inspectors by using the `combineObservers` helper function.


```typescript
import { combineObservers } from "react-native-xstate-inspect-core";

// your component
const inspectors = [expoPluginInspector, floatingInspector];
const combinedInspectors = useMemo(() => {
return combineObservers(inspectors);
}, [expoPluginInspector, floatingInspector]);

const [state, send] = useMachine(DemoMachine, {
inspect: combinedInspectors,
});

```

See the [Demo App](./packages/demo-app/App.tsx) for reference implementation

#### Todo Tasks
- [ ] (Floating Inspector) - Zoom buttons appear on Android but not iOS. Fix this.
- [ ] (Floating Inspector) - Show loading indicator when webview is loading inspector. (show error view if offline)
- [ ] (Floating Inspector) - Test memory leaks
- [ ] (Floating Inspector) - Expose the WebViewInspector as a standalone component (not floating)
- [ ] (Floating Inspector) - Consider clamping/bounding the floating window to device screen. (similar to [this](https://snack.expo.dev/@fakeheal/pan-gesture-on-a-scaled-view))
- [ ] (Both) - listen for hot/live reload, so we can reload the inspectors



# Development

Requires Node 20+ (npm workspaces). Everything is on Expo SDK 57 / React Native 0.86 / React 19 / XState 5.33 / `@statelyai/inspect` 0.7.

```bash
npm install --legacy-peer-deps   # also builds core + plugin (prepare)
npm run build                    # rebuild core + plugin after changing them
cd packages/demo-app
npx expo run:android             # demo app needs a dev client build (native modules)
```

The plugin web UI is built with `npm run build:web -w expo-xstate-inspect`. Restart Metro after rebuilding it.

# Contributing

Contributions are very welcome!


#### Notes:
- `react-native-xstate-inspect-core` ships its own React Native friendly `createInspector`. Upstream `@statelyai/inspect` >= 0.5 resolves to a Node-only build under Metro (`node:crypto`), so it is only used for types (and in the plugin web UI).
- partysocket 1.x reads a bare global `crypto`, which Hermes lacks; core polyfills `crypto.randomUUID` for you.
