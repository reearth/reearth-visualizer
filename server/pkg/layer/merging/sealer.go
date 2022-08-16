package merging

import (
	"context"

	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/tag"
)

type Sealer struct {
	DatasetGraphLoader dataset.GraphLoader
	TagLoader          tag.Loader
}

func (s *Sealer) Seal(ctx context.Context, m MergedLayer) (SealedLayer, error) {
	if s == nil || m == nil {
		return nil, nil
	}

	var tagMap tag.Map
	if tags := m.AllTags(); len(tags) > 0 {
		tags2, err := s.TagLoader(ctx, tags...)
		if err != nil {
			return nil, err
		}
		tagMap = tag.MapFromRefList(tags2)
	}

	return s.sealLayer(ctx, m, tagMap)
}

func (s *Sealer) sealLayer(ctx context.Context, m MergedLayer, tagMap tag.Map) (SealedLayer, error) {
	if s == nil || m == nil {
		return nil, nil
	}
	if g, ok := m.(*MergedLayerGroup); ok {
		return s.sealLayerGroup(ctx, g, tagMap)
	}
	if i, ok := m.(*MergedLayerItem); ok {
		return s.sealLayerItem(ctx, i, tagMap)
	}
	return nil, nil
}

func (s *Sealer) sealLayerGroup(ctx context.Context, m *MergedLayerGroup, tagMap tag.Map) (*SealedLayerGroup, error) {
	if s == nil || m == nil {
		return nil, nil
	}

	c, err := s.sealLayerCommon(ctx, &m.MergedLayerCommon, tagMap)
	if err != nil {
		return nil, err
	}
	if c == nil {
		return nil, nil
	}

	children := make([]SealedLayer, 0, len(m.Children))
	for _, c := range m.Children {
		s, err := s.sealLayer(ctx, c, tagMap)
		if err != nil {
			return nil, err
		}
		children = append(children, s)
	}

	return &SealedLayerGroup{
		SealedLayerCommon: *c,
		Children:          children,
	}, nil
}

func (s *Sealer) sealLayerItem(ctx context.Context, m *MergedLayerItem, tagMap tag.Map) (*SealedLayerItem, error) {
	if s == nil || m == nil {
		return nil, nil
	}
	c, err := s.sealLayerCommon(ctx, &m.MergedLayerCommon, tagMap)
	if err != nil {
		return nil, err
	}
	if c == nil {
		return nil, nil
	}
	return &SealedLayerItem{
		SealedLayerCommon: *c,
	}, nil
}

func (s *Sealer) sealLayerCommon(ctx context.Context, m *MergedLayerCommon, tagMap tag.Map) (*SealedLayerCommon, error) {
	if s == nil || m == nil {
		return nil, nil
	}
	p, err := s.sealProperty(ctx, m.Property)
	if err != nil {
		return nil, err
	}
	ib, err := s.sealInfobox(ctx, m.Infobox)
	if err != nil {
		return nil, err
	}
	tags := s.sealTags(m.Merged.Tags, tagMap)
	return &SealedLayerCommon{
		Merged:   m.Merged,
		Property: p,
		Infobox:  ib,
		Tags:     tags,
	}, nil
}

func (s *Sealer) sealInfobox(ctx context.Context, m *MergedInfobox) (*SealedInfobox, error) {
	if s == nil || m == nil {
		return nil, nil
	}
	p, err := s.sealProperty(ctx, m.Property)
	if err != nil {
		return nil, err
	}
	fields := make([]*SealedInfoboxField, 0, len(m.Fields))
	for _, f := range m.Fields {
		s, err := s.sealInfoboxField(ctx, f)
		if err != nil {
			return nil, err
		}
		fields = append(fields, s)
	}
	return &SealedInfobox{
		MergedInfobox: m.MergedInfobox,
		Property:      p,
		Fields:        fields,
	}, nil
}

func (s *Sealer) sealInfoboxField(ctx context.Context, m *MergedInfoboxField) (*SealedInfoboxField, error) {
	if s == nil || m == nil {
		return nil, nil
	}
	p, err := s.sealProperty(ctx, m.Property)
	if err != nil {
		return nil, err
	}
	return &SealedInfoboxField{
		MergedInfoboxField: m.MergedInfoboxField,
		Property:           p,
	}, nil
}

func (s *Sealer) sealProperty(ctx context.Context, m *property.Merged) (*property.Sealed, error) {
	if s == nil {
		return nil, nil
	}
	return property.Seal(ctx, m, s.DatasetGraphLoader)
}

func (s *Sealer) sealTags(m []layer.MergedTag, tagMap tag.Map) []SealedTag {
	if len(m) == 0 {
		return nil
	}
	res := make([]SealedTag, 0, len(m))
	for _, t := range m {
		tt := SealedTag{
			ID:    t.ID,
			Tags:  s.sealTags(t.Tags, tagMap),
			Label: "",
		}
		if ttt, ok := tagMap[t.ID]; ok {
			tt.Label = ttt.Label()
		}
		res = append(res, tt)
	}
	return res
}
