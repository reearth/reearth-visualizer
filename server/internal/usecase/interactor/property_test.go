package interactor

import (
	"context"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/stretchr/testify/assert"
)

func TestProperty_AddItem(t *testing.T) {
	ctx := context.Background()
	memory := memory.New()

	ws := accountsID.NewWorkspaceID()
	scene := scene.New().NewID().Workspace(ws).MustBuild()
	psg := property.NewSchemaGroup().ID("foobar").IsList(true).Fields([]*property.SchemaField{
		property.NewSchemaField().ID("field").Type(property.ValueTypeString).MustBuild(),
	}).MustBuild()
	ps := property.NewSchema().ID(id.MustPropertySchemaID("xxx~1.1.1/aa")).
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

func TestProperty_AddItem_WithFields(t *testing.T) {
	ctx := context.Background()
	memory := memory.New()

	ws := accountsID.NewWorkspaceID()
	scene := scene.New().NewID().Workspace(ws).MustBuild()
	tileTypeField := property.NewSchemaField().ID("tile_type").Type(property.ValueTypeString).MustBuild()
	tileCategoryField := property.NewSchemaField().ID("tile_category").Type(property.ValueTypeString).MustBuild()
	psg := property.NewSchemaGroup().ID("tiles").IsList(true).Fields([]*property.SchemaField{
		tileTypeField,
		tileCategoryField,
	}).MustBuild()
	ps := property.NewSchema().ID(id.MustPropertySchemaID("xxx~1.1.1/aa")).
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
		Fields: []interfaces.AddPropertyItemFieldParam{
			{Field: tileTypeField.ID(), Value: property.ValueTypeString.ValueFrom("google_satellite")},
			{Field: tileCategoryField.ID(), Value: property.ValueTypeString.ValueFrom("system")},
		},
	}, op)
	assert.NoError(t, err)
	assert.NotNil(t, np)
	assert.NotNil(t, npl)
	assert.NotNil(t, npg)

	// Both fields must have been set atomically in the same call that created the item.
	assert.Equal(t, property.ValueTypeString.ValueFrom("google_satellite"), npg.Field(tileTypeField.ID()).Value())
	assert.Equal(t, property.ValueTypeString.ValueFrom("system"), npg.Field(tileCategoryField.ID()).Value())

	np2, _ := memory.Property.FindByID(ctx, p.ID())
	assert.Equal(t, np, np2)
	npl2 := property.ToGroupList(np2.ItemBySchema(psg.ID()))
	assert.Equal(t, 1, len(npl2.Groups()))
}

func TestProperty_AddItem_WithFields_UnknownFieldAbortsWithoutPartialItem(t *testing.T) {
	ctx := context.Background()
	memory := memory.New()

	ws := accountsID.NewWorkspaceID()
	scene := scene.New().NewID().Workspace(ws).MustBuild()
	tileTypeField := property.NewSchemaField().ID("tile_type").Type(property.ValueTypeString).MustBuild()
	psg := property.NewSchemaGroup().ID("tiles").IsList(true).Fields([]*property.SchemaField{
		tileTypeField,
	}).MustBuild()
	ps := property.NewSchema().ID(id.MustPropertySchemaID("xxx~1.1.1/aa")).
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
		Fields: []interfaces.AddPropertyItemFieldParam{
			{Field: tileTypeField.ID(), Value: property.ValueTypeString.ValueFrom("google_satellite")},
			{Field: id.PropertyFieldID("does_not_exist"), Value: property.ValueTypeString.ValueFrom("system")},
		},
	}, op)

	// All requested fields are validated against the schema before AddItem
	// creates the item at all, so the caller never sees a half-initialized
	// item back, and -- unlike relying solely on the transaction rolling
	// back -- p itself is never mutated on this path either. That matters
	// because repo.Property.FindByID can return a direct reference into the
	// backing store (as the in-memory repo used here does), so a mutation
	// that happens before a failed Save/Commit would otherwise still be
	// visible on it.
	assert.Error(t, err)
	assert.Nil(t, np)
	assert.Nil(t, npl)
	assert.Nil(t, npg)

	stored, _ := memory.Property.FindByID(ctx, p.ID())
	assert.Nil(t, stored.ItemBySchema(psg.ID()), "no item must have been added to the property, even in-memory")
}

func TestProperty_RemoveItem(t *testing.T) {
	ctx := context.Background()
	memory := memory.New()

	ws := accountsID.NewWorkspaceID()
	scene := scene.New().NewID().Workspace(ws).MustBuild()
	psg := property.NewSchemaGroup().ID("foobar").IsList(true).MustBuild()
	ps := property.NewSchema().ID(id.MustPropertySchemaID("xxx~1.1.1/aa")).
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

	ws := accountsID.NewWorkspaceID()
	scene := scene.New().NewID().Workspace(ws).MustBuild()
	psf := property.NewSchemaField().ID("field").Type(property.ValueTypeString).MustBuild()
	psg := property.NewSchemaGroup().ID("foobar").IsList(true).Fields([]*property.SchemaField{psf}).MustBuild()
	ps := property.NewSchema().ID(id.MustPropertySchemaID("xxx~1.1.1/aa")).
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
		AcOperator: &accountsWorkspace.Operator{
			WritableWorkspaces: []accountsID.WorkspaceID{ws},
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
