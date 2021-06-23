package plugin

import "time"

type Metadata struct {
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	ThumbnailUrl string    `json:"thumbnailUrl"`
	Author       string    `json:"author"`
	CreatedAt    time.Time `json:"createdAt"`
}
