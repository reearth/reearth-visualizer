package nlslayer

type Feature struct {
	IDField          FeatureID       `msgpack:"IDField"`
	FeatureTypeField string          `msgpack:"FeatureTypeField"`
	GeometryField    Geometry        `msgpack:"GeometryField"`
	PropertiesField  *map[string]any `msgpack:"PropertiesField"`
}

func NewFeatureWithNewId(featureType string, geometry Geometry) (*Feature, error) {
	return &Feature{
		IDField:          NewFeatureID(),
		FeatureTypeField: featureType,
		GeometryField:    geometry,
	}, nil
}

func NewFeature(id FeatureID, featureType string, geometry Geometry) (*Feature, error) {
	return &Feature{
		IDField:          id,
		FeatureTypeField: featureType,
		GeometryField:    geometry,
	}, nil
}

func (f *Feature) ID() FeatureID {
	if f == nil {
		return FeatureID{}
	}
	return f.IDField
}

func (f *Feature) FeatureType() string {
	if f == nil {
		return ""
	}
	return f.FeatureTypeField
}

func (f *Feature) Geometry() Geometry {
	if f == nil {
		return nil
	}
	return f.GeometryField
}

func (f *Feature) Properties() *map[string]any {
	return f.PropertiesField
}

func (f *Feature) UpdateGeometry(newGeometry Geometry) {
	f.GeometryField = newGeometry
}

func (f *Feature) UpdateProperties(newProperty *map[string]any) {
	if f == nil || newProperty == nil {
		return
	}

	clonedProperties := make(map[string]any)
	for key, value := range *newProperty {
		clonedProperties[key] = value
	}

	f.PropertiesField = &clonedProperties
}
