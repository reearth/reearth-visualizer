# Visualizer component

## Components

- **Visualizer**: Provides all self-contained functions for displaying maps and information
   - Visualizer exposes `VisualizerContext` to subordinate components.
- **Engine**: A component that renders the map (e.g. Cesium, Mapbox, ...)
   - Each engine must accept `EngineProps` and expose `EngineRef` as ref.
- **Plugin**: A component that loads and executes plugin code
- **Primitive**: Objects visible on the map
- **Widget**: User interfaces floating on the screen
- **Infobox**: A component that displays information about the selected Primitive using blocks
- **Block**: Small parts that display information

## Dependencies between components

![Dependencies](./dependencies.svg)

Note: A solid arrow indicates that the component has been imported and is being used. A dashed arrow indicates that the component exposes a ref.

## How to add a new engine?

Create a new component in the `engine` directory, and add the new engine to `engines` in `engine/index.tsx`. Note that all engine components must accept `EngineProps` and expose `engineRef` as ref. That is all. The rest of the Visualizer should work without any changes.
