//go:generate go run ../../../pkg/locales/gen/error/generate.go

package locales

import "github.com/reearth/reearthx/i18n"

// ErrorKey defines the type for error keys.
type ErrorKey string

func AddErrorMessages(bundle *i18n.Bundle) {
	addEnErrorMessages(bundle)
	addJaErrorMessages(bundle)
}
