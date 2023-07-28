# *!!!! USE AT OWN RISK !!!!*
#### This folder is for any personal plugins you want to write but be treated as builtin, bypassing the sandboxing that happens to regularly installed plugins.


## Basic setup guide
### Server
You must add the URL that is hosting your unsafe builting plugin's YAML file to the server's environment variables `REEARTH_EXT_PLUGIN`. 

For example, you have `REEARTH_EXT_PLUGIN=https://example/com/myPlugin/reearth.yml`, add `REEARTH_EXT_PLUGIN=https://example/com/myPlugin` to your environment variables.

### Frontend

unsafeBuiltinPlugins

Add your plugin code here in their own, plugin separated, directories. Import these in to the unsafeBuiltinPlugins/index.ts file.

Plugin directory structure
- in the root directory have an index.jsx/tsx file that exports your plugin as default

```
type Extension<T extends "widget" | "block"> = {
      type: T;
        extensionId: string;
        name: string;
        component: <Reference Component types in `src/beta/lib/core/Crust/Widgets/Widget` and `src/beta/lib/core/Crust/Infobox/Block` respectively>
}

type Plugin = {
    id: string;
    name: string;
    widgets: Extension<"widget">[];
    blocks: Extension<"block">[];
}
```