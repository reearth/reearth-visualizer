package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/stretchr/testify/assert"
)

func TestProperty_AddItem(t *testing.T) {
	ctx := context.Background()
	memory := memory.New()

	ws := accountdomain.NewWorkspaceID()
	scene := scene.New().NewID().Workspace(ws).MustBuild()
	psg := property.NewSchemaGroup().ID("foobar").IsList(true).Fields([]*property.SchemaField{
		property.NewSchemaField().ID("field").Type(property.ValueTypeString).MustBuild(),
	}).MustBuild()
	ps := property.NewSchema().ID(property.MustSchemaID("xxx~1.1.1/aa")).
		Groups(property.NewSchemaGroupList([]*property.SchemaGroup{
			psg,
		})).
		MustBuild()
	p := property.New().NewID().Scene(scene.ID()).Schema(ps.ID()).MustBuild()
	_ = memory.Scene.Save(ctx, scene)
	_ = memory.PropertySchema.Save(ctx, ps)
	_ = memory.Property.Save(ctx, p)

	uc := &Property{
		commonSceneLock:    commonSceneLock{sceneLockRepo: memory.SceneLock},
		propertyRepo:       memory.Property,
		propertySchemaRepo: memory.PropertySchema,
		transaction:        memory.Transaction,
	}
	op := &usecase.Operator{
		ReadableScenes: []id.SceneID{scene.ID()},
		WritableScenes: []id.SceneID{scene.ID()},
	}

	index := -1
	np, npl, npg, err := uc.AddItem(ctx, interfaces.AddPropertyItemParam{
		PropertyID: p.ID(),
		Index:      &index,
		Pointer:    property.PointItemBySchema(psg.ID()),
	}, op)
	assert.NoError(t, err)
	assert.NotNil(t, np)
	assert.NotNil(t, npl)
	assert.NotNil(t, npg)
	assert.Equal(t, p.ID(), np.ID())
	assert.Equal(t, psg.ID(), npl.SchemaGroup())
	assert.Equal(t, psg.ID(), npg.SchemaGroup())

	assert.Same(t, npl, property.ToGroupList(np.ItemBySchema(psg.ID())))
	assert.Equal(t, npg, npl.GroupAt(0))
	assert.Equal(t, 1, len(npl.Groups()))

	np2, _ := memory.Property.FindByID(ctx, p.ID())
	assert.Equal(t, np, np2)
}

func TestProperty_RemoveItem(t *testing.T) {
	ctx := context.Background()
	memory := memory.New()

	ws := accountdomain.NewWorkspaceID()
	scene := scene.New().NewID().Workspace(ws).MustBuild()
	psg := property.NewSchemaGroup().ID("foobar").IsList(true).MustBuild()
	ps := property.NewSchema().ID(property.MustSchemaID("xxx~1.1.1/aa")).
		Groups(property.NewSchemaGroupList([]*property.SchemaGroup{
			psg,
		})).
		MustBuild()
	pg := property.NewGroup().NewID().SchemaGroup(psg.ID()).MustBuild()
	pl := property.NewGroupList().NewID().SchemaGroup(psg.ID()).Groups([]*property.Group{pg}).MustBuild()
	p := property.New().NewID().Scene(scene.ID()).Schema(ps.ID()).Items([]property.Item{pl}).MustBuild()
	_ = memory.Scene.Save(ctx, scene)
	_ = memory.PropertySchema.Save(ctx, ps)
	_ = memory.Property.Save(ctx, p)

	uc := &Property{
		commonSceneLock:    commonSceneLock{sceneLockRepo: memory.SceneLock},
		propertyRepo:       memory.Property,
		propertySchemaRepo: memory.PropertySchema,
		transaction:        memory.Transaction,
	}
	op := &usecase.Operator{
		ReadableScenes: []id.SceneID{scene.ID()},
		WritableScenes: []id.SceneID{scene.ID()},
	}

	np, err := uc.RemoveItem(ctx, interfaces.RemovePropertyItemParam{
		PropertyID: p.ID(),
		Pointer:    property.NewPointer(psg.IDRef(), pg.IDRef(), nil),
	}, op)
	assert.NoError(t, err)
	assert.NotNil(t, np)
	assert.Equal(t, p.ID(), np.ID())

	npl := property.ToGroupList(np.ItemBySchema(psg.ID()))
	assert.Equal(t, 0, len(npl.Groups()))

	np2, _ := memory.Property.FindByID(ctx, p.ID())
	assert.Equal(t, np, np2)
}

func TestProperty_UpdateValue_FieldOfGroupInList(t *testing.T) {
	ctx := context.Background()
	memory := memory.New()

	ws := accountdomain.NewWorkspaceID()
	scene := scene.New().NewID().Workspace(ws).MustBuild()
	psf := property.NewSchemaField().ID("field").Type(property.ValueTypeString).MustBuild()
	psg := property.NewSchemaGroup().ID("foobar").IsList(true).Fields([]*property.SchemaField{psf}).MustBuild()
	ps := property.NewSchema().ID(property.MustSchemaID("xxx~1.1.1/aa")).
		Groups(property.NewSchemaGroupList([]*property.SchemaGroup{psg})).
		MustBuild()
	pg := property.NewGroup().NewID().SchemaGroup(psg.ID()).MustBuild()
	pl := property.NewGroupList().NewID().SchemaGroup(psg.ID()).Groups([]*property.Group{pg}).MustBuild()
	p := property.New().NewID().Scene(scene.ID()).Schema(ps.ID()).Items([]property.Item{pl}).MustBuild()
	_ = memory.Scene.Save(ctx, scene)
	_ = memory.PropertySchema.Save(ctx, ps)
	_ = memory.Property.Save(ctx, p)

	uc := &Property{
		commonSceneLock:    commonSceneLock{sceneLockRepo: memory.SceneLock},
		sceneRepo:          memory.Scene,
		propertyRepo:       memory.Property,
		propertySchemaRepo: memory.PropertySchema,
		transaction:        memory.Transaction,
	}
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			WritableWorkspaces: []accountdomain.WorkspaceID{ws},
		},
		WritableScenes: []id.SceneID{scene.ID()},
	}

	np, npl, npg, npf, err := uc.UpdateValue(ctx, interfaces.UpdatePropertyValueParam{
		PropertyID: p.ID(),
		Pointer:    property.PointField(psg.IDRef(), pg.IDRef(), psf.ID()),
		Value:      property.ValueTypeString.ValueFrom("aaaa"),
	}, op)

	assert.NoError(t, err)
	assert.NotNil(t, np)
	assert.NotNil(t, npl)
	assert.NotNil(t, npg)
	assert.NotNil(t, npf)
	assert.Equal(t, p.ID(), np.ID())
	assert.Equal(t, pl.ID(), npl.ID())
	assert.Equal(t, []*property.Group{pg}, npl.Groups())
	assert.Equal(t, pg.ID(), npg.ID())
	assert.Same(t, npf, npg.Field(psf.ID()))
	assert.Equal(t, psf.ID(), npf.Field())
	assert.Equal(t, property.ValueTypeString.ValueFrom("aaaa"), npf.Value())

	np2, _ := memory.Property.FindByID(ctx, p.ID())
	assert.Equal(t, np, np2)
}
