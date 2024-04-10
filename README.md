# @dev-plugins/xstate-inspect

Inspect your V5 xstate machines

# API documentation

- [Documentation for the main branch](https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/@dev-plugins/xstate-inspect.md)
- [Documentation for the latest stable release](https://docs.expo.dev/versions/latest/sdk/@dev-plugins/xstate-inspect/)

# Installation in managed Expo projects

For [managed](https://docs.expo.dev/archive/managed-vs-bare/) Expo projects, please follow the installation instructions in the [API documentation for the latest stable release](#api-documentation). If you follow the link and there is no documentation available then this library is not yet usable within managed projects &mdash; it is likely to be included in an upcoming Expo SDK release.

# Installation in bare React Native projects

For bare React Native projects, you must ensure that you have [installed and configured the `expo` package](https://docs.expo.dev/bare/installing-expo-modules/) before continuing.

### Add the package to your npm dependencies

```
npm install @dev-plugins/xstate-inspect
```

Note, this only works with XState V5 machines.

### Usage
There are two ways to use this plugin. You can either construct your own inspector using our hook, or you can use our Context Provider which will make the inspector available to your entire app. Only a single instance can be alive at a given time, so pick the use case that works best for you. 

##### Create Inspector Manually
```typescript
import { useXStateInspector } from '@dev-plugins/xstate-inspect';

const Component = () => {
  const inspector = useXstateInspector();
  const [state, send] = useMachine(machine, {
    inspect: inspector?.inspect,
  });
}

```

##### Use Provided Inspector from Context

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