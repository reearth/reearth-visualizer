package nlslayer

type SketchInfo struct {
	CustomPropertySchemaField *map[string]any    `msgpack:"CustomPropertySchemaField"`
	FeatureCollectionField    *FeatureCollection `msgpack:"FeatureCollectionField"`
}

func NewSketchInfo(customPropertySchema *map[string]any, featureCollection *FeatureCollection) *SketchInfo {
	return &SketchInfo{
		CustomPropertySchemaField: customPropertySchema,
		FeatureCollectionField:    featureCollection,
	}
}

func (s *SketchInfo) CustomPropertySchema() *map[string]any {
	return s.CustomPropertySchemaField
}

func (s *SketchInfo) FeatureCollection() *FeatureCollection {
	return s.FeatureCollectionField
}

func (s *SketchInfo) SetCustomPropertySchema(schema *map[string]any) {
	s.CustomPropertySchemaField = schema
}

func (s *SketchInfo) Clone() *SketchInfo {
	if s == nil {
		return nil
	}

	return &SketchInfo{
		CustomPropertySchemaField: s.CustomPropertySchemaField,
		FeatureCollectionField:    s.FeatureCollectionField,
	}
}
