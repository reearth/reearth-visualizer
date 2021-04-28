package merging

import (
	"context"

	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/property"
)

type Sealer struct {
	DatasetGraphLoader dataset.GraphLoader
}

func (s *Sealer) Seal(ctx context.Context, m MergedLayer) (SealedLayer, error) {
	if s == nil || m == nil {
		return nil, nil
	}
	return s.sealLayer(ctx, m)
}

func (s *Sealer) sealLayer(ctx context.Context, m MergedLayer) (SealedLayer, error) {
	if s == nil || m == nil {
		return nil, nil
	}
	if g, ok := m.(*MergedLayerGroup); ok {
		return s.sealLayerGroup(ctx, g)
	}
	if i, ok := m.(*MergedLayerItem); ok {
		return s.sealLayerItem(ctx, i)
	}
	return nil, nil
}

func (s *Sealer) sealLayerGroup(ctx context.Context, m *MergedLayerGroup) (*SealedLayerGroup, error) {
	if s == nil || m == nil {
		return nil, nil
	}

	c, err := s.sealLayerCommon(ctx, &m.MergedLayerCommon)
	if err != nil {
		return nil, err
	}
	if c == nil {
		return nil, nil
	}

	children := make([]SealedLayer, 0, len(m.Children))
	for _, c := range m.Children {
		s, err := s.sealLayer(ctx, c)
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

func (s *Sealer) sealLayerItem(ctx context.Context, m *MergedLayerItem) (*SealedLayerItem, error) {
	if s == nil || m == nil {
		return nil, nil
	}
	c, err := s.sealLayerCommon(ctx, &m.MergedLayerCommon)
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

func (s *Sealer) sealLayerCommon(ctx context.Context, m *MergedLayerCommon) (*SealedLayerCommon, error) {
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
	return &SealedLayerCommon{
		Merged:   m.Merged,
		Property: p,
		Infobox:  ib,
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
