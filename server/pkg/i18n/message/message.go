//go:generate go run ../gen/entitymsg/gen.go
//go:generate go run ../gen/errmsg/gen.go
package message

import (
	"bytes"
	"context"
	"html/template"

	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
	"golang.org/x/text/language"
)

type EntityKey string
type EntityMessage map[language.Tag]string

type ErrKey string
type ErrorMessage struct {
	Message     string
	Description string
}

// ApplyTemplate applies template data to the given template string.
func ApplyTemplate(ctx context.Context, tmpl string, data map[language.Tag]map[string]interface{}, locale language.Tag) string {
	processedData := make(map[string]interface{})

	for key, value := range data[locale] {
		if fn, ok := value.(func(language.Tag) string); ok {
			processedData[key] = fn(locale)
		} else {
			processedData[key] = value
		}
	}

	t, err := template.New("message").Option("missingkey=error").Parse(tmpl)
	if err != nil {
		log.Warnfc(ctx, "failed to parse template: %s", err)
		return ""
	}

	var result bytes.Buffer
	if err := t.Execute(&result, processedData); err != nil {
		log.Warnfc(ctx, "failed to execute template: %s", err)
		return ""
	}

	return result.String()
}

func MultiLocaleTemplateData(data map[string]interface{}) map[language.Tag]map[string]interface{} {
	return lo.SliceToMap(i18n.LocaleTypes(), func(locale language.Tag) (language.Tag, map[string]interface{}) {
		return locale, data
	})
}
