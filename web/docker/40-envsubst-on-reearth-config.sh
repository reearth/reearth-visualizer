#!/bin/sh

set -e

# rewrite index.html to change title and favicon
_REEARTH_HTML_FILE="/usr/share/nginx/html/index.html"

# generate reearth_config.json
_REEARTH_CONFIG_TEMPLATE_FILE="/opt/reearth/reearth_config.json.template"
_REEARTH_CONFIG_OUTPUT_FILE="/usr/share/nginx/html/reearth_config.json"

# Wrap with "" if the value doesn't start with '{[' and end with ']}' (JSON) or "null".
wrap_reearth_variables() {
    for var in $(env | grep '^REEARTH_WEB' | cut -d= -f1); do
        value=$(printenv "$var")
        if [ -z "$value" ]; then
            eval "export $var='\"\"'"
        elif [ "$value" != "null" ] && [ "$value" != "true" ] && [ "$value" != "false" ] && ! echo "$value" | grep -qE '^\{.*\}$|^\[.*\]$'; then
            eval "export $var='\"${value}\"'"
        fi
    done
}

wrap_reearth_variables "$@"
envsubst < "$_REEARTH_CONFIG_TEMPLATE_FILE" > "$_REEARTH_CONFIG_OUTPUT_FILE"
