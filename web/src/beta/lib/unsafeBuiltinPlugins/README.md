# *!!!! USE AT OWN RISK !!!!*
#### This folder is for any personal plugins you want to write but be treated as builtin, bypassing the sandboxing that happens to regularly installed plugins.


## Basic setup guide
### Server
You must add the URL that is hosting your unsafe builting plugin's YAML file to the server's environment variables `REEARTH_EXT_PLUGIN`. 

For example, you have `REEARTH_EXT_PLUGIN=https://example/com/myPlugin/reearth.yml`, add `REEARTH_EXT_PLUGIN=https://example/com/myPlugin` to your environment variables.

### Frontend
