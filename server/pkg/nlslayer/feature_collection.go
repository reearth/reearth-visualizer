package nlslayer

import (
	"errors"
)

type FeatureCollection struct {
	FeatureCollectionTypeField string    `msgpack:"FeatureCollectionTypeField"`
	FeaturesField              []Feature `msgpack:"FeaturesField"`
}

func NewFeatureCollection(featureCollectionType string, features []Feature) *FeatureCollection {
	return &FeatureCollection{
		FeatureCollectionTypeField: featureCollectionType,
		FeaturesField:              features,
	}
}

func (fc *FeatureCollection) FeatureCollectionType() string {
	return fc.FeatureCollectionTypeField
}

func (fc *FeatureCollection) Features() []Feature {
	if fc == nil {
		return nil
	}
	return append([]Feature{}, fc.FeaturesField...)
}

func (fc *FeatureCollection) AddFeature(feature Feature) {
	if fc == nil {
		return
	}
	fc.FeaturesField = append(fc.FeaturesField, feature)
}

func (fc *FeatureCollection) UpdateFeature(id FeatureID, geometry Geometry, properties map[string]any) (Feature, error) {
	for i, f := range fc.FeaturesField {
		if f.ID() == id {
			updatedFeature, err := NewFeature(id, f.FeatureType(), geometry)
			if err != nil {
				return Feature{}, err
			}
			updatedFeature.UpdateProperties(&properties)
			fc.FeaturesField[i] = *updatedFeature
			return *updatedFeature, nil
		}
	}
	return Feature{}, errors.New("feature not found")
}

func (fc *FeatureCollection) UpdateFeatureGeometry(id FeatureID, geometry Geometry) (Feature, error) {
	for i, f := range fc.FeaturesField {
		if f.ID() == id {
			f.UpdateGeometry(geometry)
			fc.FeaturesField[i] = f
			return f, nil
		}
	}
	return Feature{}, errors.New("feature not found")
}

func (fc *FeatureCollection) UpdateFeatureProperty(id FeatureID, properties map[string]any) (Feature, error) {
	for i, f := range fc.FeaturesField {
		if f.ID() == id {
			f.UpdateProperties(&properties)
			fc.FeaturesField[i] = f
			return f, nil
		}
	}
	return Feature{}, errors.New("feature not found")
}

func (fc *FeatureCollection) RemoveFeature(id FeatureID) error {
	if fc == nil {
		return errors.New("feature collection is nil")
	}

	for i, feature := range fc.FeaturesField {
		if feature.ID() == id {
			fc.FeaturesField = append(fc.FeaturesField[:i], fc.FeaturesField[i+1:]...)
			return nil
		}
	}

	return errors.New("feature not found")
}
