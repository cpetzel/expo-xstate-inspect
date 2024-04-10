# @dev-plugins/xstate-inspect

Inspect your V5 xstate machines using expo dev tooling


### Add the package to your npm dependencies

```
npm install @dev-plugins/xstate-inspect
```

Note, this only works with XState V5 machines.

### Usage
There are two ways to use this plugin. You can either construct your own inspector using our hook, or you can use our Context Provider which will make the inspector available to your entire app. Only a single instance can be alive at a given time, so pick the use case that works best for you. 

### Create Inspector Manually
```typescript
import { useXStateInspector } from '@dev-plugins/xstate-inspect';

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
import { XStateInspectorProvider } from '@dev-plugins/xstate-inspect';

const App = () => (
    <XStateInspectorProvider>
      {/* rest of app */}
    </XStateInspectorProvider>
);
```
Then in a component where you have a machine, grab the inspector using this hook.

```typescript
import { useProvidedXstateInspector } from '@dev-plugins/xstate-inspect';

 const inspector = useProvidedXstateInspector();
  const [state, send] = useMachine(audioMachine, {
    inspect: inspector?.inspect,
  });
```
This uses the already created inspector in the Context. It is null for production builds. 




# Contributing

Contributions are very welcome!