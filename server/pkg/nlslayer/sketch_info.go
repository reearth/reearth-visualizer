package nlslayer

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

func (s *SketchInfo) SetCustomPropertySchema(schema *map[string]any) {
	s.customPropertySchema = schema
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
