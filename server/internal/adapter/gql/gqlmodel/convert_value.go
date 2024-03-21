package gqlmodel

import (
	"net/url"
	"strings"

	"github.com/reearth/reearth/server/pkg/value"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func valueInterfaceToGqlValue(v interface{}) interface{} {
	if v == nil {
		return nil
	}
	switch v2 := v.(type) {
	case bool:
		return v2
	case int:
		return v2
	case int32:
		return v2
	case int64:
		return v2
	case float32:
		return v2
	case float64:
		return v2
	case string:
		return v2
	case *url.URL:
		return v2.String()
	case primitive.M:
		return v2
	case value.LatLng:
		return LatLng{
			Lat: v2.Lat,
			Lng: v2.Lng,
		}
	case value.LatLngHeight:
		return LatLngHeight{
			Lat:    v2.Lat,
			Lng:    v2.Lng,
			Height: v2.Height,
		}
	case *value.LatLng:
		return LatLng{
			Lat: v2.Lat,
			Lng: v2.Lng,
		}
	case *value.LatLngHeight:
		return LatLngHeight{
			Lat:    v2.Lat,
			Lng:    v2.Lng,
			Height: v2.Height,
		}
	case []value.LatLngHeight:
		res := make([]LatLngHeight, 0, len(v2))
		for _, c := range v2 {
			res = append(res, LatLngHeight{
				Lat:    c.Lat,
				Lng:    c.Lng,
				Height: c.Height,
			})
		}
		return res
	case [][]value.LatLngHeight:
		res := make([][]LatLngHeight, 0, len(v2))
		for _, d := range v2 {
			coord := make([]LatLngHeight, 0, len(d))
			for _, c := range d {
				coord = append(coord, LatLngHeight{
					Lat:    c.Lat,
					Lng:    c.Lng,
					Height: c.Height,
				})
			}
			res = append(res, coord)
		}
		return res
	case *value.Rect:
		return Rect{
			West:  v2.West,
			East:  v2.East,
			North: v2.North,
			South: v2.South,
		}
	case []interface{}:
		gqlArray := make([]any, len(v2))
		for i, item := range v2 {
			gqlArray[i] = valueInterfaceToGqlValue(item)
		}
		return gqlArray
	}
	return nil
}

func gqlValueToValueInterface(v interface{}) interface{} {
	if v == nil {
		return nil
	}
	switch v2 := v.(type) {
	case LatLng:
		return value.LatLng{
			Lat: v2.Lat,
			Lng: v2.Lng,
		}
	case *LatLng:
		if v2 == nil {
			return nil
		}
		return value.LatLng{
			Lat: v2.Lat,
			Lng: v2.Lng,
		}
	case LatLngHeight:
		return value.LatLngHeight{
			Lat:    v2.Lat,
			Lng:    v2.Lng,
			Height: v2.Height,
		}
	case *LatLngHeight:
		if v2 == nil {
			return nil
		}
		return value.LatLngHeight{
			Lat:    v2.Lat,
			Lng:    v2.Lng,
			Height: v2.Height,
		}
	case []LatLngHeight:
		res := make([]value.LatLngHeight, 0, len(v2))
		for _, c := range v2 {
			res = append(res, value.LatLngHeight{
				Lat:    c.Lat,
				Lng:    c.Lng,
				Height: c.Height,
			})
		}
		return value.Coordinates(res)
	case []*LatLngHeight:
		res := make([]value.LatLngHeight, 0, len(v2))
		for _, c := range v2 {
			if c == nil {
				continue
			}
			res = append(res, value.LatLngHeight{
				Lat:    c.Lat,
				Lng:    c.Lng,
				Height: c.Height,
			})
		}
		return value.Coordinates(res)
	case [][]LatLngHeight:
		res := make([]value.Coordinates, 0, len(v2))
		for _, d := range v2 {
			coord := make([]value.LatLngHeight, 0, len(d))
			for _, c := range d {
				coord = append(coord, value.LatLngHeight{
					Lat:    c.Lat,
					Lng:    c.Lng,
					Height: c.Height,
				})
			}
			res = append(res, coord)
		}
		return value.Polygon(res)
	case [][]*LatLngHeight:
		res := make([]value.Coordinates, 0, len(v2))
		for _, d := range v2 {
			coord := make([]value.LatLngHeight, 0, len(d))
			for _, c := range d {
				if c == nil {
					continue
				}
				coord = append(coord, value.LatLngHeight{
					Lat:    c.Lat,
					Lng:    c.Lng,
					Height: c.Height,
				})
			}
			res = append(res, coord)
		}
		return value.Polygon(res)
	case Rect:
		return value.Rect{
			West:  v2.West,
			East:  v2.East,
			North: v2.North,
			South: v2.South,
		}
	case *Rect:
		return value.Rect{
			West:  v2.West,
			East:  v2.East,
			North: v2.North,
			South: v2.South,
		}
	}
	return v
}

func ToValueType(t value.Type) ValueType {
	return ValueType(strings.ToUpper(string(t)))
}

func FromValueType(t ValueType) value.Type {
	return value.Type(strings.ToLower(string(t)))
}
