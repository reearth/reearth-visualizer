package property

import (
	"errors"
	"testing"

	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/stretchr/testify/assert"
)

func TestSchemaFieldBuilder_Build(t *testing.T) {
	tests := []struct {
		Name         string
		Id           FieldID
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
			Id           FieldID
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
			Err:  ErrInvalidID,
		},
		{
			Name: "fail min > max",
			Id:   FieldID("aa"),
			Min:  10,
			Max:  1,
			Err:  errors.New("invalid min and max"),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res, err := NewSchemaField().
				ID(tt.Id).Name(tt.Fname).
				IsAvailableIf(tt.Cond).
				Type(tt.PropertyType).
				Description(tt.Description).
				Choices(tt.Choices).
				Prefix(tt.Prefix).
				Suffix(tt.Suffix).
				DefaultValue(tt.DefaultValue).
				MaxRef(tt.MaxRef).
				MinRef(tt.MinRef).
				Min(tt.Min).
				Max(tt.Max).
				UI(tt.Ui).
				UIRef(&tt.Ui).
				Build()

			if tt.Err == nil {
				assert.Equal(t, tt.Expected.Ui, res.UI())
				assert.Equal(t, tt.Expected.Id, res.ID())
				assert.Equal(t, tt.Expected.Min, res.Min())
				assert.Equal(t, tt.Expected.Max, res.Max())
				assert.Equal(t, tt.Expected.DefaultValue, res.DefaultValue())
				assert.Equal(t, tt.Expected.Description, res.Description())
				assert.Equal(t, tt.Expected.Prefix, res.Prefix())
				assert.Equal(t, tt.Expected.Suffix, res.Suffix())
				assert.Equal(t, tt.Expected.Choices, res.Choices())
				assert.Equal(t, tt.Expected.Cond, res.IsAvailableIf())
				assert.Equal(t, tt.Expected.Fname, res.Title())
				assert.Equal(t, tt.Expected.PropertyType, res.Type())
			} else {
				assert.Equal(t, tt.Err, err)
			}
		})
	}
}
