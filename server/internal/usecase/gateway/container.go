package gateway

import "github.com/reearth/reearthx/account/accountusecase/accountgateway"

type Container struct {
	Authenticator  Authenticator
	Mailer         accountgateway.Mailer
	DataSource     DataSource
	PluginRegistry PluginRegistry
	File           File
	Google         Google
}
