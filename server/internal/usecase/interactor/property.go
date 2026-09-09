package interactor

import (
	"context"
	"errors"
	"fmt"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearthx/usecasex"
)

type Property struct {
	common
	commonSceneLock
	propertyRepo       repo.Property
	propertySchemaRepo repo.PropertySchema
	sceneRepo          repo.Scene
	assetRepo          repo.Asset
	file               gateway.File
	transaction        usecasex.Transaction
}

func NewProperty(r *repo.Container, gr *gateway.Container) interfaces.Property {
	return &Property{
		commonSceneLock:    commonSceneLock{sceneLockRepo: r.SceneLock},
		propertyRepo:       r.Property,
		propertySchemaRepo: r.PropertySchema,
		sceneRepo:          r.Scene,
		assetRepo:          r.Asset,
		transaction:        r.Transaction,
		file:               gr.File,
	}
}

func (i *Property) Fetch(ctx context.Context, ids []id.PropertyID, operator *usecase.Operator) ([]*property.Property, error) {
	if operator == nil {
		return nil, interfaces.ErrOperationDenied
	}
	res, err := i.propertyRepo.FindByIDs(ctx, ids)
	if err != nil {
		return nil, err
	}
	for idx, p := range res {
		if p != nil && !operator.IsReadableScene(p.Scene()) {
			res[idx] = nil
		}
	}
	return res, nil
}

func (i *Property) FetchSchema(ctx context.Context, ids []id.PropertySchemaID, operator *usecase.Operator) ([]*property.Schema, error) {
	return i.propertySchemaRepo.FindByIDs(ctx, ids)
}

// UpdateValue is retried on write conflict: the editor issues these in bursts
// (a single user dragging or applying values produced ~16 calls/second in
// production), and concurrent edits all rewrite the same property document, so
// MongoDB aborts the losers with a WriteConflict. Every attempt re-reads the
// property inside the new transaction, so a retry applies its change on top of
// whichever write landed first rather than clobbering it.
func (i *Property) UpdateValue(ctx context.Context, inp interfaces.UpdatePropertyValueParam, operator *usecase.Operator) (*property.Property, *property.GroupList, *property.Group, *property.Field, error) {
	var p *property.Property
	var pgl *property.GroupList
	var pg *property.Group
	var field *property.Field

	if err := runWithTxRetry(ctx, i.transaction, txMaxRetries, func(txCtx context.Context) error {
		var err error
		p, err = i.propertyRepo.FindByID(txCtx, inp.PropertyID)
		if err != nil {
			return err
		}
		if err := i.CanWriteScene(p.Scene(), operator); err != nil {
			return err
		}

		if err := i.CheckSceneLock(txCtx, p.Scene()); err != nil {
			return err
		}

		ps, err := i.propertySchemaRepo.FindByID(txCtx, p.Schema())
		if err != nil {
			return err
		}

		field, pgl, pg, err = p.UpdateValue(ps, inp.Pointer, inp.Value)
		if err != nil {
			return err
		}

		return i.propertyRepo.Save(txCtx, p)
	}); err != nil {
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

	// Validate every requested initial field against the schema before
	// mutating p at all, so an unknown field is rejected up front instead of
	// after the item has already been added to the in-memory property --
	// which some repo.Property implementations (e.g. the in-memory one used
	// in tests) return by reference, making that mutation visible even
	// though it's never Saved/Committed.
	if len(inp.Fields) > 0 {
		if sgID, ok := inp.Pointer.ItemBySchemaGroup(); ok {
			if sg := ps.Groups().Group(sgID); sg != nil {
				for _, f := range inp.Fields {
					sf := sg.Field(f.Field)
					if sf == nil {
						return nil, nil, nil, fmt.Errorf("unknown field: %s", f.Field)
					}
					// A value whose type disagrees with the schema is silently
					// dropped further down: GetOrCreateField builds the field
					// with the schema's type, and OptionalValue.SetValue ignores
					// a value of any other type. That would create the item with
					// the field left unset, which is the state this atomic
					// creation exists to prevent, so reject it up front.
					if f.Value != nil && sf.Type() != f.Value.Type() {
						return nil, nil, nil, fmt.Errorf("invalid value type for field %s: schema expects %s, got %s", f.Field, sf.Type(), f.Value.Type())
					}
				}
			}
		}
	}

	item, gl := p.AddListItem(ps, inp.Pointer, inp.Index)
	if item == nil {
		return nil, nil, nil, errors.New("failed to create item")
	}

	// Set nameFieldValue to the name field
	if inp.NameFieldValue != nil {
		item.RepresentativeField(ps).UpdateUnsafe(inp.NameFieldValue)
	}

	// Set any additional initial field values in the same transaction as the
	// item creation, so a caller never observes an item that exists but is
	// missing fields it depends on to be recognized correctly (e.g. a
	// discriminator field like tile_category).
	for _, f := range inp.Fields {
		if f.Value == nil {
			continue
		}
		field, _ := item.GetOrCreateField(ps, f.Field)
		if field == nil {
			return nil, nil, nil, fmt.Errorf("failed to create field: %s", f.Field)
		}
		field.UpdateUnsafe(f.Value)
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
