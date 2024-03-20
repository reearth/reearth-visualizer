package nlslayer

type Feature struct {
	id          FeatureID
	featureType string
	geometry    Geometry
	properties  map[string]any
}

func NewFeatureWithNewId(featureType string, geometry Geometry, properties map[string]any) (*Feature, error) {
	return &Feature{
		id:          NewFeatureID(),
		featureType: featureType,
		geometry:    geometry,
		properties:  properties,
	}, nil
}

func NewFeature(id FeatureID, featureType string, geometry Geometry, properties map[string]any) (*Feature, error) {
	return &Feature{
		id:          id,
		featureType: featureType,
		geometry:    geometry,
		properties:  properties,
	}, nil
}

func (f *Feature) ID() FeatureID {
	if f == nil {
		return FeatureID{}
	}
	return f.id
}

func (f *Feature) FeatureType() string {
	if f == nil {
		return ""
	}
	return f.featureType
}

func (f *Feature) Geometry() Geometry {
	if f == nil {
		return nil
	}
	return f.geometry
}

func (f *Feature) Properties() map[string]any {
	return f.properties
}
