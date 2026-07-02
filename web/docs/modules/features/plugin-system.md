---
title: "Plugin System"
module: "app/features/Visualizer/Crust/Plugins"
category: "module"
tags: ["plugins", "zushi", "extensibility", "quickjs", "iframe"]
last_updated: "2026-07-02"
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
  plugin: {
    id?: string;
    extensionId?: string;
    extensionType?: string;
    property?: any;
  };
  context: Context;
  getWidget?: () => { id?: string } | undefined;
  getBlock?: () => { id?: string } | undefined;
};
```

**Purpose**: Provides plugin context including plugin metadata and Re:Earth viewer API.

**Code Reference**: `src/app/features/Visualizer/Crust/Plugins/pluginAPI/zushiAdapter.ts:14`

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

### Issue: "Popup messages showing isFromOurPlugin: false"

**Symptoms**: Popup position/offset updates don't work, messages show `isFromOurPlugin: false` in logs.

**Cause**: Popup iframe contentWindow is `null` when MutationObserver detects iframe creation, so the window isn't registered for message filtering.

**Solution**: The system now waits for iframe load event:

```typescript
if (element.tagName === 'IFRAME') {
  const iframe = element as HTMLIFrameElement;

  const registerWindow = () => {
    if (iframe.contentWindow) {
      surfaceWindowsRef.current.add(iframe.contentWindow);
      return true;
    }
    return false;
  };

  // Try immediately
  if (!registerWindow()) {
    // Wait for load event
    iframe.addEventListener('load', () => {
      registerWindow();
    }, { once: true });
  }
}
```

**Code Reference**: `src/app/features/Visualizer/Crust/Plugins/PluginFrame/useZushiPlugin.ts:284-304`

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

### 2026-07-02 - Zushi Migration Complete

- Migrated from custom QuickJS to Zushi framework
- Implemented comprehensive surface management
- Fixed popup positioning and message routing
- Added iframe window tracking for message filtering
- Created comprehensive test coverage
- Removed legacy QuickJS implementation

---

**Last Updated**: 2026-07-02
**Maintained By**: Platform Team
