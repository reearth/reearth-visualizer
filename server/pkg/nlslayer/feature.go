package nlslayer

import "encoding/json"

type Feature struct {
	id          FeatureID
	featureType string
	geometry    Geometry
	properties  map[string]any
}

func NewFeature(featureType string, geometry Geometry, properties map[string]any) (*Feature, error) {
	return &Feature{
		id:          NewFeatureID(),
		featureType: featureType,
		geometry:    geometry,
		properties:  properties,
	}, nil
}

func NewFeatureForRepository(id FeatureID, featureType string, geometry Geometry, properties map[string]any) (*Feature, error) {
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

func UnmarshalProperties(properties json.RawMessage) (map[string]any, error) {
	var props map[string]any
	if len(properties) > 0 {
		if err := json.Unmarshal(properties, &props); err != nil {
			return nil, err
		}
	}
	return props, nil
}
