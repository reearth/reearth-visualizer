package config

type GraphQLConfig struct {
	ComplexityLimit int  `default:"10000"`
	AccessLog       bool `default:"true"`
}
