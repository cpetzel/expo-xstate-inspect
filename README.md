# expo-xstate-inspect

Inspect your V5 xstate machines using expo dev tooling


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


### Troubleshooting

### Compilation issue - Cannot find Event
This is because @statelyai/inspect bundles up a lot of web dependencies which break metro bundler. 
You can fix this by patching @statelyai/inspect and removing the offending functions `createSkyInspector`. 
```
pnpm patch @statelyai/inspect
```
Then edit index.js and remove the functions that create inspectors that we will not use on mobile, and commit the patch. (this should work using yarn as well)



# Contributing

Contributions are very welcome!