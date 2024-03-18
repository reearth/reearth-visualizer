package nlslayer

import (
	"encoding/json"
)

type SketchInfo struct {
	customPropertySchema *map[string]any
	featureCollection    *FeatureCollection
}

func NewSketchInfo(customPropertySchema *map[string]any, featureCollection *FeatureCollection) *SketchInfo {
	return &SketchInfo{
		customPropertySchema: customPropertySchema,
		featureCollection:    featureCollection,
	}
}

func (s *SketchInfo) CustomPropertySchema() *map[string]any {
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

func UnmarshalcustomPropertySchema(customPropertySchema *json.RawMessage) (*map[string]any, error) {
	var schemaPtr *map[string]any
	if customPropertySchema != nil && len(*customPropertySchema) > 0 {
		schema := make(map[string]any)
		if err := json.Unmarshal(*customPropertySchema, &schema); err != nil {
			return nil, err
		}
		schemaPtr = &schema
	}

	return schemaPtr, nil
}
