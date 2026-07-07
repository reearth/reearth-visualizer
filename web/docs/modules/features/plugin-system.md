---
title: "Plugin System"
module: "app/features/Visualizer/Crust/Plugins"
category: "module"
tags: ["plugins", "zushi", "extensibility", "quickjs", "iframe", "performance"]
last_updated: "2026-07-07"
related:
  - ../../concepts/plugin-architecture.md
  - ../../guides/plugin-development.md
maintainers: ["Platform Team"]
---

# Plugin System

## Overview

The Re:Earth Visualizer plugin system enables users to extend the application's functionality through custom JavaScript code. Plugins run in isolated sandboxed environments and can display custom UI, interact with the map viewer, and respond to events.

The system is built on [Zushi](https://github.com/reearth/zushi), a modern JavaScript plugin framework that provides secure sandboxing via QuickJS WebAssembly and iframe-based surface rendering.

## Purpose

The plugin system serves multiple purposes:

- **Extensibility**: Users can add custom features without modifying core code
- **Isolation**: Plugins run in sandboxed environments, protecting the main application
- **UI Integration**: Plugins can render custom UI through multiple surfaces (widget, modal, popup)
- **Event-Driven**: Plugins respond to viewer events (camera changes, layer updates, etc.)
- **Message Passing**: Bidirectional communication between plugin code and UI

## Key Components

- **PluginFrame**: React component that manages plugin lifecycle and surfaces
- **useZushiPlugin**: React hook that handles Zushi plugin initialization and cleanup
- **zushiAdapter**: Bridge between Zushi's surface API and Re:Earth's plugin API
- **Plugin API**: Exposed JavaScript API for plugins to interact with the viewer
- **Surface Management**: UI, Modal, and Popup containers for plugin rendering

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│            Re:Earth Visualizer App                  │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │        PluginFrame Component               │   │
│  │                                            │   │
│  │  ┌──────────────────────────────────┐    │   │
│  │  │     useZushiPlugin Hook          │    │   │
│  │  │                                  │    │   │
│  │  │  ┌─────────────────────────┐    │    │   │
│  │  │  │   Zushi Plugin          │    │    │   │
│  │  │  │                         │    │    │   │
│  │  │  │  ┌────────────────┐    │    │    │   │
│  │  │  │  │ QuickJS (WASM) │    │    │    │   │
│  │  │  │  │ Plugin Code    │    │    │    │   │
│  │  │  │  └────────────────┘    │    │    │   │
│  │  │  │         ↕                │    │    │   │
│  │  │  │  ┌────────────────┐    │    │    │   │
│  │  │  │  │ Exposed API    │    │    │    │   │
│  │  │  │  │ (zushiAdapter) │    │    │    │   │
│  │  │  │  └────────────────┘    │    │    │   │
│  │  │  │         ↕                │    │    │   │
│  │  │  │  ┌────────────────┐    │    │    │   │
│  │  │  │  │ Surfaces       │    │    │    │   │
│  │  │  │  │ - UI (Widget)  │    │    │    │   │
│  │  │  │  │ - Modal        │    │    │    │   │
│  │  │  │  │ - Popup        │    │    │    │   │
│  │  │  │  └────────────────┘    │    │    │   │
│  │  │  └─────────────────────────┘    │    │   │
│  │  └──────────────────────────────────┘    │   │
│  └────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Component Relationships

**PluginFrame** orchestrates the entire plugin lifecycle:

- Receives plugin source code and configuration
- Manages surface containers (UI, Modal, Popup)
- Forwards callbacks to useZushiPlugin
- Handles portal rendering for modal/popup

**useZushiPlugin** manages Zushi integration:

- Creates and starts Zushi Plugin instance
- Sets up surface configuration with container refs
- Handles plugin lifecycle (initialization, disposal)
- Manages message routing between plugin and host
- Tracks iframe windows for message filtering

**zushiAdapter** provides the bridge:

- Creates the exposed `reearth` API for plugin code
- Maps Zushi surface methods to Re:Earth API methods
- Handles message event registration (on/off/once)
- Provides Re:Earth context (viewer, camera, layers, etc.)

## Dependencies

### Internal Dependencies

- `@reearth/core` - 3D visualization engine
- `src/app/features/Visualizer/Crust/Plugins/Plugin` - Plugin management
- `src/services/api` - API integration

### External Dependencies

- `@reearth/zushi` - Plugin framework with QuickJS backend
- `react` - React framework for component management
- `@floating-ui/react` - Popup positioning

## API Reference

### Component: `PluginFrame`

**Purpose**: Main component that manages plugin rendering and lifecycle.

**Props**:

```typescript
type Props = {
  className?: string;
  uiVisible?: boolean;
  skip?: boolean;
  src?: string;
  sourceCode?: string;
  renderPlaceholder?: ReactNode;
  autoResize?: "both" | "width-only" | "height-only";
  iFrameProps?: IframeHTMLAttributes<HTMLIFrameElement>;
  modalContainer?: HTMLElement | DocumentFragment | null;
  popupContainer?: HTMLElement | DocumentFragment | null;
  modalVisible?: boolean;
  popupVisible?: boolean;
  externalRef?: RefObject<HTMLIFrameElement | null>;
  uiContainerRef?: RefObject<HTMLElement | null>;
  isMarshalable?: boolean | "json" | ((target: unknown) => boolean | "json");
  pluginContext: ReearthPluginContext;
  onMessage?: (message: unknown) => void;
  onPreInit?: () => void;
  onError?: (err: unknown) => void;
  onDispose?: () => void;
  onClick?: () => void;
  onRender?: (type: string) => void;
};
```

**Example**:

```typescript
<PluginFrame
  sourceCode="console.log('Hello from plugin!');"
  pluginContext={pluginContext}
  uiVisible={true}
  modalContainer={modalContainerElement}
  popupContainer={popupContainerElement}
  onError={(err) => console.error('Plugin error:', err)}
/>
```

**Code Reference**: `src/app/features/Visualizer/Crust/Plugins/PluginFrame/index.tsx`

### Hook: `useZushiPlugin`

**Purpose**: Manages Zushi plugin lifecycle, surface setup, and message routing.

**Parameters**:

```typescript
type Options = {
  src?: string;
  sourceCode?: string;
  skip?: boolean;
  isMarshalable?: boolean | "json" | ((obj: unknown) => boolean | "json");
  ref?: ForwardedRef<Ref>;
  pluginContext: ReearthPluginContext;
  onError?: (err: unknown) => void;
  onPreInit?: () => void;
  onDispose?: () => void;
  onMessage?: (msg: unknown) => void;
};
```

**Returns**:

```typescript
type UseZushiPluginReturn = {
  loaded: boolean;
  handleMessage: (msg: unknown) => void;
  surfaceRefs: SurfaceRefs;
  modalElement: HTMLDivElement;
  popupElement: HTMLDivElement;
};
```

**Code Reference**: `src/app/features/Visualizer/Crust/Plugins/PluginFrame/useZushiPlugin.ts`

### Function: `createZushiExposedAPI`

**Purpose**: Creates the exposed `reearth` API available to plugin code.

**Parameters**:

- `reearthContext: ReearthPluginContext` - Re:Earth context with viewer, camera, layers, etc.
- `messageHandlers: MessageHandlers` - Message event handlers (on/off/once)

**Returns**: `(zushiContext: ZushiContext) => GlobalThis` - Factory function that creates the exposed API

**Example**:

```typescript
const exposedAPI = createZushiExposedAPI(pluginContext, {
  onMessage: (handler) => messageEvents.add(handler),
  offMessage: (handler) => messageEvents.delete(handler),
  onceMessage: (handler) => messageOnceEvents.add(handler)
});

const plugin = new Plugin({
  code: pluginCode,
  backend: quickjs({ isMarshalable: true }),
  surfaces: { ui: { container } },
  exposed: exposedAPI
});
```

**Code Reference**: `src/app/features/Visualizer/Crust/Plugins/pluginAPI/zushiAdapter.ts`

### Type: `ReearthPluginContext`

```typescript
export type ReearthPluginContext = {
  plugin?: {
    id: string;
    extensionType: string;
    extensionId: string;
    property: unknown;
  };
  context: Context;
  getWidget?: () => Widget | undefined;
  getBlock?: () => Reearth["extension"]["block"] | undefined;
  getLayer?: () => Layer | undefined;
  getUIContainerRef?: () => { current: HTMLElement | null } | undefined;
  onRender?: (type: string) => void;
  onModalShow?: (options?: {
    background?: string;
    clickBgToClose?: boolean;
  }) => void;
  onPopupShow?: (options?: PluginPopupInfo) => void;
  onModalClose?: () => void;
  onPopupClose?: () => void;
  registerPluginMessageSender?: (
    sender: (msg: { data: unknown; sender: string }) => void
  ) => void;
  unregisterPluginMessageSender?: () => void;
};
```

**Purpose**: Provides plugin context including plugin metadata, Re:Earth viewer API, and lifecycle callbacks.

**Code Reference**: `src/app/features/Visualizer/Crust/Plugins/pluginAPI/zushiAdapter.ts:26`

## Plugin API (Exposed to Plugin Code)

The plugin API exposed via `globalThis.reearth` provides comprehensive access to the Re:Earth viewer:

### Core Properties

- `reearth.version` - Re:Earth version
- `reearth.apiVersion` - Plugin API version
- `reearth.engine` - 3D engine name (e.g., "Cesium")

### Viewer API

```javascript
reearth.viewer.flyTo(destination, options)
reearth.viewer.lookAt(destination, options)
```

### Camera API

```javascript
reearth.camera.position  // Current camera position
reearth.camera.viewport  // Current viewport bounds
reearth.camera.flyTo(destination, options)
```

### Layers API

```javascript
reearth.layers.layers      // Array of all layers
reearth.layers.add(layer)
reearth.layers.delete(layerId)
reearth.layers.show(layerId)
reearth.layers.hide(layerId)
```

### Timeline API

```javascript
reearth.timeline.current   // Current time
reearth.timeline.play()
reearth.timeline.pause()
```

### Sketch API

```javascript
reearth.sketch.create(geometry)
reearth.sketch.update(sketchId, geometry)
reearth.sketch.delete(sketchId)
```

### Extension API (Message Events)

```javascript
reearth.extension.on("message", (msg) => {
  console.log("Received:", msg);
});

reearth.extension.off("message", handler);
reearth.extension.once("message", handler);
```

### UI Surface API

```javascript
// Show widget UI
reearth.ui.show("<div>My UI</div>", {
  width: 300,
  height: 400
});

// Post message to UI iframe
reearth.ui.postMessage({ type: "data", value: 42 });

// Close UI
reearth.ui.close();
```

### Modal Surface API

```javascript
// Show modal dialog
reearth.modal.show("<div>Modal content</div>", {
  width: "50%",
  height: 500
});

// Post message to modal iframe
reearth.modal.postMessage({ action: "update" });

// Close modal
reearth.modal.close();
```

### Popup Surface API

```javascript
// Show popup near widget
reearth.popup.show("<div>Popup content</div>", {
  width: 200,
  height: 100
});

// Update popup position
reearth.popup.postMessage({
  type: "position",
  offset: { x: 10, y: 20 },
  position: "bottom-start"
});

// Close popup
reearth.popup.close();
```

## Surface Management

### Surface Types

The plugin system supports three types of surfaces:

1. **UI Surface (Widget)**: Main plugin UI displayed in the visualizer
2. **Modal Surface**: Full-screen or centered modal dialogs
3. **Popup Surface**: Positioned popup relative to the widget

### Surface Lifecycle

Each surface follows this lifecycle:

```
1. Container Creation (useZushiPlugin)
   - Create HTMLDivElement for each surface
   - Set base styles (width, height, etc.)

2. Surface Configuration (Zushi)
   - Pass container refs to Zushi Plugin
   - Configure autoResize behavior

3. Surface Rendering (Zushi)
   - Create iframe inside container
   - Inject HTML content
   - Set up message passing

4. Surface Updates
   - show() - Make surface visible, update content
   - update() - Update content without visibility change
   - setVisible() - Toggle visibility

5. Surface Cleanup (useZushiPlugin)
   - Dispose Zushi Plugin
   - Remove containers from DOM
```

### Surface Container Management

**UI Container**:

- Rendered directly in PluginFrame component
- Visibility controlled by `uiVisible` prop
- Ref exposed via `uiContainerRef` for popup positioning

**Modal Container**:

- Created as detached DOM element
- Manually appended to `modalContainer` portal
- Positioned/styled by ModalContainer wrapper component

**Popup Container**:

- Created as detached DOM element
- Manually appended to `popupContainer` portal
- Positioned relative to UI container via floating-ui

### Message Filtering

To prevent plugins from receiving messages from other plugins, the system tracks iframe windows:

```typescript
// Track all iframe windows from plugin surfaces
surfaceWindowsRef.current.add(iframe.contentWindow);

// Filter messages by source
window.addEventListener("message", (ev) => {
  const isFromOurPlugin = surfaceWindowsRef.current.has(ev.source);
  if (!isFromOurPlugin) return; // Ignore

  handleMessage(ev.data);
});
```

**Key Implementation**:

- MutationObserver watches for dynamically added iframes
- Waits for iframe.contentWindow to be available (load event)
- Registers all iframe windows in a Set for fast lookup

**Code Reference**: `src/app/features/Visualizer/Crust/Plugins/PluginFrame/useZushiPlugin.ts:276-326`

## Message Handling

### Message Flow

```
Plugin Code → window.parent.postMessage()
     ↓
Iframe contentWindow (source)
     ↓
Host window.addEventListener("message")
     ↓
Message Filter (check source)
     ↓
handleMessage() (useZushiPlugin)
     ↓
Message Event Handlers (on/off/once)
     ↓
Plugin Extension API callbacks
```

### Message Event Registration

Plugins register message handlers through the extension API:

```javascript
// Plugin code
reearth.extension.on("message", (msg) => {
  console.log("Message received:", msg);
});
```

### Message Sending

Host sends messages to plugin:

```typescript
// Host code
pluginContext.context.pluginInstances.postMessage(
  pluginId,
  extensionId,
  message
);
```

## Plugin Lifecycle

### 1. Initialization

```typescript
onPreInit?.(); // User callback

// Load plugin code
const code = sourceCode ?? (await fetch(src).text());

// Create Zushi Plugin
const plugin = new Plugin({
  code,
  backend: quickjs({ isMarshalable: true }),
  surfaces: {
    ui: { container: uiContainer.current, autoResize: "both" },
    modal: { container: modalContainer.current, autoResize: "both" },
    popup: { container: popupContainer.current, autoResize: "both" }
  },
  exposed: createZushiExposedAPI(pluginContext, messageHandlers)
});

// Start plugin execution
await plugin.start();
```

### 2. Running State

- Plugin code executes in QuickJS sandbox
- Has access to `globalThis.reearth` API
- Can call surface methods (show, update, postMessage)
- Can register event handlers
- Can interact with viewer API

### 3. Message Exchange

- Plugin sends messages via `window.parent.postMessage()`
- Host filters messages by iframe source
- Host calls registered message handlers
- Host can send messages to plugin via `postMessage()`

### 4. Cleanup/Disposal

```typescript
// User callback
onDispose?.();

// Clear message events
messageEvents.clear();
messageOnceEvents.clear();

// Dispose Zushi plugin
plugin.dispose();

// Remove DOM elements
modalContainerElement.remove();
popupContainerElement.remove();
```

## Marshaling Strategy

The plugin system controls how data is transferred between the host and plugin code:

### Default Strategy

```typescript
const defaultIsMarshalable = (obj: unknown): boolean => {
  return (
    ((typeof obj !== "object" || obj === null) && typeof obj !== "function") ||
    Array.isArray(obj) ||
    Object.getPrototypeOf(obj) === Function.prototype ||
    Object.getPrototypeOf(obj) === Object.prototype ||
    obj instanceof Date ||
    obj instanceof Promise ||
    obj instanceof AsyncFunction
  );
};
```

**Allowed Types**:

- Primitives (string, number, boolean, null, undefined)
- Plain objects and arrays
- Functions (including async functions)
- Dates
- Promises

**Rejected Types**:

- Class instances
- DOM elements
- Complex objects with custom prototypes

### Custom Marshaling

```typescript
// JSON-only marshaling
<PluginFrame
  isMarshalable="json"
  {...props}
/>

// Custom function
<PluginFrame
  isMarshalable={(obj) => {
    // Custom logic
    return true;
  }}
  {...props}
/>
```

## Usage Examples

### Basic Plugin

```typescript
import { PluginFrame } from "@reearth/app/features/Visualizer/Crust/Plugins/PluginFrame";

const MyPluginWrapper = () => {
  const pluginContext = usePluginContext();

  return (
    <PluginFrame
      sourceCode={`
        console.log("Plugin started!");

        reearth.ui.show("<div>Hello World</div>", {
          width: 300,
          height: 200
        });
      `}
      pluginContext={pluginContext}
      uiVisible={true}
      onError={(err) => console.error("Plugin error:", err)}
    />
  );
};
```

### Plugin with Modal

```typescript
const PluginWithModal = () => {
  const modalContainerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={modalContainerRef} />

      <PluginFrame
        sourceCode={`
          reearth.ui.show("<button id='btn'>Open Modal</button>");

          document.getElementById('btn').addEventListener('click', () => {
            reearth.modal.show("<div>Modal Content</div>", {
              width: "50%",
              height: 400
            });
          });
        `}
        pluginContext={pluginContext}
        modalContainer={modalContainerRef.current}
        uiVisible={true}
      />
    </>
  );
};
```

### Plugin with Message Handling

```typescript
const InteractivePlugin = () => {
  const [message, setMessage] = useState<unknown>(null);

  const handleMessage = useCallback((msg: unknown) => {
    console.log("Received from plugin:", msg);
    setMessage(msg);
  }, []);

  return (
    <PluginFrame
      sourceCode={`
        let count = 0;

        reearth.ui.show(\`
          <button id='btn'>Click me (\${count})</button>
        \`);

        document.getElementById('btn').addEventListener('click', () => {
          count++;
          parent.postMessage({ type: 'click', count }, '*');
        });

        reearth.extension.on('message', (msg) => {
          if (msg.type === 'reset') {
            count = 0;
          }
        });
      `}
      pluginContext={pluginContext}
      uiVisible={true}
      onMessage={handleMessage}
    />
  );
};
```

### Plugin Loading from URL

```typescript
const RemotePlugin = () => {
  return (
    <PluginFrame
      src="https://example.com/plugin.js"
      pluginContext={pluginContext}
      uiVisible={true}
      renderPlaceholder={<div>Loading plugin...</div>}
    />
  );
};
```

## Configuration

### Environment Variables

No specific environment variables required. Plugin behavior is controlled via props.

### Runtime Configuration

Plugins can access Re:Earth configuration through the exposed API:

```javascript
// Plugin code
const version = reearth.version;
const engine = reearth.engine;
```

## Testing

### Unit Tests

**Location**: `src/app/features/Visualizer/Crust/Plugins/PluginFrame/`

**Test Files**:

- `useZushiPlugin.test.ts` - Hook behavior and lifecycle
- `index.test.tsx` - PluginFrame component integration
- `pluginAPI/zushiAdapter.test.ts` - Adapter functionality

**Run tests**:

```bash
yarn test src/app/features/Visualizer/Crust/Plugins/PluginFrame/
```

### Testing Strategies

**Mocking Zushi**:

```typescript
vi.mock("@reearth/zushi", () => ({
  Plugin: vi.fn(() => ({
    start: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn()
  })),
  quickjs: vi.fn(() => ({ isMarshalable: true }))
}));
```

**Testing Message Handling**:

```typescript
test("handles message events", () => {
  const onMessage = vi.fn();

  const { result } = renderHook(() =>
    useZushiPlugin({
      sourceCode: "console.log('test');",
      pluginContext: mockContext,
      skip: false,
      onMessage
    })
  );

  const testMessage = { type: "test", data: "hello" };
  result.current.handleMessage(testMessage);

  expect(onMessage).toHaveBeenCalledWith(testMessage);
});
```

**Testing Surface Rendering**:

```typescript
test("shows UI surface when uiVisible=true", () => {
  const { container } = render(
    <PluginFrame
      sourceCode="console.log('test');"
      pluginContext={mockContext}
      uiVisible={true}
      className="test-plugin-ui"
    />
  );

  const uiDiv = container.querySelector(".test-plugin-ui");
  expect(uiDiv).toHaveStyle({ display: "block" });
});
```

## Common Issues

### Issue: "Modal/Popup close button doesn't work"

**Symptoms**: Clicking close button in modal or popup has no effect. Messages from modal/popup iframes show `isFromOurPlugin: false` in logs.

**Cause**: When Zushi creates an iframe for modal/popup surface, the iframe element exists in the DOM immediately, but `iframe.contentWindow` is `null` until the iframe loads. The system was trying to register contentWindow during initial collection, getting null, and never registering the window for message filtering.

**Root Cause**: Two collection points, both had the same issue:
1. Initial collection after `plugin.start()` - iframe exists but not loaded
2. MutationObserver for dynamically added iframes - detects iframe before it loads

**Solution**: The system now waits for iframe load event at both collection points:

```typescript
const collectIframeWindows = (container: HTMLElement) => {
  const iframes = container.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    const registerWindow = () => {
      if (iframe.contentWindow) {
        surfaceWindowsRef.current.add(iframe.contentWindow);
        return true;
      }
      return false;
    };

    // Try to register immediately
    if (!registerWindow()) {
      // If contentWindow is not available yet, wait for load event
      iframe.addEventListener('load', () => {
        registerWindow();
      }, { once: true });
    }
  });
};
```

**Impact**: This pattern is applied to:
- Initial iframe collection after plugin.start()
- MutationObserver detection of dynamically added iframes
- All three surfaces: UI, Modal, and Popup

**Code Reference**: `src/app/features/Visualizer/Crust/Plugins/PluginFrame/useZushiPlugin.ts:290-310`

### Issue: "Plugin not loading"

**Symptoms**: Plugin doesn't initialize, no UI appears, `loaded` stays `false`.

**Cause**: Either `skip={true}`, no source code provided, or container refs are `null`.

**Solution**:

- Ensure `skip={false}` or undefined
- Provide either `sourceCode` or `src` prop
- Ensure containers are mounted before plugin initialization

```typescript
// Check if containers exist
if (!uiContainer.current || !modalContainer.current || !popupContainer.current) {
  return; // Skip initialization
}
```

### Issue: "Messages from other plugins received"

**Symptoms**: Plugin receives messages intended for other plugins.

**Cause**: Message filtering not working correctly.

**Solution**: System tracks iframe windows and filters by source:

```typescript
const isFromOurPlugin = surfaceWindowsRef.current.has(ev.source as Window);
if (!isFromOurPlugin) return; // Ignore
```

Ensure MutationObserver is properly set up to track all iframes.

## Performance Considerations

### Plugin Initialization Cost

Plugin initialization is expensive due to:
- QuickJS WebAssembly runtime startup
- Plugin code loading and parsing
- Surface iframe creation
- Exposed API setup

**Critical Optimization**: The system uses several patterns to prevent unnecessary plugin remounts:

#### 1. Ref-Based Context Pattern

```typescript
// context.tsx
const PluginContext = createContext<ContextRef | undefined>(undefined);

export const PluginProvider: FC<PropsWithChildren<{ value: Context }>> = ({
  children,
  value
}) => {
  const contextRef = useRef<Context>(value);
  useEffect(() => {
    contextRef.current = value;
  });

  const stableValue = useMemo(() => contextRef, []);
  return <PluginContext.Provider value={stableValue}>{children}</PluginContext.Provider>;
};
```

**Why**: React Context has "all-or-nothing" notifications. Without this pattern, adding one story block would cause ALL plugins to re-render. By passing a stable ref as the context value, React never notifies consumers, preventing cascading re-renders.

**Code Reference**: `src/app/features/Visualizer/Crust/Plugins/context.tsx`

#### 2. pluginContextRef Pattern

```typescript
// useZushiPlugin.ts
const pluginContextRef = useRef(pluginContext);
useEffect(() => {
  pluginContextRef.current = pluginContext;
});

// Use ref in exposed API, omit from useEffect deps
const plugin = new Plugin({
  exposed: createZushiExposedAPI(pluginContextRef.current, messageHandlers)
});
```

**Why**: Zushi's exposed API is created once and cannot be updated. If `pluginContext` were in useEffect deps, the plugin would remount on every context change. The ref allows accessing latest context data without triggering remounts.

**Code Reference**: `src/app/features/Visualizer/Crust/Plugins/PluginFrame/useZushiPlugin.ts:114-118`

#### 3. Stable Callbacks with Refs

```typescript
// Plugin/hooks/index.ts
const callbacksRef = useRef({ onPluginModalShow, widget, block });
useEffect(() => {
  callbacksRef.current = { onPluginModalShow, widget, block };
});

const handleModalShow = useCallback(
  (options) => {
    callbacksRef.current.onPluginModalShow?.(options);
  },
  [] // Empty deps = stable callback
);
```

**Why**: Callbacks are passed to Zushi via `pluginContext`. If callbacks change, `pluginContext` must be recreated, causing plugin remount. Stable callbacks with refs prevent this while still accessing latest values.

**Code Reference**: `src/app/features/Visualizer/Crust/Plugins/Plugin/hooks/index.ts:189-217`

#### 4. Plugin Instance Isolation

Each plugin instance (widget, story block, infobox block) is properly isolated:
- Editing block A only causes Plugin A to re-render
- Plugins B and C are unaffected (their block references unchanged)
- Adding/removing blocks only affects the added/removed plugins

**Anti-Pattern**: Creating a key string from all block IDs (e.g., `"id1,id2,id3"`) would couple all plugins together, causing all to re-render when any single block changes.

### Bundle Size

- Zushi uses QuickJS WASM (~1.5MB compressed)
- Consider code splitting for plugin-heavy pages
- Lazy load plugin source code when possible

### Memory Management

- Dispose plugins when unmounting
- Clean up message event listeners
- Remove DOM elements from memory
- Clear iframe window references

### Rendering Performance

- Use `skip={true}` to prevent plugin initialization when not visible
- Limit number of simultaneously active plugins
- Consider virtualizing plugin lists

## Development Guidelines

### Adding New Async Methods to Plugin API

**CRITICAL REQUIREMENT**: All async methods exposed to plugins MUST trigger Zushi's event loop after their promises resolve. Without this, plugin execution freezes.

#### Why This Is Required

Zushi runs plugin code in a QuickJS WebAssembly VM. When an async operation (Promise) resolves outside the VM, the VM doesn't automatically resume execution. You must call `startEventLoop()` to pump the event queue.

**Symptom of Missing Wrapper**: The async method works on the second call but not the first (because another event happens to trigger the loop).

#### How to Add New Async Methods

**Step 1: Identify if the method returns a Promise**

```typescript
// Example: A new async method in viewer.tools
const myNewAsyncMethod = useCallback(
  async (param: string) => {
    return await someAsyncOperation(param);
  },
  []
);
```

**Step 2: Wrap it using `wrapAsync()` utility**

Location: `src/app/features/Visualizer/Crust/Plugins/pluginAPI/zushiAdapter.ts`

The `wrapAsync()` utility automatically triggers `startEventLoop()` after promise resolution:

```typescript
/**
 * Generic utility to wrap async functions with event loop trigger
 */
function wrapAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  startEventLoop: () => void
): T {
  return ((...args: Parameters<T>) => {
    const promise = fn(...args);
    promise.then(() => startEventLoop()).catch(() => startEventLoop());
    return promise;
  }) as T;
}
```

**Step 3: Add to appropriate wrapper function**

For viewer.tools methods, add to `wrapCommonReearth()`:

```typescript
function wrapCommonReearth(
  commonReearth: CommonReearth,
  startEventLoop: () => void
): CommonReearth {
  return {
    ...commonReearth,
    viewer: {
      ...commonReearth.viewer,
      tools: {
        ...commonReearth.viewer.tools,
        // Existing async methods
        getCurrentLocationAsync: wrapAsync(
          commonReearth.viewer.tools.getCurrentLocationAsync,
          startEventLoop
        ),
        // NEW: Your async method
        myNewAsyncMethod: wrapAsync(
          commonReearth.viewer.tools.myNewAsyncMethod,
          startEventLoop
        )
      }
    }
  };
}
```

For other async methods (camera, layers, etc.), follow the same pattern.

#### Currently Wrapped Async Methods

**clientStorage** (wrapped in `wrapClientStorage`):
- `getAsync`
- `setAsync`
- `deleteAsync`
- `keysAsync`
- `dropStore`

**viewer.tools** (wrapped in `wrapCommonReearth`):
- `getCurrentLocationAsync` - Browser geolocation API
- `getTerrainHeightAsync` - Terrain height sampling
- `getGeoidHeight` - Geoid height calculation

#### Testing Async Methods

Always test that:
1. The method works on first call (not just second)
2. Event loop is triggered on success
3. Event loop is triggered on error

Example test:

```typescript
test("new async method triggers event loop", async () => {
  const startEventLoop = vi.fn();
  const myAsyncMethod = vi.fn().mockResolvedValue("result");

  // ... setup context with myAsyncMethod

  const globalThis = factory(mockZushiContext);

  await globalThis.reearth.viewer.tools.myAsyncMethod("param");

  expect(myAsyncMethod).toHaveBeenCalledWith("param");
  expect(startEventLoop).toHaveBeenCalled(); // CRITICAL
});
```

**Code Reference**: `src/app/features/Visualizer/Crust/Plugins/pluginAPI/zushiAdapter.ts:415-526`

**Test Reference**: `src/app/features/Visualizer/Crust/Plugins/pluginAPI/zushiAdapter.test.ts:397-490`

## Security Considerations

### Sandboxing

- Plugin code runs in QuickJS sandbox (no direct DOM access)
- UI renders in separate iframe (same-origin isolation)
- Exposed API is the only interface to host

### Message Validation

- Validate messages from plugin UI before processing
- Sanitize HTML content before rendering in surfaces
- Filter messages by iframe source to prevent cross-plugin messages

### Content Security

- Plugin HTML content is subject to CSP policies
- Avoid inline scripts in plugin-generated HTML
- Use `postMessage` for communication, not direct function calls

## Migration Guide

### From Legacy QuickJS Implementation

The legacy implementation used custom QuickJS integration. The Zushi-based system provides:

**Benefits**:

- ✅ Managed plugin lifecycle
- ✅ Built-in surface management
- ✅ Automatic iframe creation and cleanup
- ✅ Better error handling
- ✅ Simplified message passing

**Breaking Changes**:

- Surface API methods changed (render → show, resize → update)
- Plugin initialization now async
- Message handlers use standard addEventListener pattern

**Migration Steps**:

1. Update plugin source code to use new surface API:

```javascript
// Old
reearth.ui.render("<div>Content</div>", { visible: true });

// New
reearth.ui.show("<div>Content</div>", { width: 300, height: 400 });
```

2. Update surface visibility handling:

```javascript
// Old
reearth.ui.resize(300, 400);

// New
reearth.ui.update({ width: 300, height: 400 });
```

3. Update close behavior:

```javascript
// Old
reearth.ui.resize(0, 0);

// New
reearth.ui.close();
```

**Compatibility**: The adapter provides a compatibility layer for common legacy patterns, but updating to new APIs is recommended.

## Related Documentation

- [3D Rendering Concepts](../../concepts/3d-rendering.md)
- [Architecture Overview](../../architecture/overview.md)
- [Plugin Development Guide](../../guides/plugin-development.md)

## Code References

- `src/app/features/Visualizer/Crust/Plugins/PluginFrame/index.tsx` - Main component
- `src/app/features/Visualizer/Crust/Plugins/PluginFrame/useZushiPlugin.ts` - Core hook
- `src/app/features/Visualizer/Crust/Plugins/pluginAPI/zushiAdapter.ts` - API bridge
- `src/app/features/Visualizer/Crust/Plugins/Plugin/index.tsx` - Plugin management

## External Resources

- [Zushi Framework](https://github.com/reearth/zushi) - Plugin framework documentation
- [QuickJS](https://bellard.org/quickjs/) - JavaScript engine
- [Floating UI](https://floating-ui.com/) - Popup positioning library

## Changelog

### 2026-07-07 - Performance Optimization and Bug Fixes

- **Fixed**: Modal/popup close button not working due to iframe contentWindow timing issue
  - Added load event listener for iframe window registration
  - Applied fix to both initial collection and MutationObserver
  - Fixed nested iframe detection in MutationObserver to use same load event pattern
- **Fixed**: Removed block ID key-based memoization that coupled all plugin re-renders
  - Each plugin instance now properly isolated
  - Editing one block no longer affects other plugins
- **Fixed**: Async viewer.tools methods (getCurrentLocationAsync, getTerrainHeightAsync, getGeoidHeight) not working on first call
  - Added wrapAsync utility to trigger Zushi event loop after promise resolution
  - Applied to all async methods in clientStorage and viewer.tools
  - Created comprehensive development guidelines for adding new async methods
- **Fixed**: modal.update not applying background and clickBgToClose options
- **Improved**: Added comprehensive documentation of optimization patterns
  - Documented ref-based context pattern
  - Documented pluginContextRef pattern
  - Documented stable callbacks pattern
- **Improved**: Added detailed comments explaining non-obvious patterns in code
- **Improved**: Created "Development Guidelines" section with async method requirements and examples

### 2026-07-02 - Zushi Migration Complete

- Migrated from custom QuickJS to Zushi framework
- Implemented comprehensive surface management
- Fixed popup positioning and message routing
- Added iframe window tracking for message filtering
- Created comprehensive test coverage
- Removed legacy QuickJS implementation

---

**Last Updated**: 2026-07-07
**Maintained By**: Platform Team
