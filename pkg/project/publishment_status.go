package project

type PublishmentStatus string

const (
	PublishmentStatusPublic PublishmentStatus = "public"

	PublishmentStatusLimited PublishmentStatus = "limited"

	PublishmentStatusPrivate PublishmentStatus = "private"
)
