package mongodoc

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"golang.org/x/exp/slices"
)

type PluginDocument struct {
	ID            string
	Name          map[string]string
	Author        string
	Description   map[string]string
	RepositoryURL string
	Extensions    []PluginExtensionDocument
	Schema        *string
	Scene         *string `bson:",omitempty"`
}

type PluginExtensionDocument struct {
	ID           string
	Type         string
	Name         map[string]string
	Description  map[string]string
	Icon         string
	Schema       string
	Visualizer   string `bson:",omitempty"`
	SingleOnly   bool
	WidgetLayout *WidgetLayoutDocument
}

type WidgetLayoutDocument struct {
	Extendable      *WidgetExtendableDocument
	Extended        bool
	Floating        bool
	DefaultLocation *WidgetLocationDocument
}

type WidgetExtendableDocument struct {
	Vertically   bool
	Horizontally bool
}

type WidgetLocationDocument struct {
	Zone    string
	Section string
	Area    string
}

type PluginConsumer = Consumer[*PluginDocument, *plugin.Plugin]

func NewPluginConsumer(scenes []id.SceneID) *PluginConsumer {
	return NewConsumer[*PluginDocument, *plugin.Plugin](func(a *plugin.Plugin) bool {
		sid := a.ID().Scene()
		return sid == nil || scenes == nil || slices.Contains(scenes, *sid)
	})
}

func NewPlugin(plugin *plugin.Plugin) (*PluginDocument, string) {
	if plugin == nil {
		return nil, ""
	}

	extensions := plugin.Extensions()
	extensionsDoc := make([]PluginExtensionDocument, 0, len(extensions))
	for _, e := range extensions {
		extensionsDoc = append(extensionsDoc, PluginExtensionDocument{
			ID:           string(e.ID()),
			Type:         string(e.Type()),
			Name:         e.Name(),
			Description:  e.Description(),
			Icon:         e.Icon(),
			Schema:       e.Schema().String(),
			Visualizer:   string(e.Visualizer()),
			SingleOnly:   e.SingleOnly(),
			WidgetLayout: NewWidgetLayout(e.WidgetLayout()),
		})
	}

	pid := plugin.ID().String()
	return &PluginDocument{
		ID:            pid,
		Name:          plugin.Name(),
		Description:   plugin.Description(),
		Author:        plugin.Author(),
		RepositoryURL: plugin.RepositoryURL(),
		Extensions:    extensionsDoc,
		Schema:        plugin.Schema().StringRef(),
		Scene:         plugin.ID().Scene().StringRef(),
	}, pid
}

func (d *PluginDocument) Model() (*plugin.Plugin, error) {
	if d == nil {
		return nil, nil
	}

	pid, err := id.PluginIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	extensions := make([]*plugin.Extension, 0, len(d.Extensions))
	for _, e := range d.Extensions {
		psid, err := id.PropertySchemaIDFrom(e.Schema)
		if err != nil {
			return nil, err
		}
		extension, err := plugin.NewExtension().
			ID(id.PluginExtensionID(e.ID)).
			Type(plugin.ExtensionType(e.Type)).
			Name(e.Name).
			Description(e.Description).
			Icon(e.Icon).
			SingleOnly(e.SingleOnly).
			WidgetLayout(e.WidgetLayout.Model()).
			Schema(psid).
			Build()
		if err != nil {
			return nil, err
		}
		extensions = append(extensions, extension)
	}

	return plugin.New().
		ID(pid).
		Name(d.Name).
		Description(d.Description).
		Author(d.Author).
		RepositoryURL(d.RepositoryURL).
		Extensions(extensions).
		Schema(id.PropertySchemaIDFromRef(d.Schema)).
		Build()
}

func NewWidgetLayout(l *plugin.WidgetLayout) *WidgetLayoutDocument {
	if l == nil {
		return nil
	}

	return &WidgetLayoutDocument{
		Extendable: &WidgetExtendableDocument{
			Vertically:   l.VerticallyExtendable(),
			Horizontally: l.HorizontallyExtendable(),
		},
		Extended:        l.Extended(),
		Floating:        l.Floating(),
		DefaultLocation: NewWidgetLocation(l.DefaultLocation()),
	}
}

func (d *WidgetLayoutDocument) Model() *plugin.WidgetLayout {
	if d == nil {
		return nil
	}

	return plugin.NewWidgetLayout(
		d.Extendable.Horizontally,
		d.Extendable.Vertically,
		d.Extended,
		d.Floating,
		d.DefaultLocation.Model(),
	).Ref()
}

func NewWidgetLocation(l *plugin.WidgetLocation) *WidgetLocationDocument {
	if l == nil {
		return nil
	}

	return &WidgetLocationDocument{
		Zone:    string(l.Zone),
		Section: string(l.Section),
		Area:    string(l.Area),
	}
}

func (d *WidgetLocationDocument) Model() *plugin.WidgetLocation {
	if d == nil {
		return nil
	}

	return &plugin.WidgetLocation{
		Zone:    plugin.WidgetZoneType(d.Zone),
		Section: plugin.WidgetSectionType(d.Section),
		Area:    plugin.WidgetAreaType(d.Area),
	}
}
