package nlslayer

type Config map[string]any

func (c Config) Clone() Config {
	cloned := make(Config)
	for key, value := range c {
		cloned[key] = value
	}
	return cloned
}
