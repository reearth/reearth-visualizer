package property

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/stretchr/testify/assert"
)

var (
	testSchemaField1 = NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	testSchemaField2 = NewSchemaField().ID("b").Type(ValueTypeNumber).MustBuild()
	testSchemaField3 = NewSchemaField().ID("c").Type(ValueTypeLatLng).MustBuild()
)

func TestSchemaField_MinMax(t *testing.T) {
	getFloatRef := func(f float64) *float64 {
		return &f
	}

	tests := []struct {
		Name     string
		SF       *SchemaField
		Expected struct {
			Min, Max *float64
		}
	}{
		{
			Name: "get minmax",
			SF:   NewSchemaField().ID("A").Type(ValueTypeNumber).Min(10.0).Max(20.0).MustBuild(),
			Expected: struct {
				Min, Max *float64
			}{
				Min: getFloatRef(10.0),
				Max: getFloatRef(20.0),
			},
		},
		{
			Name: "nil sf",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			min, max := tc.SF.MinMax()
			assert.Equal(t, tc.Expected.Min, min)
			assert.Equal(t, tc.Expected.Max, max)
		})
	}
}

func TestSchemaField_Choice(t *testing.T) {
	tests := []struct {
		Name, Key string
		SF        *SchemaField
		Expected  *SchemaFieldChoice
	}{
		{
			Name: "found",
			Key:  "xxx",
			SF: NewSchemaField().ID("A").Type(ValueTypeNumber).Choices([]SchemaFieldChoice{
				{
					Key:   "xxx",
					Title: i18n.StringFrom("lll"),
					Icon:  "",
				},
				{
					Key:   "zzz",
					Title: i18n.StringFrom("abc"),
					Icon:  "",
				},
			}).MustBuild(),
			Expected: &SchemaFieldChoice{
				Key:   "xxx",
				Title: i18n.StringFrom("lll"),
				Icon:  "",
			},
		},
		{
			Name: "not found",
			Key:  "aaa",
			SF: NewSchemaField().ID("A").Type(ValueTypeNumber).Choices([]SchemaFieldChoice{
				{
					Key:   "xxx",
					Title: i18n.StringFrom("lll"),
					Icon:  "",
				},
				{
					Key:   "zzz",
					Title: i18n.StringFrom("abc"),
					Icon:  "",
				},
			}).MustBuild(),
			Expected: nil,
		},
		{
			Name: "nil sf",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			ch := tc.SF.Choice(tc.Key)
			assert.Equal(t, tc.Expected, ch)
		})
	}
}

func TestSchemaField_SetDescription(t *testing.T) {
	sf := NewSchemaField().ID("A").Type(ValueTypeNumber).Description(i18n.StringFrom("xx")).MustBuild()
	sf.SetDescription(i18n.StringFrom("aa"))
	assert.Equal(t, i18n.StringFrom("aa"), sf.Description())
}

func TestSchemaField_SetTitle(t *testing.T) {
	sf := NewSchemaField().ID("A").Type(ValueTypeNumber).Name(i18n.StringFrom("abc")).MustBuild()
	sf.SetTitle(i18n.StringFrom("bb"))
	assert.Equal(t, i18n.StringFrom("bb"), sf.Title())
}

func TestSchemaField_Validate(t *testing.T) {
	tests := []struct {
		Name     string
		SF       *SchemaField
		Input    *OptionalValue
		Expected bool
	}{
		{
			Name: "nil sf",
		},
		{
			Name:     "nil optional value",
			SF:       NewSchemaField().ID("A").Type(ValueTypeNumber).MustBuild(),
			Input:    nil,
			Expected: false,
		},
		{
			Name:     "nil value",
			SF:       NewSchemaField().ID("A").Type(ValueTypeNumber).MustBuild(),
			Input:    NewOptionalValue(ValueTypeNumber, nil),
			Expected: true,
		},
		{
			Name:     "property type != value type",
			SF:       NewSchemaField().ID("A").Type(ValueTypeNumber).MustBuild(),
			Input:    OptionalValueFrom(ValueTypeBool.ValueFrom(true)),
			Expected: false,
		},
		{
			Name:     "property type != value type with nil value",
			SF:       NewSchemaField().ID("A").Type(ValueTypeNumber).MustBuild(),
			Input:    NewOptionalValue(ValueTypeBool, nil),
			Expected: false,
		},
		{
			Name:     "validate min",
			SF:       NewSchemaField().ID("A").Type(ValueTypeNumber).Min(10).MustBuild(),
			Input:    OptionalValueFrom(ValueTypeNumber.ValueFrom(9)),
			Expected: false,
		},
		{
			Name:     "validate max",
			SF:       NewSchemaField().ID("A").Type(ValueTypeNumber).Max(10).MustBuild(),
			Input:    OptionalValueFrom(ValueTypeNumber.ValueFrom(11)),
			Expected: false,
		},
		{
			Name: "valid string",
			SF: NewSchemaField().ID("a").Type(ValueTypeString).Choices([]SchemaFieldChoice{
				{
					Key:   "xxx",
					Title: i18n.StringFrom("lll"),
					Icon:  "",
				},
				{
					Key:   "zzz",
					Title: i18n.StringFrom("abc"),
					Icon:  "",
				},
			}).MustBuild(),
			Input:    OptionalValueFrom(ValueTypeString.ValueFrom("xxx")),
			Expected: true,
		},
		{
			Name: "invalid string",
			SF: NewSchemaField().ID("a").Type(ValueTypeString).Choices([]SchemaFieldChoice{
				{
					Key:   "xxx",
					Title: i18n.StringFrom("lll"),
					Icon:  "",
				},
				{
					Key:   "zzz",
					Title: i18n.StringFrom("abc"),
					Icon:  "",
				},
			}).MustBuild(),
			Input:    OptionalValueFrom(ValueTypeString.ValueFrom("aaa")),
			Expected: false,
		},
		{
			Name:     "validate other",
			SF:       NewSchemaField().ID("A").Type(ValueTypeLatLng).MustBuild(),
			Input:    OptionalValueFrom(ValueTypeLatLng.ValueFrom(LatLng{Lat: 10, Lng: 11})),
			Expected: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.SF.Validate(tc.Input)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestSchemaFieldChoice_SetLabel(t *testing.T) {
	sfc := &SchemaFieldChoice{
		Key:   "xxx",
		Title: i18n.StringFrom("lll"),
		Icon:  "",
	}
	sfc.SetTitle(i18n.StringFrom("aa"))
	assert.Equal(t, i18n.StringFrom("aa"), sfc.Title)
}

func TestSchemaFieldChoice_Copy(t *testing.T) {
	sfc := SchemaFieldChoice{
		Key:   "xxx",
		Title: i18n.StringFrom("lll"),
		Icon:  "",
	}
	copy := sfc.Copy()
	assert.Equal(t, sfc, copy)
}

func TestSchemaField_Nil(t *testing.T) {
	var sf *SchemaField
	assert.Nil(t, sf.UI())
	assert.Nil(t, sf.DefaultValue())
	assert.Nil(t, sf.IsAvailableIf())
	assert.Nil(t, sf.Max())
	assert.Nil(t, sf.Min())
}
