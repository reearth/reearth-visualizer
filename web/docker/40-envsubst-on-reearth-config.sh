#!/bin/sh

set -e

# rewrite index.html and published.html to change title and favicon
_REEARTH_HTML_FILE="/usr/share/nginx/html/index.html"
_REEARTH_PUBLISHED_HTML_FILE="/usr/share/nginx/html/published.html"

# Rewrite title tag in index.html only if REEARTH_TITLE is set
if [ -n "$REEARTH_TITLE" ]; then
  sed -i -e "s|<title>.*</title>|<title>${REEARTH_TITLE}</title>|g" "$_REEARTH_HTML_FILE"
  sed -i -e "s|<title>.*</title>|<title>${REEARTH_TITLE}</title>|g" "$_REEARTH_PUBLISHED_HTML_FILE"
fi

# Rewrite favicon in index.html and published.html only if REEARTH_FAVICON_URL is set
if [ -n "$REEARTH_FAVICON_URL" ]; then
  sed -i -e "s|<link rel=\"icon\" href=\"[^\"]*\" />|<link rel=\"icon\" href=\"${REEARTH_FAVICON_URL}\" />|g" "$_REEARTH_HTML_FILE"
  sed -i -e "s|<link rel=\"icon\" href=\"[^\"]*\" />|<link rel=\"icon\" href=\"${REEARTH_FAVICON_URL}\" />|g" "$_REEARTH_PUBLISHED_HTML_FILE"
fi

# generate reearth_config.json
_REEARTH_CONFIG_TEMPLATE_FILE="/opt/reearth/reearth_config.json.template"
_REEARTH_CONFIG_OUTPUT_FILE="/usr/share/nginx/html/reearth_config.json"

# Wrap with "" if the value doesn't start with '{[' and end with ']}' (JSON) or "null".
wrap_reearth_variables() {
    for var in $(env | grep '^REEARTH_' | cut -d= -f1); do
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
if ! jq empty "$_REEARTH_CONFIG_OUTPUT_FILE" > /dev/null 2>&1; then
  echo "Invalid JSON configuration file $_REEARTH_CONFIG_OUTPUT_FILE" >&2
  exit 1
fi
