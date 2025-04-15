package verror

import (
	"strings"

	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/reearth/reearth/server/pkg/i18n/message"
	"golang.org/x/text/language"
)

type VError struct {
	Key          message.ErrKey
	ErrMsg       map[language.Tag]message.ErrorMessage
	TemplateData map[language.Tag]map[string]interface{}
	Err          error
}

func (e *VError) GetErrCode() string {
	parts := strings.Split(string(e.Key), ".")
	if len(parts) == 0 {
		return string(e.Key)
	}
	return parts[len(parts)-1]
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

func (e *VError) Error() string {
	if e.Err != nil {
		return e.Err.Error()
	}
	return e.ErrMsg[language.English].Message
}

func (e *VError) Unwrap() error {
	return e.Err
}
