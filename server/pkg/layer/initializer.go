package layer

import (
	"errors"
	"fmt"

	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearthx/rerror"
)

var (
	ErrInitializationInfobox      = errors.New("infobox")
	ErrInitializationInfoboxWith  = rerror.With(ErrInitializationInfobox)
	ErrInitializationProperty     = errors.New("property")
	ErrInitializationPropertyWith = rerror.With(ErrInitializationProperty)
)

type InitializerResult struct {
	Root       ID
	Layers     Map
	Properties property.Map
}

func (r InitializerResult) RootLayer() Layer {
	return r.Layers.Layer(r.Root)
}

func (r InitializerResult) RootLayerRef() *Layer {
	return r.Layers[r.Root]
}

func (r InitializerResult) RootLayerGroup() *Group {
	return r.Layers.Group(r.Root)
}

func (r InitializerResult) RootLayerItem() *Item {
	return r.Layers.Item(r.Root)
}

type Initializer struct {
	ID                  *ID                   `json:"id"`
	Plugin              *PluginID             `json:"plugin"`
	Extension           *PluginExtensionID    `json:"extension"`
	Name                string                `json:"name"`
	Infobox             *InitializerInfobox   `json:"infobox"`
	PropertyID          *PropertyID           `json:"propertyId"`
	Property            *property.Initializer `json:"property"`
	Layers              []*Initializer        `json:"layers"`
	LayerIDs            []ID                  `json:"layerIds"`
	IsVisible           *bool                 `json:"isVisible"`
	LinkedDatasetSchema *DatasetSchemaID      `json:"linkedDatasetSchema"`
	LinkedDataset       *DatasetID            `json:"linkedDataset"`
}

func (i *Initializer) Clone() *Initializer {
	if i == nil {
		return nil
	}

	var isVisible *bool
	if i.IsVisible != nil {
		isVisible2 := *i.IsVisible
		isVisible = &isVisible2
	}

	var layers []*Initializer
	if i.Layers != nil {
		layers = make([]*Initializer, 0, len(i.Layers))
		for _, l := range i.Layers {
			layers = append(layers, l.Clone())
		}
	}

	var layerIDs []ID
	if len(i.LayerIDs) > 0 {
		layerIDs = append([]ID{}, i.LayerIDs...)
	}

	return &Initializer{
		ID:                  i.ID.CloneRef(),
		Plugin:              i.Plugin.CloneRef(),
		Extension:           i.Extension.CloneRef(),
		Name:                i.Name,
		Infobox:             i.Infobox.Clone(),
		PropertyID:          i.PropertyID.CloneRef(),
		Property:            i.Property.Clone(),
		Layers:              layers,
		LayerIDs:            layerIDs,
		IsVisible:           isVisible,
		LinkedDatasetSchema: i.LinkedDatasetSchema.CloneRef(),
		LinkedDataset:       i.LinkedDataset.CloneRef(),
	}
}

func (i *Initializer) Layer(sid SceneID) (r InitializerResult, err error) {
	if i == nil {
		return
	}

	ib, pm, err2 := i.Infobox.Infobox(sid)
	if err2 != nil {
		err = ErrInitializationInfoboxWith(err2)
		return
	}
	r.Properties = r.Properties.Merge(pm)

	lid := i.ID
	if i.ID == nil {
		lid = NewID().Ref()
	}

	pid := i.PropertyID
	lp, err2 := i.Property.Property(sid)
	if err2 != nil {
		err = ErrInitializationPropertyWith(err2)
		return
	}
	if lp != nil {
		pid = lp.IDRef()
		r.Properties = r.Properties.Add(lp)
	}

	lay := New().
		ID(*lid).
		Plugin(i.Plugin).
		Extension(i.Extension).
		Infobox(ib).
		Scene(sid).
		Property(pid).
		Name(i.Name).
		IsVisibleRef(i.IsVisible)

	var l Layer
	if i.Layers != nil {
		layers := NewIDList(nil)

		for i, lay2 := range i.Layers {
			r2, err2 := lay2.Layer(sid)
			if err2 != nil {
				err = rerror.From(fmt.Sprint(i), err2)
				return
			}
			if rootLayer := r2.RootLayer(); rootLayer != nil {
				layers = layers.AppendLayers(rootLayer.ID())
				r.Layers = r.Layers.Merge(r2.Layers)
				r.Properties = r.Properties.Merge(r2.Properties)
			}
		}

		l, err = lay.Group().LinkedDatasetSchema(i.LinkedDatasetSchema).Layers(layers).Build()
	} else if i.LayerIDs != nil {
		l, err = lay.Group().LinkedDatasetSchema(i.LinkedDatasetSchema).Layers(NewIDList(i.LayerIDs)).Build()
	} else {
		l, err = lay.Item().LinkedDataset(i.LinkedDataset).Build()
	}

	if err != nil {
		err = fmt.Errorf("failed to initialize layer: %w", err)
		return
	}

	r.Layers = r.Layers.Add(&l)
	r.Root = l.ID()
	return
}

func (i *Initializer) MustBeLayer(sid SceneID) InitializerResult {
	r, err := i.Layer(sid)
	if err != nil {
		panic(err)
	}
	return r
}

type InitializerInfobox struct {
	PropertyID *PropertyID                `json:"propertyId"`
	Property   *property.Initializer      `json:"property"`
	Fields     []*InitializerInfoboxField `json:"fields"`
}

func (i *InitializerInfobox) Clone() *InitializerInfobox {
	if i == nil {
		return nil
	}

	var fields []*InitializerInfoboxField
	if i.Fields != nil {
		fields = make([]*InitializerInfoboxField, 0, len(i.Fields))
		for _, f := range i.Fields {
			fields = append(fields, f.Clone())
		}
	}

	return &InitializerInfobox{
		PropertyID: i.PropertyID.CloneRef(),
		Property:   i.Property.Clone(),
		Fields:     fields,
	}
}

func (i *InitializerInfobox) Infobox(scene SceneID) (*Infobox, property.Map, error) {
	if i == nil {
		return nil, nil, nil
	}

	pm := property.Map{}
	var fields []*InfoboxField
	if i.Fields != nil {
		fields = make([]*InfoboxField, 0, len(i.Fields))
		for i, f := range i.Fields {
			ibf, ibfp, err := f.InfoboxField(scene)
			if err != nil {
				return nil, nil, rerror.From(fmt.Sprint(i), err)
			}
			fields = append(fields, ibf)
			pm = pm.Add(ibfp)
		}
	}

	var ibp *property.Property
	ibpid := i.PropertyID
	if ibpid == nil {
		var err error
		ibp, err = i.Property.PropertyIncludingEmpty(scene, builtin.PropertySchemaIDInfobox)
		if err != nil {
			return nil, nil, ErrInitializationPropertyWith(err)
		}
		if ibp != nil {
			ibpid = ibp.IDRef()
			pm = pm.Add(ibp)
		}
	}
	if ibpid == nil {
		return nil, nil, errors.New("infobox property id is empty")
	}

	return NewInfobox(fields, *ibpid), pm, nil
}

type InitializerInfoboxField struct {
	ID         *InfoboxFieldID       `json:"id"`
	Plugin     PluginID              `json:"plugin"`
	Extension  PluginExtensionID     `json:"extension"`
	PropertyID *PropertyID           `json:"propertyId"`
	Property   *property.Initializer `json:"property"`
}

func (i *InitializerInfoboxField) Clone() *InitializerInfoboxField {
	if i == nil {
		return nil
	}

	return &InitializerInfoboxField{
		ID:         i.ID.CloneRef(),
		Plugin:     i.Plugin,
		Extension:  i.Extension,
		PropertyID: i.PropertyID.CloneRef(),
		Property:   i.Property.Clone(),
	}
}

func (i *InitializerInfoboxField) InfoboxField(scene SceneID) (*InfoboxField, *property.Property, error) {
	if i == nil {
		return nil, nil, nil
	}

	psid := NewPropertySchemaID(i.Plugin, i.Extension.String())

	fid := i.ID
	if i.ID == nil {
		fid = NewInfoboxFieldID().Ref()
	}

	pid := i.PropertyID
	var p *property.Property
	if pid == nil {
		p2, err := i.Property.PropertyIncludingEmpty(scene, psid)
		if err != nil {
			return nil, nil, ErrInitializationPropertyWith(err)
		}
		if p2 != nil {
			p = p2
			pid = p2.IDRef()
		}
	}
	if pid == nil {
		return nil, nil, errors.New("infobox field property id is empty")
	}

	f, err := NewInfoboxField().ID(*fid).Plugin(i.Plugin).Extension(i.Extension).Property(*pid).Build()
	if err != nil {
		return nil, nil, err
	}
	return f, p, nil
}
