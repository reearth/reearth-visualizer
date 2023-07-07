package storytelling

import "time"

type Story struct {
	id          StoryID
	property    PropertyID
	scene       SceneID
	title       string
	alias       string
	pages       PageList
	status      PublishmentStatus
	publishedAt *time.Time
	updatedAt   time.Time
}

func (s Story) Id() StoryID {
	return s.id
}

func (s Story) Property() PropertyID {
	return s.property
}

func (s Story) Scene() SceneID {
	return s.scene
}

func (s Story) Pages() PageList {
	return s.pages
}

func (s Story) Title() string {
	return s.title
}

func (s Story) Alias() string {
	return s.alias
}

func (s Story) Published() PublishmentStatus {
	return s.status
}

func (s Story) Status() PublishmentStatus {
	return s.status
}

func (s Story) PublishedAt() *time.Time {
	return s.publishedAt
}

func (s Story) CreatedAt() time.Time {
	return s.id.Timestamp()
}

func (s Story) UpdatedAt() time.Time {
	return s.updatedAt
}

func (s Story) Rename(name string) {
	s.title = name
	s.updatedAt = time.Now()
}

func (s Story) SetUpdatedAt(now time.Time) {
	s.updatedAt = now
}
