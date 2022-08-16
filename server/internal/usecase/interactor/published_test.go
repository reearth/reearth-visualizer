package interactor

import (
	"testing"

	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/stretchr/testify/assert"
)

func TestRenderIndex(t *testing.T) {
	assert.Equal(t, `<html><head>
  <title>xxx&gt;</title>
  <meta name="twitter:title" content="xxx&gt;" />
  <meta property="og:title" content="xxx&gt;" />
  <meta name="twitter:description" content="desc" />
  <meta property="og:description" content="desc" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image:src" content="hogehoge" />
  <meta property="og:image" content="hogehoge" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://xxss.com" />
  <meta name="robots" content="noindex,nofollow" />
</head></html>`, renderIndex(
		`<html><head>
  <title>Foobar</title>
</head></html>`,
		"https://xxss.com",
		interfaces.ProjectPublishedMetadata{
			Title:       "xxx>",
			Description: "desc",
			Image:       "hogehoge",
			Noindex:     true,
		},
	))
}
