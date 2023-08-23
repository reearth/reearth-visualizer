package nlslayer

type Config map[string]struct{}

func (c Config) Clone() Config {
	cloned := make(Config)
	for key, value := range c {
		cloned[key] = value
	}
	return cloned
}
