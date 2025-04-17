package alias

import (
	"regexp"
	"strings"

	"github.com/reearth/reearth/server/pkg/i18n/message"
	"github.com/reearth/reearth/server/pkg/i18n/message/entitymsg"
	"github.com/reearth/reearth/server/pkg/i18n/message/errmsg"
	"github.com/reearth/reearth/server/pkg/verror"
	"golang.org/x/text/language"
)

var (
	reservedSubdomains = map[string]struct{}{
		"admin":          {},
		"administrator":  {},
		"root":           {},
		"superuser":      {},
		"www":            {},
		"web":            {},
		"api":            {},
		"rest":           {},
		"graphql":        {},
		"localhost":      {},
		"host":           {},
		"system":         {},
		"server":         {},
		"dev":            {},
		"development":    {},
		"test":           {},
		"testing":        {},
		"qa":             {},
		"stg":            {},
		"staging":        {},
		"prd":            {},
		"prod":           {},
		"production":     {},
		"demo":           {},
		"beta":           {},
		"app":            {},
		"application":    {},
		"backend":        {},
		"frontend":       {},
		"dashboard":      {},
		"console":        {},
		"portal":         {},
		"auth":           {},
		"authentication": {},
		"account":        {},
		"user":           {},
		"login":          {},
		"ftp":            {},
		"sftp":           {},
		"ssh":            {},
		"http":           {},
		"https":          {},
		"smtp":           {},
		"mail":           {},
		"email":          {},
		"reearth":        {},
		"visualizer":     {},
		"oss":            {},
		"security":       {},
		"access":         {},
		"password":       {},
		"pwd":            {},
	}

	subdomainRegex = regexp.MustCompile(`^[a-zA-Z0-9]([a-zA-Z0-9-]{5,32}[a-zA-Z0-9])?$`)

	ErrInvalidProjectAlias = verror.NewVError(
		errmsg.ErrKeyPkgProjectInvalidAlias,
		errmsg.ErrorMessages[errmsg.ErrKeyPkgProjectInvalidAlias],
		message.MultiLocaleTemplateData(map[string]interface{}{
			"minLength": 5,
			"maxLength": 32,
			"allowedChars": func(locale language.Tag) string {
				return entitymsg.GetLocalizedEntityMessage(entitymsg.EntityKeyPkgProjectAliasAllowedChars, locale)
			},
		}), nil)

	ErrExistsProjectAlias = verror.NewVError(
		errmsg.ErrKeyPkgProjectAliasAlreadyExists,
		errmsg.ErrorMessages[errmsg.ErrKeyPkgProjectAliasAlreadyExists],
		message.MultiLocaleTemplateData(map[string]interface{}{}), nil)

	ErrInvalidStorytellingAlias = verror.NewVError(
		errmsg.ErrKeyPkgStorytellingInvalidAlias,
		errmsg.ErrorMessages[errmsg.ErrKeyPkgStorytellingInvalidAlias],
		message.MultiLocaleTemplateData(map[string]interface{}{
			"minLength": 5,
			"maxLength": 32,
			"allowedChars": func(locale language.Tag) string {
				return entitymsg.GetLocalizedEntityMessage(entitymsg.EntityKeyPkgStorytellingAliasAllowedChars, locale)
			},
		}), nil)

	ErrExistsStorytellingAlias = verror.NewVError(
		errmsg.ErrKeyPkgStorytellingAliasAlreadyExists,
		errmsg.ErrorMessages[errmsg.ErrKeyPkgStorytellingAliasAlreadyExists],
		message.MultiLocaleTemplateData(map[string]interface{}{}), nil)
)

func CheckAliasPattern(alias string) bool {
	if alias != "" && subdomainRegex.Match([]byte(alias)) {
		if _, found := reservedSubdomains[strings.ToLower(alias)]; !found {
			return true
		}
	}
	return true
}
