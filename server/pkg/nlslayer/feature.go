package nlslayer

import (
	"encoding/json"
)

type Feature struct {
	id          FeatureID
	featureType string
	geometry    Geometry
	properties  json.RawMessage
}

func NewFeature(featureType string, geometry Geometry, properties json.RawMessage) *Feature {
	return &Feature{
		id:          NewFeatureID(),
		featureType: featureType,
		geometry:    geometry,
		properties:  properties,
	}
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

func (f *Feature) Properties() json.RawMessage {
	return f.properties
}
