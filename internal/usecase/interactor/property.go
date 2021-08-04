package interactor

import (
	"context"
	"errors"
	"path"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/asset"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
)

type Property struct {
	commonScene
	commonSceneLock
	propertyRepo       repo.Property
	propertySchemaRepo repo.PropertySchema
	datasetRepo        repo.Dataset
	datasetSchemaRepo  repo.DatasetSchema
	sceneRepo          repo.Scene
	assetRepo          repo.Asset
	transaction        repo.Transaction
	file               gateway.File
}

func NewProperty(r *repo.Container, gr *gateway.Container) interfaces.Property {
	return &Property{
		commonScene:        commonScene{sceneRepo: r.Scene},
		commonSceneLock:    commonSceneLock{sceneLockRepo: r.SceneLock},
		propertyRepo:       r.Property,
		propertySchemaRepo: r.PropertySchema,
		datasetRepo:        r.Dataset,
		datasetSchemaRepo:  r.DatasetSchema,
		sceneRepo:          r.Scene,
		assetRepo:          r.Asset,
		transaction:        r.Transaction,
		file:               gr.File,
	}
}

func (i *Property) Fetch(ctx context.Context, ids []id.PropertyID, operator *usecase.Operator) ([]*property.Property, error) {
	scenes, err := i.OnlyReadableScenes(ctx, operator)
	if err != nil {
		return nil, err
	}

	return i.propertyRepo.FindByIDs(ctx, ids, scenes)
}

func (i *Property) FetchSchema(ctx context.Context, ids []id.PropertySchemaID, operator *usecase.Operator) ([]*property.Schema, error) {
	if err := i.OnlyOperator(operator); err != nil {
		return nil, err
	}
	res, err := i.propertySchemaRepo.FindByIDs(ctx, ids)
	return res, err
}

func (i *Property) FetchMerged(ctx context.Context, org, parent *id.PropertyID, linked *id.DatasetID, operator *usecase.Operator) (*property.Merged, error) {
	scenes, err := i.OnlyReadableScenes(ctx, operator)
	if err != nil {
		return nil, err
	}

	ids := []id.PropertyID{}
	if org != nil {
		ids = append(ids, *org)
	}
	if parent != nil {
		ids = append(ids, *parent)
	}
	props, err := i.propertyRepo.FindByIDs(ctx, ids, scenes)
	if err != nil {
		return nil, err
	}

	var orgp, parentp *property.Property
	if org != nil && parent != nil && len(props) == 2 {
		orgp = props[0]
		parentp = props[1]
	} else if org != nil && parent == nil && len(props) == 1 {
		orgp = props[0]
	} else if org == nil && parent != nil && len(props) == 1 {
		parentp = props[0]
	}

	res := property.Merge(orgp, parentp, linked)
	return res, nil
}

func (i *Property) UpdateValue(ctx context.Context, inp interfaces.UpdatePropertyValueParam, operator *usecase.Operator) (p *property.Property, _ *property.GroupList, _ *property.Group, _ *property.Field, err error) {

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	scenes, err := i.OnlyWritableScenes(ctx, operator)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	p, err = i.propertyRepo.FindByID(ctx, inp.PropertyID, scenes)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	if err := i.CheckSceneLock(ctx, p.Scene()); err != nil {
		return nil, nil, nil, nil, err
	}

	ps, err := i.propertySchemaRepo.FindByID(ctx, p.Schema())
	if err != nil {
		return nil, nil, nil, nil, err
	}

	field, pgl, pg, err := p.UpdateValue(ps, inp.Pointer, inp.Value)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	err = i.propertyRepo.Save(ctx, p)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	tx.Commit()
	return p, pgl, pg, field, nil
}

func (i *Property) RemoveField(ctx context.Context, inp interfaces.RemovePropertyFieldParam, operator *usecase.Operator) (p *property.Property, err error) {

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	scenes, err := i.OnlyWritableScenes(ctx, operator)
	if err != nil {
		return nil, err
	}

	p, err = i.propertyRepo.FindByID(ctx, inp.PropertyID, scenes)
	if err != nil {
		return nil, err
	}

	if err := i.CheckSceneLock(ctx, p.Scene()); err != nil {
		return nil, err
	}

	p.RemoveField(inp.Pointer)
	p.Prune()

	err = i.propertyRepo.Save(ctx, p)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return p, nil
}

func (i *Property) UploadFile(ctx context.Context, inp interfaces.UploadFileParam, operator *usecase.Operator) (p *property.Property, pgl *property.GroupList, pg *property.Group, field *property.Field, err error) {
	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	if inp.File == nil {
		return nil, nil, nil, nil, interfaces.ErrInvalidFile
	}

	scenes, err := i.OnlyWritableScenes(ctx, operator)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	p, err = i.propertyRepo.FindByID(ctx, inp.PropertyID, scenes)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	if err := i.CheckSceneLock(ctx, p.Scene()); err != nil {
		return nil, nil, nil, nil, err
	}

	propertyScene, err := i.sceneRepo.FindByID(ctx, p.Scene(), operator.WritableTeams)
	if err != nil {
		return nil, nil, nil, nil, err
	}
	ps, err := i.propertySchemaRepo.FindByID(ctx, p.Schema())
	if err != nil {
		return nil, nil, nil, nil, err
	}

	field, pgl, pg, _ = p.GetOrCreateField(ps, inp.Pointer)

	if field.Type() != property.ValueTypeURL {
		return nil, nil, nil, nil, interfaces.ErrPropertyInvalidType
	}

	url, err := i.file.UploadAsset(ctx, inp.File)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	asset, err := asset.New().
		NewID().
		Team(propertyScene.Team()).
		Name(path.Base(inp.File.Path)).
		Size(inp.File.Size).
		URL(url.String()).
		Build()
	if err != nil {
		return nil, nil, nil, nil, err
	}

	err = i.assetRepo.Save(ctx, asset)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	v := property.ValueTypeURL.ValueFromUnsafe(url)
	if v == nil {
		return nil, nil, nil, nil, interfaces.ErrInvalidPropertyValue
	}
	if err = field.Update(v, ps.Field(field.Field())); err != nil {
		return nil, nil, nil, nil, err
	}

	if err = i.propertyRepo.Save(ctx, p); err != nil {
		return nil, nil, nil, nil, err
	}

	tx.Commit()
	return p, pgl, pg, field, nil
}

func (i *Property) LinkValue(ctx context.Context, inp interfaces.LinkPropertyValueParam, operator *usecase.Operator) (p *property.Property, pgl *property.GroupList, pg *property.Group, field *property.Field, err error) {

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	scenes, err := i.OnlyWritableScenes(ctx, operator)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	p, err = i.propertyRepo.FindByID(ctx, inp.PropertyID, scenes)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	if err := i.CheckSceneLock(ctx, p.Scene()); err != nil {
		return nil, nil, nil, nil, err
	}

	ps, err := i.propertySchemaRepo.FindByID(ctx, p.Schema())
	if err != nil {
		return nil, nil, nil, nil, err
	}

	field, pgl, pg, _ = p.GetOrCreateField(ps, inp.Pointer)

	propertyScenes := []id.SceneID{p.Scene()}

	if inp.Links != nil {
		dsids := inp.Links.DatasetSchemaIDs()
		dids := inp.Links.DatasetIDs()
		dss, err := i.datasetSchemaRepo.FindByIDs(ctx, dsids, propertyScenes)
		if err != nil {
			return nil, nil, nil, nil, err
		}
		ds, err := i.datasetRepo.FindByIDs(ctx, dids, propertyScenes)
		if err != nil {
			return nil, nil, nil, nil, err
		}
		if !inp.Links.Validate(dss.Map(), ds.Map()) {
			return nil, nil, nil, nil, interfaces.ErrInvalidPropertyLinks
		}
	}

	field.Link(inp.Links)

	err = i.propertyRepo.Save(ctx, p)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	tx.Commit()
	return p, pgl, pg, field, nil
}

func (i *Property) UnlinkValue(ctx context.Context, inp interfaces.UnlinkPropertyValueParam, operator *usecase.Operator) (p *property.Property, pgl *property.GroupList, pg *property.Group, field *property.Field, err error) {

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	scenes, err := i.OnlyWritableScenes(ctx, operator)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	p, err = i.propertyRepo.FindByID(ctx, inp.PropertyID, scenes)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	if err := i.CheckSceneLock(ctx, p.Scene()); err != nil {
		return nil, nil, nil, nil, err
	}

	ps, err := i.propertySchemaRepo.FindByID(ctx, p.Schema())
	if err != nil {
		return nil, nil, nil, nil, err
	}

	field, pgl, pg, _ = p.GetOrCreateField(ps, inp.Pointer)

	field.Unlink()

	if field.IsEmpty() {
		field = nil
	}
	p.Prune()

	err = i.propertyRepo.Save(ctx, p)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	tx.Commit()
	return p, pgl, pg, field, nil
}

func (i *Property) AddItem(ctx context.Context, inp interfaces.AddPropertyItemParam, operator *usecase.Operator) (p *property.Property, _ *property.GroupList, pg *property.Group, err error) {

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	scenes, err := i.OnlyWritableScenes(ctx, operator)
	if err != nil {
		return nil, nil, nil, err
	}

	p, err = i.propertyRepo.FindByID(ctx, inp.PropertyID, scenes)
	if err != nil {
		return nil, nil, nil, err
	}

	if err := i.CheckSceneLock(ctx, p.Scene()); err != nil {
		return nil, nil, nil, err
	}

	ps, err := i.propertySchemaRepo.FindByID(ctx, p.Schema())
	if err != nil {
		return nil, nil, nil, err
	}

	item, gl := p.AddListItem(ps, inp.Pointer, inp.Index)
	if item == nil {
		return nil, nil, nil, errors.New("failed to create item")
	}

	// Set nameFieldValue to the name field
	if inp.NameFieldValue != nil {
		_ = item.UpdateNameFieldValue(ps, inp.NameFieldValue)
	}

	err = i.propertyRepo.Save(ctx, p)
	if err != nil {
		return nil, nil, nil, err
	}

	tx.Commit()
	return p, gl, item, nil
}

func (i *Property) MoveItem(ctx context.Context, inp interfaces.MovePropertyItemParam, operator *usecase.Operator) (p *property.Property, _ *property.GroupList, _ *property.Group, err error) {

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	scenes, err := i.OnlyWritableScenes(ctx, operator)
	if err != nil {
		return nil, nil, nil, err
	}

	p, err = i.propertyRepo.FindByID(ctx, inp.PropertyID, scenes)
	if err != nil {
		return nil, nil, nil, err
	}

	if err := i.CheckSceneLock(ctx, p.Scene()); err != nil {
		return nil, nil, nil, err
	}

	item, gl := p.MoveListItem(inp.Pointer, inp.Index)
	if item == nil {
		return nil, nil, nil, errors.New("failed to move item")
	}

	err = i.propertyRepo.Save(ctx, p)
	if err != nil {
		return nil, nil, nil, err
	}

	tx.Commit()
	return p, gl, item, nil
}

func (i *Property) RemoveItem(ctx context.Context, inp interfaces.RemovePropertyItemParam, operator *usecase.Operator) (p *property.Property, err error) {

	tx, err := i.transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	scenes, err := i.OnlyWritableScenes(ctx, operator)
	if err != nil {
		return nil, err
	}

	p, err = i.propertyRepo.FindByID(ctx, inp.PropertyID, scenes)
	if err != nil {
		return nil, err
	}

	if err := i.CheckSceneLock(ctx, p.Scene()); err != nil {
		return nil, err
	}

	if ok := p.RemoveListItem(inp.Pointer); !ok {
		return nil, errors.New("failed to remove item")
	}

	err = i.propertyRepo.Save(ctx, p)
	if err != nil {
		return nil, err
	}

	tx.Commit()
	return p, nil
}

func (i *Property) UpdateItems(ctx context.Context, inp interfaces.UpdatePropertyItemsParam, operator *usecase.Operator) (*property.Property, error) {
	scenes, err := i.OnlyWritableScenes(ctx, operator)
	if err != nil {
		return nil, err
	}

	p, err := i.propertyRepo.FindByID(ctx, inp.PropertyID, scenes)
	if err != nil {
		return nil, err
	}

	if err := i.CheckSceneLock(ctx, p.Scene()); err != nil {
		return nil, err
	}

	ps, err := i.propertySchemaRepo.FindByID(ctx, p.Schema())
	if err != nil {
		return nil, err
	}

	for _, op := range inp.Operations {
		var ptr *property.Pointer
		if op.ItemID != nil {
			ptr = property.PointItem(*op.ItemID)
		}

		if op.Operation == interfaces.ListOperationAdd {
			g, _ := p.AddListItem(ps, inp.Pointer, op.Index)
			if op.NameFieldValue != nil {
				_ = g.UpdateNameFieldValue(ps, op.NameFieldValue)
			}
		} else if op.Operation == interfaces.ListOperationMove && ptr != nil && op.Index != nil {
			_, _ = p.MoveListItem(ptr, *op.Index)
		} else if op.Operation == interfaces.ListOperationRemove && ptr != nil {
			_ = p.RemoveListItem(ptr)
		}
	}

	err = i.propertyRepo.Save(ctx, p)
	if err != nil {
		return nil, err
	}

	return p, nil
}
