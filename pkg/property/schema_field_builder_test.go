package property

import (
	"errors"
	"testing"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestSchemaFieldBuilder_Build(t *testing.T) {
	testCases := []struct {
		Name         string
		Id           id.PropertySchemaFieldID
		PropertyType ValueType
		Fname        i18n.String
		Description  i18n.String
		Prefix       string
		Suffix       string
		DefaultValue *Value
		Ui           SchemaFieldUI
		Min          float64
		MinRef       *float64
		Max          float64
		MaxRef       *float64
		Choices      []SchemaFieldChoice
		Cond         *Condition
		Expected     struct {
			Id           id.PropertySchemaFieldID
			PropertyType ValueType
			Fname        i18n.String
			Description  i18n.String
			Prefix       string
			Suffix       string
			DefaultValue *Value
			Ui           SchemaFieldUI
			Min          *float64
			Max          *float64
			Choices      []SchemaFieldChoice
			Cond         *Condition
		}
		Err error
	}{
		{
			Name: "nil field",
			Err:  id.ErrInvalidID,
		},
		{
			Name: "fail min > max",
			Id:   id.PropertySchemaFieldID("aa"),
			Min:  10,
			Max:  1,
			Err:  errors.New("invalid min and max"),
		},
	}
	for _, tc := range testCases {
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res, err := NewSchemaField().
				ID(tc.Id).Name(tc.Fname).
				IsAvailableIf(tc.Cond).
				Type(tc.PropertyType).
				Description(tc.Description).
				Choices(tc.Choices).
				Prefix(tc.Prefix).
				Suffix(tc.Suffix).
				DefaultValue(tc.DefaultValue).
				MaxRef(tc.MaxRef).
				MinRef(tc.MinRef).
				Min(tc.Min).
				Max(tc.Max).
				UI(tc.Ui).
				UIRef(&tc.Ui).
				Build()
			if err == nil {
				assert.Equal(tt, tc.Expected.Ui, res.UI())
				assert.Equal(tt, tc.Expected.Id, res.ID())
				assert.Equal(tt, tc.Expected.Min, res.Min())
				assert.Equal(tt, tc.Expected.Max, res.Max())
				assert.Equal(tt, tc.Expected.DefaultValue, res.DefaultValue())
				assert.Equal(tt, tc.Expected.Description, res.Description())
				assert.Equal(tt, tc.Expected.Prefix, res.Prefix())
				assert.Equal(tt, tc.Expected.Suffix, res.Suffix())
				assert.Equal(tt, tc.Expected.Choices, res.Choices())
				assert.Equal(tt, tc.Expected.Cond, res.IsAvailableIf())
				assert.Equal(tt, tc.Expected.Fname, res.Title())
				assert.Equal(tt, tc.Expected.PropertyType, res.Type())
			} else {
				assert.True(tt, errors.As(tc.Err, &err))
			}
		})
	}
}
