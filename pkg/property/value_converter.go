package property

import "github.com/reearth/reearth-backend/pkg/dataset"

func valueFromDataset(v *dataset.Value) (*Value, bool) {
	v2 := v.Value()
	switch v3 := v2.(type) {
	case *dataset.LatLng:
		return ValueTypeLatLng.ValueFrom(LatLng{
			Lat: v3.Lat,
			Lng: v3.Lng,
		})
	case *dataset.LatLngHeight:
		return ValueTypeLatLngHeight.ValueFrom(LatLngHeight{
			Lat:    v3.Lat,
			Lng:    v3.Lng,
			Height: v3.Height,
		})
	}
	return valueTypeFromDataset(v.Type()).ValueFrom(v2)
}

func valueTypeFromDataset(v dataset.ValueType) ValueType {
	switch v {
	case dataset.ValueTypeBool:
		return ValueTypeBool
	case dataset.ValueTypeLatLng:
		return ValueTypeLatLng
	case dataset.ValueTypeLatLngHeight:
		return ValueTypeLatLngHeight
	case dataset.ValueTypeNumber:
		return ValueTypeNumber
	case dataset.ValueTypeRef:
		return ValueTypeRef
	case dataset.ValueTypeString:
		return ValueTypeString
	case dataset.ValueTypeURL:
		return ValueTypeURL
	}
	return ValueType("")
}
