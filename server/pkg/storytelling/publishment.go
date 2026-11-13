package storytelling

// PublishmentStatus is whether the story is published, and whether search
// engines may index its published page. It is unrelated to the project's
// visibility.
type PublishmentStatus string

const (
	// PublishmentStatusPublic is published, and search engines may index the page.
	PublishmentStatusPublic PublishmentStatus = "public"

	// PublishmentStatusLimited is published, but the page asks search engines
	// not to index it or follow its links (noindex,nofollow).
	PublishmentStatusLimited PublishmentStatus = "limited"

	// PublishmentStatusPrivate is not published: there is no published page.
	PublishmentStatusPrivate PublishmentStatus = "private"
)
