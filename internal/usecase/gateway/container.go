package gateway

type Container struct {
	Authenticator    Authenticator
	Mailer           Mailer
	PluginRepository PluginRepository
	DataSource       DataSource
	PluginRegistry   PluginRegistry
	File             File
	Google           Google
}
