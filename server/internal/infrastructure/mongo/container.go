package mongo

import (
	"context"
	"strings"

	accountsInfra "github.com/reearth/reearth-accounts/server/pkg/infrastructure"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	"github.com/reearth/reearth/server/internal/infrastructure/adapter"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/plugin/manifest"
	"github.com/reearth/reearth/server/pkg/property"

	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func New(ctx context.Context, db *mongo.Database, account *accountsInfra.Container, useTransaction bool) (*repo.Container, error) {
	lock, err := NewLock(db.Collection("locks"))
	if err != nil {
		return nil, err
	}

	client := mongox.NewClientWithDatabase(db)
	if useTransaction {
		client = client.WithTransaction()
	}

	c := &repo.Container{
		Asset:           NewAsset(client),
		Config:          NewConfig(db.Collection("config"), lock),
		NLSLayer:        NewNLSLayer(client),
		Style:           NewStyle(client),
		Lock:            lock,
		Plugin:          NewPlugin(client),
		Project:         NewProject(client),
		ProjectMetadata: NewProjectMetadata(client),
		PropertySchema:  NewPropertySchema(client),
		Property:        NewProperty(client),
		Scene:           NewScene(client),
		SceneLock:       NewSceneLock(client),
		Workspace:       account.Workspace,
		User:            account.User,
		Storytelling:    NewStorytelling(client),
		Transaction:     client.Transaction(),
		Extensions:      nil,
		Role:            account.Role,
		Permittable:     account.Permittable,
	}

	// init
	if err := Init(c); err != nil {
		return nil, err
	}

	return c, nil
}

func NewWithExtensions(ctx context.Context, db *mongo.Database, account *accountsInfra.Container, useTransaction bool, src []string) (*repo.Container, error) {
	c, err := New(ctx, db, account, useTransaction)
	if err != nil {
		return nil, err
	}
	if len(src) == 0 {
		return c, nil
	}

	ms, err := manifest.ParseFromUrlList(ctx, src)
	if err != nil {
		return nil, err
	}

	ids := lo.Map(ms, func(m *manifest.Manifest, _ int) id.PluginID {
		return m.Plugin.ID()
	})

	plugins := lo.Map(ms, func(m *manifest.Manifest, _ int) *plugin.Plugin {
		return m.Plugin
	})

	propertySchemas := lo.FlatMap(ms, func(m *manifest.Manifest, _ int) []*property.Schema {
		return m.ExtensionSchema
	})

	c.Extensions = ids
	c.Plugin = adapter.NewPlugin(
		[]repo.Plugin{memory.NewPluginWith(plugins...), c.Plugin},
		c.Plugin,
	)
	c.PropertySchema = adapter.NewPropertySchema(
		[]repo.PropertySchema{memory.NewPropertySchemaWith(propertySchemas...), c.PropertySchema},
		c.PropertySchema,
	)
	return c, nil
}

func Init(r *repo.Container) error {
	if r == nil {
		return nil
	}

	ctx := context.Background()
	return util.Try(
		func() error { return r.Asset.(*Asset).Init(ctx) },
		func() error { return r.Plugin.(*Plugin).Init(ctx) },
		func() error { return r.Project.(*Project).Init(ctx) },
		func() error { return r.Property.(*Property).Init(ctx) },
		func() error { return r.PropertySchema.(*PropertySchema).Init(ctx) },
		func() error { return r.Scene.(*Scene).Init(ctx) },
		func() error { return r.NLSLayer.(*NLSLayer).Init(ctx) },
		func() error { return r.Style.(*Style).Init(ctx) },
		func() error { return r.Storytelling.(*Storytelling).Init(ctx) },
		func() error { return r.ProjectMetadata.(*ProjectMetadata).Init(ctx) },
		// func() error { return r.User.(*accountsMongo.User).Init() },
		// func() error { return r.Workspace.(*accountsMongo.Workspace).Init() },
	)
}

func applyWorkspaceFilter(filter interface{}, ids accountsUser.WorkspaceIDList) interface{} {
	if ids == nil {
		return filter
	}
	return mongox.And(filter, "workspace", bson.M{"$in": ids.Strings()})
}

func applySceneFilter(filter interface{}, ids id.SceneIDList) interface{} {
	if ids == nil {
		return filter
	}
	return mongox.And(filter, "scene", bson.M{"$in": ids.Strings()})
}

func applyOptionalSceneFilter(filter interface{}, ids id.SceneIDList) interface{} {
	if ids == nil {
		return filter
	}
	return mongox.And(filter, "", bson.M{"$or": []bson.M{
		{"scene": bson.M{"$in": ids.Strings()}},
		{"scene": nil},
		{"scene": ""},
	}})
}

func createIndexes(ctx context.Context, c *mongox.ClientCollection, keys, uniqueKeys []string) error {
	keys, uniqueKeys, skipped, err := skipIndexesWithOtherUniqueness(ctx, c.Client(), keys, uniqueKeys)
	if err != nil {
		return err
	}
	if len(skipped) > 0 {
		log.Warnfc(ctx, "mongo: %s: index exists with different unique option, skipped: %v\n", c.Client().Name(), skipped)
	}
	created, deleted, err := c.Indexes(ctx, keys, uniqueKeys)
	if len(created) > 0 || len(deleted) > 0 {
		log.Infofc(ctx, "mongo: %s: index deleted: %v, created: %v\n", c.Client().Name(), deleted, created)
	}
	return err
}

func skipIndexesWithOtherUniqueness(ctx context.Context, col *mongo.Collection, keys, uniqueKeys []string) ([]string, []string, []string, error) {
	cur, err := col.Indexes().List(ctx)
	if err != nil {
		return nil, nil, nil, err
	}
	var specs []struct {
		Key       bson.D `bson:"key"`
		Unique    bool   `bson:"unique"`
		Collation bson.M `bson:"collation,omitempty"`
	}
	if err := cur.All(ctx, &specs); err != nil {
		return nil, nil, nil, err
	}

	unique := map[string]bool{}
	nonUnique := map[string]bool{}
	for _, s := range specs {
		if len(s.Collation) > 0 {
			continue
		}
		k := strings.Join(lo.Map(s.Key, func(e bson.E, _ int) string { return e.Key }), ",")
		if s.Unique {
			unique[k] = true
		} else {
			nonUnique[k] = true
		}
	}

	var skipped []string
	keys = lo.Filter(keys, func(k string, _ int) bool {
		conflict := unique[k] && !nonUnique[k]
		if conflict {
			skipped = append(skipped, k)
		}
		return !conflict
	})
	uniqueKeys = lo.Filter(uniqueKeys, func(k string, _ int) bool {
		conflict := nonUnique[k] && !unique[k]
		if conflict {
			skipped = append(skipped, k)
		}
		return !conflict
	})
	return keys, uniqueKeys, skipped, nil
}
