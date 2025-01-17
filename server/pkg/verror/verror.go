package verror

import (
	"strings"

	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/reearth/reearth/server/pkg/i18n/message"
	"golang.org/x/text/language"
)

// VError represents an error with a code identifier.
type VError struct {
	Key          message.ErrKey
	ErrMsg       map[language.Tag]message.ErrorMessage
	TemplateData map[language.Tag]map[string]interface{}
	Err          error
}

// GetErrCode returns the error code.
// seperate by "." and return the last element
// sample: "pkg.project.invalid_alias" -> "invalid_alias"
func (e *VError) GetErrCode() string {
	return strings.Split(string(e.Key), ".")[len(strings.Split(string(e.Key), "."))-1]
}

// NewVError creates a new VError with the given key and error.
func NewVError(
	key message.ErrKey,
	errMsg map[language.Tag]message.ErrorMessage,
	templateData map[language.Tag]map[string]interface{},
	err error,
) *VError {
	return &VError{
		Key:          key,
		ErrMsg:       errMsg,
		TemplateData: templateData,
		Err:          err,
	}
}

// Error returns the error message.
func (e *VError) AddTemplateData(key string, value interface{}) *VError {
	clone := &VError{
		Key:          e.Key,
		ErrMsg:       e.ErrMsg,
		TemplateData: e.TemplateData,
		Err:          e.Err,
	}
	if clone.TemplateData == nil {
		clone.TemplateData = make(map[language.Tag]map[string]interface{})
	}
	for _, locale := range i18n.LocaleTypes() {
		if _, ok := e.TemplateData[locale]; !ok {
			clone.TemplateData[locale] = make(map[string]interface{})
		}
		clone.TemplateData[locale][key] = value
	}

	return clone
}

// Error returns the error message.
func (e *VError) Error() string {
	if e.Err != nil {
		return e.Err.Error()
	}
	return ""
}

// Unwrap returns the underlying error.
func (e *VError) Unwrap() error {
	return e.Err
}
