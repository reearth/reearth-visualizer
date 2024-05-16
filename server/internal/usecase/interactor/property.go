package interactor

import (
	"context"
	"errors"

	"github.com/go-redis/redis/v8"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/value"
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

	err = setPropertyToCache(ctx, i.redis, property.PropertyCacheKey(p.ID()), p)
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
	ID     string          `msgpack:"ID"`
	Scene  string          `msgpack:"Scene"`
	Schema string          `msgpack:"Schema"`
	Items  []GroupForRedis `msgpack:"Items"`
}

type GroupForRedis struct {
	ID          string           `msgpack:"ID"`
	SchemaGroup string           `msgpack:"SchemaGroup"`
	Fields      []*FieldForRedis `msgpack:"Fields"`
}

type FieldForRedis struct {
	Field string                 `msgpack:"Field"`
	Links *LinksForRedis         `msgpack:"Links,omitempty"`
	V     *OptionalValueForRedis `msgpack:"V,omitempty"`
}

type LinksForRedis struct {
	Links []*LinkForRedis `msgpack:"Links"`
}

type LinkForRedis struct {
	Dataset *string `msgpack:"Dataset,omitempty"`
	Schema  *string `msgpack:"Schema,omitempty"`
	Field   *string `msgpack:"Field,omitempty"`
}

type OptionalValueForRedis struct {
	Type  string         `msgpack:"Type"`
	Value *ValueForRedis `msgpack:"Value,omitempty"`
}

type ValueForRedis struct {
	P map[string]interface{} `msgpack:"P"`
	V interface{}            `msgpack:"V"`
	T string                 `msgpack:"T"`
}

func getPropertyFromCache(ctx context.Context, redisClient any, cacheKey string) (*property.Property, error) {
	redisAdapter, ok := checkRedisClient(redisClient)
	if !ok {
		return nil, nil
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

	propertyDomain, err := convertPropertyFromRedis(p)
	if err != nil {
		return nil, err
	}

	return propertyDomain, nil
}

func setPropertyToCache(ctx context.Context, redisClient any, cacheKey string, data *property.Property) error {
	redisAdapter, ok := checkRedisClient(redisClient)
	if !ok {
		return nil
	}

	propertyForRedis := convertPropertyToRedis(data)

	serializedData, err := msgpack.Marshal(propertyForRedis)
	if err != nil {
		return err
	}

	return redisAdapter.SetValue(ctx, cacheKey, serializedData)
}

func convertPropertyToRedis(p *property.Property) PropertyForRedis {
	ptr := &property.Pointer{}
	fields := p.Items()[0].Fields(ptr)

	fieldsForRedis := make([]*FieldForRedis, 0, len(fields))
	for _, field := range fields {
		valueForRedis := ValueForRedis{
			P: map[string]interface{}{},
			V: field.TypeAndValue().Value().Value(),
			T: string(field.TypeAndValue().Value().Type()),
		}

		optionalValueForRedis := OptionalValueForRedis{
			Type:  string(field.TypeAndValue().Type()),
			Value: &valueForRedis,
		}

		fieldForRedis := FieldForRedis{
			Field: field.Field().String(),
			Links: nil,
			V:     &optionalValueForRedis,
		}

		fieldsForRedis = append(fieldsForRedis, &fieldForRedis)
	}

	groupForRedis := GroupForRedis{
		ID:          p.Items()[0].ID().String(),
		SchemaGroup: p.Items()[0].SchemaGroup().String(),
		Fields:      fieldsForRedis,
	}

	propertyForRedis := PropertyForRedis{
		ID:     p.ID().String(),
		Scene:  p.Scene().String(),
		Schema: p.Schema().String(),
		Items:  []GroupForRedis{groupForRedis},
	}

	return propertyForRedis
}

func convertPropertyFromRedis(p PropertyForRedis) (*property.Property, error) {

	fieldsDomain := make([]*property.Field, 0, len(p.Items[0].Fields))
	for _, field := range p.Items[0].Fields {

		var v interface{}
		if field.Field == "padding" {
			m := field.V.Value.V.(map[string]interface{})
			v = property.Spacing{
				Top:    m["Top"].(float64),
				Bottom: m["Bottom"].(float64),
				Left:   m["Left"].(float64),
				Right:  m["Right"].(float64),
			}
		} else {
			v = field.V.Value.V
		}

		valueDomain := value.New(
			property.DefaultTypes(),
			v,
			value.Type(field.V.Value.T),
		)

		optionalValueDomain := property.NewOptionalValue(
			property.ValueType(field.V.Type),
			property.NewValue(valueDomain),
		)

		fieldDomain := property.NewFieldDomain(
			property.FieldID(field.Field),
			nil,
			optionalValueDomain,
		)

		fieldsDomain = append(fieldsDomain, fieldDomain)
	}

	groupDomain := property.NewGroup().
		ID(property.MustItemID(p.Items[0].ID)).
		SchemaGroup(property.SchemaGroupID(p.Items[0].SchemaGroup)).
		Fields(fieldsDomain).
		MustBuild()

	propertyDomain := property.New().
		ID(property.MustID(p.ID)).
		Scene(property.MustSceneID(p.Scene)).
		Schema(property.MustSchemaID(p.Schema)).
		Items([]property.Item{groupDomain}).
		MustBuild()

	return propertyDomain, nil
}
