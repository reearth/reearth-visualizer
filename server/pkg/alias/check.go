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
	ReservedReearthPrefixProject = "p-"

	ReservedReearthPrefixScene = "c-"

	ReservedReearthPrefixStory = "s-"

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

	subdomainRegex = regexp.MustCompile(`^[a-zA-Z0-9](?:[a-zA-Z0-9-]{3,30})[a-zA-Z0-9]$`)

	ErrInvalidProjectAlias = verror.NewVError(
		errmsg.ErrKeyPkgProjectInvalidAlias,
		errmsg.ErrorMessages[errmsg.ErrKeyPkgProjectInvalidAlias],
		message.MultiLocaleTemplateData(map[string]interface{}{
			"minLength": 5,
			"maxLength": 32,
			"allowedChars": func(locale language.Tag) string {
				return entitymsg.GetLocalizedEntityMessage(entitymsg.EntityKeyPkgProjectAliasAllowedChars, locale)
			},
		}),
		nil,
	)

	ErrExistsProjectAliasAlreadyExists = verror.NewVError(
		errmsg.ErrKeyPkgProjectProjectAliasAlreadyExists,
		errmsg.ErrorMessages[errmsg.ErrKeyPkgProjectProjectAliasAlreadyExists],
		nil,
		nil,
	)

	ErrProjectInvalidProjectAlias = verror.NewVError(
		errmsg.ErrKeyPkgProjectInvalidProjectAlias,
		errmsg.ErrorMessages[errmsg.ErrKeyPkgProjectInvalidProjectAlias],
		nil,
		nil,
	)

	ErrExistsProjectAlias = verror.NewVError(
		errmsg.ErrKeyPkgProjectAliasAlreadyExists,
		errmsg.ErrorMessages[errmsg.ErrKeyPkgProjectAliasAlreadyExists],
		nil,
		nil,
	)

	ErrInvalidReservedProjectAlias = verror.NewVError(
		errmsg.ErrKeyPkgProjectInvalidReservedAlias,
		errmsg.ErrorMessages[errmsg.ErrKeyPkgProjectInvalidReservedAlias],
		nil,
		nil,
	)

	ErrInvalidProjectInvalidPrefixAlias = verror.NewVError(
		errmsg.ErrKeyPkgProjectInvalidPrefixAlias,
		errmsg.ErrorMessages[errmsg.ErrKeyPkgProjectInvalidPrefixAlias],
		nil,
		nil,
	)

	ErrInvalidStorytellingAlias = verror.NewVError(
		errmsg.ErrKeyPkgStorytellingInvalidAlias,
		errmsg.ErrorMessages[errmsg.ErrKeyPkgStorytellingInvalidAlias],
		message.MultiLocaleTemplateData(map[string]interface{}{
			"minLength": 5,
			"maxLength": 32,
			"allowedChars": func(locale language.Tag) string {
				return entitymsg.GetLocalizedEntityMessage(entitymsg.EntityKeyPkgStorytellingAliasAllowedChars, locale)
			},
		}),
		nil,
	)

	ErrExistsStorytellingAlias = verror.NewVError(
		errmsg.ErrKeyPkgStorytellingAliasAlreadyExists,
		errmsg.ErrorMessages[errmsg.ErrKeyPkgStorytellingAliasAlreadyExists],
		nil,
		nil,
	)

	ErrInvalidReservedStorytellingAlias = verror.NewVError(
		errmsg.ErrKeyPkgStorytellingInvalidReservedAlias,
		errmsg.ErrorMessages[errmsg.ErrKeyPkgStorytellingInvalidReservedAlias],
		nil,
		nil,
	)

	ErrInvalidStorytellingInvalidPrefixAlias = verror.NewVError(
		errmsg.ErrKeyPkgStorytellingInvalidPrefixAlias,
		errmsg.ErrorMessages[errmsg.ErrKeyPkgStorytellingInvalidPrefixAlias],
		nil,
		nil,
	)
)

func CheckProjectAliasPattern(alias string) error {
	if alias != "" && !subdomainRegex.Match([]byte(alias)) {
		return ErrInvalidProjectAlias.AddTemplateData("aliasName", alias)
	}
	if _, found := reservedSubdomains[strings.ToLower(alias)]; found {
		return ErrInvalidReservedProjectAlias.AddTemplateData("aliasName", alias)
	}
	return nil
}

func CheckAliasPatternStorytelling(alias string) error {
	if alias != "" && !subdomainRegex.Match([]byte(alias)) {
		return ErrInvalidStorytellingAlias.AddTemplateData("aliasName", alias)
	}
	if _, found := reservedSubdomains[strings.ToLower(alias)]; found {
		return ErrInvalidReservedStorytellingAlias.AddTemplateData("aliasName", alias)
	}
	return nil
}
