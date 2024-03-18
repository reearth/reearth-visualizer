package nlslayer

type FeatureCollection struct {
	featureCollectionType string
	features              []Feature
}

func NewFeatureCollection(featureCollectionType string, features []Feature) *FeatureCollection {
	return &FeatureCollection{
		featureCollectionType: featureCollectionType,
		features:              features,
	}
}

func (f *FeatureCollection) FeatureCollectionType() string {
	return f.featureCollectionType
}

func (f *FeatureCollection) Features() []Feature {
	if f == nil {
		return nil
	}
	return append([]Feature{}, f.features...)
}

func (f *FeatureCollection) AddFeature(feature Feature) {
	if f == nil {
		return
	}
	f.features = append(f.features, feature)
}
