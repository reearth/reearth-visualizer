package nlslayer

import (
	"encoding/json"
)

type SketchInfo struct {
	customPropertySchema *json.RawMessage
	featureCollection    *FeatureCollection
}

func NewSketchInfo(customPropertySchema *json.RawMessage, featureCollection *FeatureCollection) *SketchInfo {
	return &SketchInfo{
		customPropertySchema: customPropertySchema,
		featureCollection:    featureCollection,
	}
}

func (s *SketchInfo) CustomPropertySchema() *json.RawMessage {
	return s.customPropertySchema
}

func (s *SketchInfo) FeatureCollection() *FeatureCollection {
	return s.featureCollection
}

func (s *SketchInfo) Clone() *SketchInfo {
	if s == nil {
		return nil
	}

	return &SketchInfo{
		customPropertySchema: s.customPropertySchema,
		featureCollection:    s.featureCollection,
	}
}
