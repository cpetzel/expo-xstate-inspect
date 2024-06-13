# react-native-xstate-floating-inspect

Inspect your V5 xstate machines using an In-App inspector

See the [Demo App](../demo-app/App.tsx) for reference implementation

### Add the package to your dependencies

```bash
$ npm install react-native-xstate-floating-inspect
```

### Usage
There are two ways to use this tool. You can either construct your own inspector using our hook, or you can use our Context Provider which will make the inspector available to your entire app. Only a single instance can be alive at a given time, so pick the use case that works best for you. 

**Once you create the inspector, be sure to render the floating window near the root of your view hierarchy**

### Create a single use Inspector
```typescript
import {
  FloatingInspector,
  useFloatingXStateInspector,
} from "react-native-xstate-floating-inspect";

const Component = () => {
  const inspector = useXStateInspectorDevTool();
  const [state, send] = useMachine(machine, {
    inspect: inspector?.inspect,
  });

  const [isFloatingVisible, setIsFloatingVisible] = useState(true);

  return (
    <>
        ...
        {isFloatingVisible && (
            <FloatingInspector onClosePress={() => setIsFloatingVisible(false)} />
        )}
    </>
  )
}

```

### Use Provided Inspector from Context

First, create a Provider that will internally create the inspector.
```typescript
import { FloatingXStateInspectorProvider } from 'react-native-xstate-floating-inspect';

const App = () => (
    <FloatingXStateInspectorProvider>
        {/* rest of app */}
        <FloatingInspector onClosePress={() => setIsFloatingVisible(false)} />
    </FloatingXStateInspectorProvider>
);
```
Then in a component where you have a machine, grab the inspector using this hook.

```typescript
import { useProvidedXstateFloatingInspector } from 'react-native-xstate-floating-inspect';

 const inspector = useProvidedXstateFloatingInspector();
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
