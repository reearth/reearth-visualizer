package interactor

import (
	"context"
	"errors"
	"log"

	"github.com/go-redis/redis/v8"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearthx/usecasex"
	"github.com/vmihailenco/msgpack/v5"
)

type Property struct {
	common
	commonSceneLock
	propertyRepo       repo.Property
	propertySchemaRepo repo.PropertySchema
	datasetRepo        repo.Dataset
	datasetSchemaRepo  repo.DatasetSchema
	sceneRepo          repo.Scene
	assetRepo          repo.Asset
	file               gateway.File
	transaction        usecasex.Transaction
	redis              gateway.RedisGateway
}

func NewProperty(r *repo.Container, gr *gateway.Container, redis gateway.RedisGateway) interfaces.Property {
	return &Property{
		commonSceneLock:    commonSceneLock{sceneLockRepo: r.SceneLock},
		propertyRepo:       r.Property,
		propertySchemaRepo: r.PropertySchema,
		datasetRepo:        r.Dataset,
		datasetSchemaRepo:  r.DatasetSchema,
		sceneRepo:          r.Scene,
		assetRepo:          r.Asset,
		transaction:        r.Transaction,
		file:               gr.File,
		redis:              redis,
	}
}

func (i *Property) Fetch(ctx context.Context, ids []id.PropertyID, operator *usecase.Operator) ([]*property.Property, error) {
	return i.propertyRepo.FindByIDs(ctx, ids)
}

func (i *Property) FetchSchema(ctx context.Context, ids []id.PropertySchemaID, operator *usecase.Operator) ([]*property.Schema, error) {
	return i.propertySchemaRepo.FindByIDs(ctx, ids)
}

func (i *Property) FetchMerged(ctx context.Context, org, parent *id.PropertyID, linked *id.DatasetID, operator *usecase.Operator) (*property.Merged, error) {
	ids := []id.PropertyID{}
	if org != nil {
		ids = append(ids, *org)
	}
	if parent != nil {
		ids = append(ids, *parent)
	}
	props, err := i.propertyRepo.FindByIDs(ctx, ids)
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
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	propertyCache, err := getPropertyFromCache(ctx, i.redis, property.PropertyCacheKey(inp.PropertyID))
	if err != nil {
		return nil, nil, nil, nil, err
	}

	if propertyCache == nil {
		p, err = i.propertyRepo.FindByID(ctx, inp.PropertyID)
		if err != nil {
			return nil, nil, nil, nil, err
		}
	} else {
		p = propertyCache
	}

	if err := i.CanWriteScene(p.Scene(), operator); err != nil {
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

	err = setToCache[*property.Property](ctx, i.redis, property.PropertyCacheKey(p.ID()), p)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	return p, pgl, pg, field, nil
}

func (i *Property) RemoveField(ctx context.Context, inp interfaces.RemovePropertyFieldParam, operator *usecase.Operator) (p *property.Property, err error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	p, err = i.propertyRepo.FindByID(ctx, inp.PropertyID)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteScene(p.Scene(), operator); err != nil {
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

func (i *Property) LinkValue(ctx context.Context, inp interfaces.LinkPropertyValueParam, operator *usecase.Operator) (p *property.Property, pgl *property.GroupList, pg *property.Group, field *property.Field, err error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	p, err = i.propertyRepo.FindByID(ctx, inp.PropertyID)
	if err != nil {
		return nil, nil, nil, nil, err
	}
	if err := i.CanWriteScene(p.Scene(), operator); err != nil {
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

	if inp.Links != nil {
		dsids := inp.Links.DatasetSchemaIDs()
		dids := inp.Links.DatasetIDs()
		dss, err := i.datasetSchemaRepo.FindByIDs(ctx, dsids)
		if err != nil {
			return nil, nil, nil, nil, err
		}
		ds, err := i.datasetRepo.FindByIDs(ctx, dids)
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
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	p, err = i.propertyRepo.FindByID(ctx, inp.PropertyID)
	if err != nil {
		return nil, nil, nil, nil, err
	}
	if err := i.CanWriteScene(p.Scene(), operator); err != nil {
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
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	p, err = i.propertyRepo.FindByID(ctx, inp.PropertyID)
	if err != nil {
		return nil, nil, nil, err
	}
	if err := i.CanWriteScene(p.Scene(), operator); err != nil {
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
		item.RepresentativeField(ps).UpdateUnsafe(inp.NameFieldValue)
	}

	err = i.propertyRepo.Save(ctx, p)
	if err != nil {
		return nil, nil, nil, err
	}

	tx.Commit()
	return p, gl, item, nil
}

func (i *Property) MoveItem(ctx context.Context, inp interfaces.MovePropertyItemParam, operator *usecase.Operator) (p *property.Property, _ *property.GroupList, _ *property.Group, err error) {
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	p, err = i.propertyRepo.FindByID(ctx, inp.PropertyID)
	if err != nil {
		return nil, nil, nil, err
	}
	if err := i.CanWriteScene(p.Scene(), operator); err != nil {
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
	tx, err := i.transaction.Begin(ctx)
	if err != nil {
		return
	}

	ctx = tx.Context()
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	p, err = i.propertyRepo.FindByID(ctx, inp.PropertyID)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteScene(p.Scene(), operator); err != nil {
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
	p, err := i.propertyRepo.FindByID(ctx, inp.PropertyID)
	if err != nil {
		return nil, err
	}
	if err := i.CanWriteScene(p.Scene(), operator); err != nil {
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
				g.RepresentativeField(ps).UpdateUnsafe(op.NameFieldValue)
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

type PropertyForRedis struct {
	ID     string         `msgpack:"id"`
	Scene  string         `msgpack:"scene"`
	Schema string         `msgpack:"schema"`
	Items  []ItemForRedis `msgpack:"items"`
}

type ItemForRedis struct {
	ID          string          `msgpack:"ID"`
	SchemaGroup string          `msgpack:"SchemaGroup"`
	Fields      []FieldForRedis `msgpack:"fields"`
}

type FieldForRedis struct {
	Field string        `msgpack:"field"`
	Links interface{}   `msgpack:"links"`
	V     ValueForRedis `msgpack:"v"`
}

type ValueForRedis struct {
	Ov OptionalValueForRedis `msgpack:"ov"`
}

type OptionalValueForRedis struct {
	Field string                 `msgpack:"Field"`
	Value map[string]interface{} `msgpack:"Value"`
}

func getPropertyFromCache(ctx context.Context, redisClient any, cacheKey string) (*property.Property, error) {
	redisAdapter, ok := checkRedisClient(redisClient)
	if !ok {
		return nil, errors.New("invalid redis client")
	}

	val, err := redisAdapter.GetValue(ctx, cacheKey)
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, err
	}

	var p PropertyForRedis
	if err := msgpack.Unmarshal([]byte(val), &p); err != nil {
		return nil, err
	}

	log.Printf("p: %+v", p)

	var propertyDomain property.Property
	return &propertyDomain, nil
}
