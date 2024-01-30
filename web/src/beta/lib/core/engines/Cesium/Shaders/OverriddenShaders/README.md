# OverriddenShaders

This is a set of shaders to override Cesium's shader.

The structure have to be as follow.

```
ShaderName/
  XXX.glsl ... Define your own custom functions
  Definitions.glsl ... Definition for each variable or function.
```

You must set `reearth_` prefix to the name of the function like `reearth_own_function()`. Also you must set `reearth_` to the name of the uniform and attribute like `u_reearth_variable` or `v_reearth_variable`.
