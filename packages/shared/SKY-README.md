# Sky Inspect

See the [Demo App](../demo-app/App.tsx) for reference implementation


### Add the package to your dependencies 
(Only if you are not using any of the other sibling packages from this repo)

```bash
$ npm install react-native-xstate-inspect-core
```


### Usage
There are two ways to use this plugin. You can either construct your own inspector using our hook, or you can use our Context Provider which will make the inspector available to your entire app. Only a single instance can be alive at a given time, so pick the use case that works best for you. 

### Create Inspector Manually
```typescript
import { useSkyXstateInspector } from 'react-native-xstate-inspect-core';

const onSkyConnect = (url: string) =>
  console.log("🚀 ~ Sky Inspector created at url: ", url);

const Component = () => {
  const skyInspector = useSkyXstateInspector({ onSkyConnect });
  const [state, send] = useMachine(machine, {
    inspect: skyInspector?.inspect,
  });
}

```

### Use Provided Inspector from Context

First, create a Provider that will internally create the inspector.
```typescript
import { FloatingXStateInspectorProvider } from 'react-native-xstate-inspect-core';

const App = () => (
    <FloatingXStateInspectorProvider>
      {/* rest of app */}
    </FloatingXStateInspectorProvider>
);
```
Then in a component where you have a machine, grab the inspector using this hook.

```typescript
import { useProvidedSkyInspector } from 'react-native-xstate-inspect-core';

  const skyInspector = useProvidedSkyInspector();
  const [state, send] = useMachine(audioMachine, {
    inspect: skyInspector?.inspect,
  });
```
This uses the already created inspector in the Context.