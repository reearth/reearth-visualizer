# OverriddenShaders

This is a set of shaders to override Cesium's shader.

The structure have to be as follow.

```
ShaderName/
  Cesium.glsl ... Clone of Cesium's shader
  Customs.glsl ... Define your own custom functions
  Definitions.glsl ... Definition for each variable or function.
```

In Cesium.glsl, you need to specify the source of the reference as below. Please don't change this file as much as possible, because we need to update this file depending on Cesium's updates. You must only use functions defined in `Custom.glsl`.

```
// Ref: cesium {{VERSION}} {{URL_FOR_THE_SOURCE}}
// ex. Ref: cesium v1.106 https://github.com/CesiumGS/cesium/blob/1.106/packages/engine/Source/Shaders/GlobeFS.glsl
```

Please note that the URL must refer the specific version of Cesium like `https://github.com/CesiumGS/cesium/blob/{{VERSION}}/path`.

In Customs.glsl, you must set `reearth_` prefix to the name of the function like `reearth_own_function()`. Also you must set `reearth_` to the name of the uniform and attribute like `u_reearth_variable` or `v_reearth_variable`.
