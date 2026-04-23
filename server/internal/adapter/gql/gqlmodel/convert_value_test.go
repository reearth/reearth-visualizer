package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func Test_FromValueType(t *testing.T) {
	assert.Equal(t, value.TypeString, FromValueType(ValueTypeString))
	assert.Equal(t, value.TypeNumber, FromValueType(ValueTypeNumber))
}

func Test_ToPropertyValueType(t *testing.T) {
	tests := []struct {
		input string
		want  property.ValueType
	}{
		{ValueTypeBool.String(), property.ValueTypeBool},
		{ValueTypeNumber.String(), property.ValueTypeNumber},
		{ValueTypeString.String(), property.ValueTypeString},
		{ValueTypeRef.String(), property.ValueTypeRef},
		{ValueTypeURL.String(), property.ValueTypeURL},
		{ValueTypeLatlng.String(), property.ValueTypeLatLng},
		{ValueTypeLatlngheight.String(), property.ValueTypeLatLngHeight},
		{ValueTypeCoordinates.String(), property.ValueTypeCoordinates},
		{ValueTypePolygon.String(), property.ValueTypePolygon},
		{ValueTypeRect.String(), property.ValueTypeRect},
		{ValueTypeArray.String(), property.ValueTypeArray},
		{ValueTypeCamera.String(), property.ValueTypeCamera},
		{ValueTypeTypography.String(), property.ValueTypeTypography},
		{ValueTypeSpacing.String(), property.ValueTypeSpacing},
		{ValueTypeTimeline.String(), property.ValueTypeTimeline},
		{"UNKNOWN", property.ValueTypeUnknown},
		{"", property.ValueTypeUnknown},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			assert.Equal(t, tt.want, ToPropertyValueType(tt.input))
		})
	}
}
