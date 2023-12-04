package interactor

import (
	"bytes"
	"context"
	"errors"
	"html"
	"html/template"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

type Published struct {
	project      repo.Project
	Storytelling repo.Storytelling
	file         gateway.File
	indexHTML    *util.Cache[string]
	indexHTMLStr string
}

func NewPublished(project repo.Project, storytelling repo.Storytelling, file gateway.File, indexHTML string) interfaces.Published {
	return &Published{
		project:      project,
		Storytelling: storytelling,
		file:         file,
		indexHTMLStr: indexHTML,
	}
}

func NewPublishedWithURL(project repo.Project, storytelling repo.Storytelling, file gateway.File, indexHTMLURL *url.URL) interfaces.Published {
	return &Published{
		project:      project,
		file:         file,
		Storytelling: storytelling,
		indexHTML: util.NewCache(func(c context.Context, i string) (string, error) {
			req, err := http.NewRequestWithContext(c, http.MethodGet, indexHTMLURL.String(), nil)
			if err != nil {
				return "", err
			}
			res, err := http.DefaultClient.Do(req)
			if err != nil {
				log.Errorfc(c, "published index: conn err: %s", err)
				return "", errors.New("failed to fetch HTML")
			}
			defer func() {
				_ = res.Body.Close()
			}()
			if res.StatusCode >= 300 {
				log.Errorfc(c, "published index: status err: %d", res.StatusCode)
				return "", errors.New("failed to fetch HTML")
			}
			str, err := io.ReadAll(res.Body)
			if err != nil {
				log.Errorfc(c, "published index: read err: %s", err)
				return "", errors.New("failed to fetch HTML")
			}
			return string(str), nil
		}, time.Hour),
	}
}

func (i *Published) Metadata(ctx context.Context, name string) (interfaces.ProjectPublishedMetadata, error) {
	prj, err := i.project.FindByPublicName(ctx, name)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return interfaces.ProjectPublishedMetadata{}, err
	}

	if prj == nil {
		story, err := i.Storytelling.FindByPublicName(ctx, name)
		if err != nil && !errors.Is(err, rerror.ErrNotFound) {
			return interfaces.ProjectPublishedMetadata{}, err
		}
		if story != nil {
			return interfaces.PublishedMetadataFrom(story), nil
		}
		return interfaces.ProjectPublishedMetadata{}, rerror.ErrNotFound
	}

	return interfaces.PublishedMetadataFrom(prj), nil
}

func (i *Published) Data(ctx context.Context, name string) (io.Reader, error) {
	r, err := i.file.ReadBuiltSceneFile(ctx, name)
	if err != nil && err != rerror.ErrNotFound {
		return nil, err
	}
	if r != nil {
		return r, nil
	}

	r, err = i.file.ReadStoryFile(ctx, name)
	if err != nil && err != rerror.ErrNotFound {
		return nil, err
	}
	if r != nil {
		return r, nil
	}
	return nil, rerror.ErrNotFound
}

func (i *Published) Index(ctx context.Context, name string, u *url.URL) (string, error) {
	htmlStr := i.indexHTMLStr
	if i.indexHTML != nil {
		htmlCachedStr, err := i.indexHTML.Get(ctx)
		if err != nil {
			return "", err
		}
		htmlStr = htmlCachedStr
	}

	if name == "" {
		return htmlStr, nil
	}

	prj, err := i.project.FindByPublicName(ctx, name)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return "", err
	}
	if prj != nil {
		md := interfaces.PublishedMetadataFrom(prj)
		return renderIndex(htmlStr, u.String(), md), nil
	}

	story, err := i.Storytelling.FindByPublicName(ctx, name)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return "", err
	}
	if story != nil {
		md := interfaces.PublishedMetadataFrom(story)
		return renderIndex(htmlStr, u.String(), md), nil
	}

	return htmlStr, nil
}

const headers = `{{if .title}}  <meta name="twitter:title" content="{{.title}}" />
  <meta property="og:title" content="{{.title}}" />{{end}}{{if .description}}
  <meta name="twitter:description" content="{{.description}}" />
  <meta property="og:description" content="{{.description}}" />{{end}}{{if .image}}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image:src" content="{{.image}}" />
  <meta property="og:image" content="{{.image}}" />{{end}}
  <meta property="og:type" content="website" />
  <meta property="og:url" content="{{.url}}" />{{if .noindex}}
  <meta name="robots" content="noindex,nofollow" />{{end}}
`

var (
	headersTemplate = template.Must(template.New("headers").Parse(headers))
	titleRegexp     = regexp.MustCompile("<title>.+?</title>")
)

// renderIndex returns index HTML with OGP and some meta tags for the project.
func renderIndex(index, url string, d interfaces.ProjectPublishedMetadata) string {
	if d.Title != "" {
		index = titleRegexp.ReplaceAllLiteralString(index, "<title>"+html.EscapeString(d.Title)+"</title>")
	}
	var b bytes.Buffer
	_ = headersTemplate.Execute(&b,
		map[string]interface{}{
			"title":       d.Title,
			"description": d.Description,
			"image":       d.Image,
			"noindex":     d.Noindex,
			"url":         url,
		})
	return strings.Replace(index, "</head>", b.String()+"</head>", -1)
}
