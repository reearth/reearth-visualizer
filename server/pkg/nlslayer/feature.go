package nlslayer

type Feature struct {
	id          FeatureID
	featureType string
	geometry    Geometry
	properties  *map[string]any
}

func NewFeatureWithNewId(featureType string, geometry Geometry) (*Feature, error) {
	return &Feature{
		id:          NewFeatureID(),
		featureType: featureType,
		geometry:    geometry,
	}, nil
}

func NewFeature(id FeatureID, featureType string, geometry Geometry) (*Feature, error) {
	return &Feature{
		id:          id,
		featureType: featureType,
		geometry:    geometry,
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

func (f *Feature) Properties() *map[string]any {
	return f.properties
}

func (f *Feature) UpdateGeometry(newGeometry Geometry) {
	f.geometry = newGeometry
}

func (f *Feature) UpdateProperties(newProperty *map[string]any) {
	if f == nil || newProperty == nil {
		return
	}

	clonedProperties := make(map[string]any)
	for key, value := range *newProperty {
		clonedProperties[key] = value
	}

	f.properties = &clonedProperties
}
