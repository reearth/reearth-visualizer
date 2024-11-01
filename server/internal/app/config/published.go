package config

import "net/url"

type PublishedConfig struct {
	IndexURL *url.URL `pp:",omitempty"`
	Host     string   `pp:",omitempty"`
}
