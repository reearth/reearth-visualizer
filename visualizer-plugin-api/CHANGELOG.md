# Changelog

## 2.1.0 (initial release)

- Initial release of `@reearth/visualizer-plugin-api`
- TypeScript type definitions for the Re:Earth Visualizer plugin API (the `reearth` global)
- Covers: camera, layers, viewer, sketch, timeline, ui, modal, popup, extension, data, spatialId, engine
- Package version tracks the Re:Earth plugin API version
- Declarations load under `moduleResolution` `bundler` and `Node16`/`NodeNext` (ESM and CommonJS projects); `npm test` packs the package and compiles a sample plugin against it
