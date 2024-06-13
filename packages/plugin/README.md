# expo-xstate-inspect

**Inspect your V5 xstate machines using expo dev tooling** (Note, this only works with XState V5 machines)

See the [Demo App](../demo-app/App.tsx) for reference implementation


### Add the package to your dependencies

```bash
$ npm install expo-xstate-inspect
```


### Usage
There are two ways to use this plugin. You can either construct your own inspector using our hook, or you can use our Context Provider which will make the inspector available to your entire app. Only a single instance can be alive at a given time, so pick the use case that works best for you. 

### Create Inspector Manually
```typescript
import { useXStateInspectorDevTool } from 'expo-xstate-inspect';

const Component = () => {
  const inspector = useXStateInspectorDevTool();
  const [state, send] = useMachine(machine, {
    inspect: inspector?.inspect,
  });
}

```

### Use Provided Inspector from Context

First, create a Provider that will internally create the inspector.
```typescript
import { XStateInspectorDevToolProvider } from 'expo-xstate-inspect';

const App = () => (
    <XStateInspectorDevToolProvider>
      {/* rest of app */}
    </XStateInspectorDevToolProvider>
);
```
Then in a component where you have a machine, grab the inspector using this hook.

```typescript
import { useProvidedXstateInspectorDevTool } from 'expo-xstate-inspect';

 const inspector = useProvidedXstateInspectorDevTool();
  const [state, send] = useMachine(audioMachine, {
    inspect: inspector?.inspect,
  });
```
This uses the already created inspector in the Context. It is null for production builds. 



### Troubleshooting

### Compilation issue - Cannot find EventTarget

The error looks like this...
```
ERROR  
  PartySocket requires a global 'EventTarget' class to be available!
  You can polyfill this global by adding this to your code before any partysocket imports: 
  
  import 'partysocket/event-target-polyfill';
```

Instead of using this polyfill, we can install  'event-target-shim' and then polyfill it.
```
import { EventTarget, Event } from 'event-target-shim';
global.EventTarget = EventTarget;
global.Event = Event;

```
