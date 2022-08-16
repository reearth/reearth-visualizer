package merging

import (
	"context"

	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/property"
)

type Merger struct {
	LayerLoader    layer.Loader
	PropertyLoader property.Loader
}

func (m *Merger) MergeLayer(ctx context.Context, l layer.Layer, parent *layer.Group) (MergedLayer, error) {
	if m == nil || l == nil {
		return nil, nil
	}

	common, err := m.mergeCommon(ctx, l, parent)
	if err != nil {
		return nil, err
	}
	if common == nil {
		return nil, nil
	}

	if li := layer.ToLayerItem(l); li != nil {
		// item
		return &MergedLayerItem{*common}, nil
	} else if lg := layer.ToLayerGroup(l); lg != nil {
		// group
		layers, err := m.LayerLoader(ctx, lg.Layers().Layers()...)
		if err != nil {
			return nil, err
		}

		children := make([]MergedLayer, 0, len(layers))
		for _, c := range layers {
			if c == nil {
				continue
			}
			ml, err := m.MergeLayer(ctx, *c, lg)
			if err != nil {
				return nil, err
			}
			children = append(children, ml)
		}

		return &MergedLayerGroup{
			MergedLayerCommon: *common,
			Children:          children,
		}, nil
	}

	return nil, nil
}

func (m *Merger) MergeLayerFromID(ctx context.Context, i layer.ID, parent *layer.Group) (MergedLayer, error) {
	l, err := m.LayerLoader(ctx, i)
	if err != nil {
		return nil, err
	}
	if len(l) == 0 || l[0] == nil {
		return nil, nil
	}
	return m.MergeLayer(ctx, *l[0], parent)
}

func (m *Merger) mergeCommon(ctx context.Context, original layer.Layer, parent *layer.Group) (p *MergedLayerCommon, e error) {
	ml := layer.Merge(original, parent)
	if ml == nil {
		return
	}
	properties, err := m.PropertyLoader(ctx, ml.Properties()...)
	if err != nil {
		e = err
		return
	}

	var infobox *MergedInfobox
	if ml.Infobox != nil {
		fields := make([]*MergedInfoboxField, 0, len(ml.Infobox.Fields))
		for _, f := range ml.Infobox.Fields {
			fields = append(fields, &MergedInfoboxField{
				MergedInfoboxField: *f,
				Property:           mergeProperty(f.Property, properties),
			})
		}
		infobox = &MergedInfobox{
			MergedInfobox: *ml.Infobox,
			Fields:        fields,
			Property:      mergeProperty(ml.Infobox.Property, properties),
		}
	}

	p = &MergedLayerCommon{
		Merged:   *ml,
		Property: mergeProperty(ml.Property, properties),
		Infobox:  infobox,
	}
	return
}

func mergeProperty(ml *property.MergedMetadata, properties []*property.Property) *property.Merged {
	var op, pp *property.Property
	for _, p := range properties {
		if ml.Original != nil && p.ID() == *ml.Original {
			op = p
		}
		if ml.Parent != nil && p.ID() == *ml.Parent {
			pp = p
		}
		if (ml.Original == nil || op != nil) && (ml.Parent == nil || pp != nil) {
			break
		}
	}
	return ml.Merge(op, pp)
}
