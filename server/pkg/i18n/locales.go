package i18n

import (
	"golang.org/x/text/language"
)

func LocaleTypes() []language.Tag {
	return []language.Tag{language.English, language.Japanese}
}
