# expo-xstate-inspect

Inspect your V5 xstate machines using expo dev tooling (Dev Clients and GO supported!)


### Add the package to your npm dependencies

```
npm install expo-xstate-inspect
```

Note, this only works with XState V5 machines.

### Usage
There are two ways to use this plugin. You can either construct your own inspector using our hook, or you can use our Context Provider which will make the inspector available to your entire app. Only a single instance can be alive at a given time, so pick the use case that works best for you. 

### Create Inspector Manually
```typescript
import { useXStateInspector } from 'expo-xstate-inspect';

const Component = () => {
  const inspector = useXstateInspector();
  const [state, send] = useMachine(machine, {
    inspect: inspector?.inspect,
  });
}

```

### Use Provided Inspector from Context

First, create a Provider that will internally create the inspector.
```typescript
import { XStateInspectorProvider } from 'expo-xstate-inspect';

const App = () => (
    <XStateInspectorProvider>
      {/* rest of app */}
    </XStateInspectorProvider>
);
```
Then in a component where you have a machine, grab the inspector using this hook.

```typescript
import { useProvidedXstateInspector } from 'expo-xstate-inspect';

 const inspector = useProvidedXstateInspector();
  const [state, send] = useMachine(audioMachine, {
    inspect: inspector?.inspect,
  });
```
This uses the already created inspector in the Context. It is null for production builds. 


### NOTE: This plugin caches all actor creation and snapshots events in local memory.
(It does not cache regular events due to the sheer size of possible events being stored in memory)
This is to better support the inspector web browser being reloaded. The inspector browser needs the actor definition JSON in order to process events successfully, so we cache the actor.create and actor.snapshot events and send them to the inspector browser once it connects. 


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


# Contributing

Contributions are very welcome!