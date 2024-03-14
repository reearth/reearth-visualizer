package nlslayer

import (
	"encoding/json"
)

type Feature struct {
	id          FeatureID
	featureType string
	properties  json.RawMessage
	geometry    Geometry
}

func NewFeature(id FeatureID, featureType string, properties json.RawMessage, geometry Geometry) *Feature {
	return &Feature{
		id:          id,
		featureType: featureType,
		properties:  properties,
		geometry:    geometry,
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

func (f *Feature) Properties() json.RawMessage {
	return f.properties
}

func (f *Feature) Geometry() Geometry {
	if f == nil {
		return nil
	}
	return f.geometry
}
