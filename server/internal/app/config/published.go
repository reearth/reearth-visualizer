package config

import "net/url"

type PublishedConfig struct {
	IndexURL *url.URL
	Host     string
}
