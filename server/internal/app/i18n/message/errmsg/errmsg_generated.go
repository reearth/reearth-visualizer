// Code generated by go generate; DO NOT EDIT.
package errmsg

import (
	"golang.org/x/text/language"
	"github.com/reearth/reearth/server/pkg/i18n/message"
)

const (
	ErrKeyUnknown message.ErrKey = "unknown"
	ErrKeyUsecaseRepoResourceNotFound message.ErrKey = "usecase.repo.resource_not_found"
)

var ErrorMessages = map[message.ErrKey]map[language.Tag]message.ErrorMessage{
	ErrKeyUnknown: {
		language.English: {
			Message:     "An unknown error occurred.",
			Description: "The cause of the error cannot be determined.",
		},
		language.Japanese: {
			Message:     "不明なエラーが発生しました。",
			Description: "エラーが発生した原因を特定できません。",
		},
	},
	ErrKeyUsecaseRepoResourceNotFound: {
		language.English: {
			Message:     "Resource not found.",
			Description: "The resource does not exist or you do not have access.",
		},
		language.Japanese: {
			Message:     "リソースが見つかりません。",
			Description: "リソースが存在しないか、アクセス権限がありません。",
		},
	},
}
