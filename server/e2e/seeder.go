package e2e

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"mime"
	"net/url"
	"os"
	"path/filepath"
	"time"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/util"
	"golang.org/x/text/language"
)

var (
	uID    = user.NewID()
	uEmail = "e2e@e2e.com"
	uName  = "e2e"
	wID    = accountdomain.NewWorkspaceID()
	pID    = id.NewProjectID()
	pName  = "p1"
	pDesc  = pName + " desc"
	pAlias = "PROJECT_ALIAS"
	sID    = id.NewSceneID()
	now    = time.Date(2022, time.January, 1, 0, 0, 0, 0, time.UTC)

	nlsLayerId = id.NewNLSLayerID()
	storyID    = id.NewStoryID()
	pageID     = id.NewPageID()
	blockID    = id.NewBlockID()
)

func baseSeeder(ctx context.Context, r *repo.Container, f gateway.File) error {
	defer util.MockNow(now)()

	u := user.New().
		ID(uID).
		Workspace(wID).
		Name(uName).
		Email(uEmail).
		MustBuild()
	if err := r.User.Save(ctx, u); err != nil {
		return err
	}
	return baseSetup(ctx, r, u, f)
}

func baseSeederWithLang(ctx context.Context, r *repo.Container, f gateway.File, lang language.Tag) error {
	defer util.MockNow(now)()

	u := user.New().ID(uID).
		Workspace(wID).
		Name(uName).
		Email(uEmail).
		Lang(lang).
		MustBuild()
	if err := r.User.Save(ctx, u); err != nil {
		return err
	}
	return baseSetup(ctx, r, u, f)
}

func baseSetup(ctx context.Context, r *repo.Container, u *user.User, f gateway.File) error {

	m := workspace.Member{
		Role: workspace.RoleOwner,
	}
	w := workspace.New().ID(wID).
		Name("e2e").
		Personal(false).
		Members(map[accountdomain.UserID]workspace.Member{u.ID(): m}).
		MustBuild()
	if err := r.Workspace.Save(ctx, w); err != nil {
		return err
	}

	url, err := addAsset("test.png", ctx, r, f)
	if err != nil {
		return err
	}

	p := project.New().ID(pID).
		Name(pName).
		Description(pDesc).
		ImageURL(url).
		Workspace(w.ID()).
		Alias(pAlias).
		Visualizer(visualizer.VisualizerCesiumBeta).
		CoreSupport(true).
		Starred(false).
		Deleted(false).
		MustBuild()
	if err := r.Project.Save(ctx, p); err != nil {
		return err
	}

	return nil
}

func addAsset(path string, ctx context.Context, r *repo.Container, gf gateway.File) (*url.URL, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer func() {
		if cerr := f.Close(); cerr != nil && err == nil {
			err = cerr
		}
	}()
	stat, err := f.Stat()
	if err != nil {
		return nil, err
	}
	contentType := mime.TypeByExtension(filepath.Ext(path))
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	u, size, err := gf.UploadAsset(ctx, &file.File{
		Content:     f,
		Path:        path,
		Size:        int64(stat.Size()),
		ContentType: contentType,
	})
	if err != nil {
		return nil, err
	}

	aid := id.NewAssetID()
	a := asset.New().
		ID(aid).
		Workspace(wID).
		Project(&pID).
		URL(u.String()).
		CreatedAt(aid.Timestamp()).
		Name(path).
		Size(size).
		ContentType(contentType).
		CoreSupport(true).
		MustBuild()
	return u, r.Asset.Save(ctx, a)
}

func fullSeeder(ctx context.Context, r *repo.Container, f gateway.File) error {
	defer util.MockNow(now)()
	u := user.New().ID(uID).
		Workspace(wID).
		Name(uName).
		Email(uEmail).
		MustBuild()
	if err := r.User.Save(ctx, u); err != nil {
		return err
	}
	if err := baseSetup(ctx, r, u, f); err != nil {
		return err
	}
	return fullSetup(ctx, r)
}

func fullSetup(ctx context.Context, r *repo.Container) error {
	schema := builtin.GetPropertySchemaByVisualizer(visualizer.VisualizerCesiumBeta)
	prop, err := property.New().NewID().Schema(schema.ID()).Scene(sID).Build()
	if err != nil {
		return err
	}
	ps := scene.NewPlugins([]*scene.Plugin{
		scene.NewPlugin(id.OfficialPluginID, nil),
	})
	s, err := scene.New().ID(sID).
		Project(pID).
		Workspace(wID).
		Property(prop.ID()).
		Plugins(ps).
		Build()
	if err != nil {
		return err
	}
	if err = r.Scene.Save(ctx, s); err != err {
		return err
	}
	if err = r.Property.Save(ctx, prop); err != err {
		return err
	}
	if err = addWidget(ctx, s, r); err != err {
		return err
	}
	if err = addStory(ctx, r); err != err {
		return err
	}
	if err = addLayerSimple(ctx, r); err != err {
		return err
	}
	if err = addLayerStyle(s.ID(), ctx, r); err != err {
		return err
	}
	return nil
}

func addWidget(ctx context.Context, s *scene.Scene, r *repo.Container) error {
	pluginID, err := id.PluginIDFrom("reearth")
	if err != nil {
		return err
	}
	eid := id.PluginExtensionID("dataAttribution")
	pr, err := r.Plugin.FindByID(ctx, pluginID)
	if err != nil {
		return err
	}
	extension := pr.Extension(eid)
	prop, err := property.New().NewID().Schema(extension.Schema()).Scene(sID).Build()
	if err != nil {
		return err
	}
	extended := false
	var location *plugin.WidgetLocation
	if widgetLayout := extension.WidgetLayout(); widgetLayout != nil {
		extended = widgetLayout.Extended()
		location = widgetLayout.DefaultLocation()
	}
	widget, err := scene.NewWidget(
		id.NewWidgetID(),
		pluginID,
		eid,
		prop.ID(),
		true,
		extended,
	)
	if err != nil {
		return err
	}
	s.Widgets().Add(widget)
	loc := scene.WidgetLocation{
		Zone:    scene.WidgetZoneType(location.Zone),
		Section: scene.WidgetSectionType(location.Section),
		Area:    scene.WidgetAreaType(location.Area),
	}
	s.Widgets().Alignment().Area(loc).Add(widget.ID(), -1)
	if err = r.Property.Save(ctx, prop); err != err {
		return err
	}
	if err = r.Scene.Save(ctx, s); err != err {
		return err
	}
	return nil
}

func addStory(ctx context.Context, r *repo.Container) error {
	schema := builtin.GetPropertySchema(builtin.PropertySchemaIDStory)
	prop, err := property.New().NewID().Schema(schema.ID()).Scene(sID).Build()
	if err != nil {
		return err
	}
	pages := []*storytelling.Page{}
	page, err := _createPage(ctx, r)
	if err != nil {
		return err
	}
	pages = append(pages, page)
	story, err := storytelling.NewStory().
		ID(storyID).
		Title("test page").
		Pages(storytelling.NewPageList(pages)).
		Scene(sID).
		Property(prop.ID()).
		Build()
	if err != nil {
		return err
	}
	if err = r.Property.Save(ctx, prop); err != err {
		return err
	}
	if err := r.Storytelling.Save(ctx, *story); err != nil {
		return err
	}
	return err
}

func _createPage(ctx context.Context, r *repo.Container) (*storytelling.Page, error) {
	schema := builtin.GetPropertySchema(builtin.PropertySchemaIDStoryPage)
	prop, err := property.New().NewID().Schema(schema.ID()).Scene(sID).Build()
	if err != nil {
		return nil, err
	}
	if err = r.Property.Save(ctx, prop); err != err {
		return nil, err
	}

	blocks := []*storytelling.Block{}
	block, err := _createBlock(ctx, r)
	if err != nil {
		return nil, err
	}
	blocks = append(blocks, block)

	return storytelling.NewPage().
		ID(pageID).
		Title("Untitled").
		Blocks(blocks).
		Swipeable(false).
		Property(prop.ID()).
		Build()
}

func _createBlock(ctx context.Context, r *repo.Container) (*storytelling.Block, error) {
	plgID, err := id.PluginIDFrom("reearth")
	if err != nil {
		return nil, err
	}
	plg, err := r.Plugin.FindByID(ctx, plgID)
	if err != nil {
		return nil, err
	}
	eId := id.PluginExtensionID("textStoryBlock")
	extension := plg.Extension(eId)
	if extension.Type() != plugin.ExtensionTypeStoryBlock {
		return nil, err
	}
	prop, err := property.New().NewID().Schema(extension.Schema()).Scene(sID).Build()
	if err != nil {
		return nil, err
	}
	if err = r.Property.Save(ctx, prop); err != err {
		return nil, err
	}

	return storytelling.NewBlock().
		ID(blockID).
		Plugin(plgID).
		Extension(eId).
		Property(prop.ID()).
		Build()
}

func addLayerStyle(SceneID id.SceneID, ctx context.Context, r *repo.Container) error {
	var s gqlmodel.JSON
	err := json.Unmarshal([]byte(`{
      "marker": {
        "show": true,
        "height": 100
      }
    }`), &s)
	if err != nil {
		return err
	}

	style, err := scene.NewStyle().
		NewID().
		Scene(SceneID).
		Name("Style.01").
		Value(gqlmodel.ToStyleValue(s)).Build()
	if err != nil {
		return err
	}
	if err := r.Style.Save(ctx, *style); err != nil {
		return err
	}
	return nil
}

func addLayerSimple(ctx context.Context, r *repo.Container) error {
	index := 0
	visible := true
	var config gqlmodel.JSON
	err := json.Unmarshal([]byte(`	{
		"data": {
		  "type": "geojson"
		},
		"layerStyleId": "",
		"properties": {
		  "name": "test simple layer"
		}
	  }`), &config)
	if err != nil {
		return err
	}

	layerSimple, err := nlslayer.NewNLSLayerSimple().
		ID(nlsLayerId).
		Scene(sID).
		Config(gqlmodel.ToNLSConfig(config)).
		LayerType(gqlmodel.ToNLSLayerType("simple")).
		Title("test simple layer").
		Index(&index).
		IsVisible(visible).
		Build()
	if err != nil {
		return err
	}
	featureCollection := nlslayer.NewFeatureCollection(
		"FeatureCollection",
		[]nlslayer.Feature{},
	)
	var schema map[string]any
	err = json.Unmarshal([]byte(`{
		  "aaa": "Text_1",
		  "bbb": "Int_2",
		  "ccc": "Boolean_3"
		}`), &schema)
	if err != nil {
		return err
	}
	sketchInfo := nlslayer.NewSketchInfo(
		&schema,
		featureCollection,
	)
	layerSimple.SetIsSketch(true)
	layerSimple.SetSketch(sketchInfo)
	if err = r.NLSLayer.Save(ctx, layerSimple); err != nil {
		return err
	}
	if err = addGeoJson(layerSimple.ID(), ctx, r); err != nil {
		return err
	}
	return nil
}

func addGeoJson(layerID nlslayer.ID, ctx context.Context, r *repo.Container) error {
	layerSimple, err := r.NLSLayer.FindByID(ctx, layerID)
	if err != nil {
		return err
	}
	var g map[string]any
	err = json.Unmarshal([]byte(`{
		"coordinates": [ 139.75315985724345, 35.68234704867425 ],
		"type": "Point"
	}`), &g)
	if err != nil {
		return err
	}

	geometry, err := nlslayer.NewGeometryFromMap(g)
	if err != nil {
		fmt.Print(err)
		return err
	}

	feature, err := nlslayer.NewFeature(
		id.NewFeatureID(),
		"Feature",
		geometry,
	)
	if err != nil {
		return err
	}
	var p map[string]any

	err = json.Unmarshal([]byte(fmt.Sprintf(`{
		"extrudedHeight": 0,
		"id": "%s",
		"positions": [
		[
			-3958794.1421583104,
			3350991.8464303534,
			3699620.1697127568
		]
		],
		"type": "marker"
	}`, generateUUID())), &p)
	if err != nil {
		return err
	}
	feature.UpdateProperties(&p)
	featureCollection := nlslayer.NewFeatureCollection(
		"FeatureCollection",
		[]nlslayer.Feature{*feature},
	)
	sketchInfo := nlslayer.NewSketchInfo(
		layerSimple.Sketch().CustomPropertySchema(),
		featureCollection,
	)
	layerSimple.SetIsSketch(true)
	layerSimple.SetSketch(sketchInfo)
	if err = r.NLSLayer.Save(ctx, layerSimple); err != nil {
		return err
	}
	return nil
}

func generateUUID() string {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		panic(err)
	}
	b[6] = (b[6] & 0x0F) | 0x40
	b[8] = (b[8] & 0x3F) | 0x80
	return fmt.Sprintf("%s-%s-%s-%s-%s",
		hex.EncodeToString(b[0:4]),
		hex.EncodeToString(b[4:6]),
		hex.EncodeToString(b[6:8]),
		hex.EncodeToString(b[8:10]),
		hex.EncodeToString(b[10:16]),
	)
}
