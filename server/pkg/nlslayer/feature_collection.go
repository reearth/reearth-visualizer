package nlslayer

import (
	"errors"
)

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

func (fc *FeatureCollection) FeatureCollectionType() string {
	return fc.featureCollectionType
}

func (fc *FeatureCollection) Features() []Feature {
	if fc == nil {
		return nil
	}
	return append([]Feature{}, fc.features...)
}

func (fc *FeatureCollection) AddFeature(feature Feature) {
	if fc == nil {
		return
	}
	fc.features = append(fc.features, feature)
}

func (fc *FeatureCollection) UpdateFeature(id FeatureID, geometry Geometry, properties map[string]any) (Feature, error) {
	for i, f := range fc.features {
		if f.ID() == id {
			updatedFeature, err := NewFeature(id, f.FeatureType(), geometry)
			if err != nil {
				return Feature{}, err
			}
			updatedFeature.UpdateProperties(&properties)
			fc.features[i] = *updatedFeature
			return *updatedFeature, nil
		}
	}
	return Feature{}, errors.New("feature not found")
}

func (fc *FeatureCollection) UpdateFeatureGeometry(id FeatureID, geometry Geometry) (Feature, error) {
	for i, f := range fc.features {
		if f.ID() == id {
			f.UpdateGeometry(geometry)
			fc.features[i] = f
			return f, nil
		}
	}
	return Feature{}, errors.New("feature not found")
}

func (fc *FeatureCollection) UpdateFeatureProperty(id FeatureID, properties map[string]any) (Feature, error) {
	for i, f := range fc.features {
		if f.ID() == id {
			f.UpdateProperties(&properties)
			fc.features[i] = f
			return f, nil
		}
	}
	return Feature{}, errors.New("feature not found")
}

func (fc *FeatureCollection) RemoveFeature(id FeatureID) error {
	if fc == nil {
		return errors.New("feature collection is nil")
	}

	for i, feature := range fc.features {
		if feature.ID() == id {
			fc.features = append(fc.features[:i], fc.features[i+1:]...)
			return nil
		}
	}

	return errors.New("feature not found")
}
