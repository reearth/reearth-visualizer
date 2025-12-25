package gateway

import (
	"github.com/reearth/reearthx/mailer"
)

type Container struct {
	Mailer         mailer.Mailer
	PluginRegistry PluginRegistry
	File           File
	Google         Google
	PolicyChecker  PolicyChecker
	DomainChecker  DomainChecker
}
