package property

import (
	"github.com/mitchellh/mapstructure"
)

var ValueTypeTypography = ValueType("typography")

type Typography struct {
	FontFamily *string    `json:"fontFamily" mapstructure:"fontFamily"`
	FontWeight *string    `json:"fontWeight" mapstructure:"fontWeight"`
	FontSize   *int       `json:"fontSize" mapstructure:"fontSize"`
	Color      *string    `json:"color" mapstructure:"color"`
	TextAlign  *TextAlign `json:"textAlign" mapstructure:"textAlign"`
	Bold       *bool      `json:"bold" mapstructure:"bold"`
	Italic     *bool      `json:"italic" mapstructure:"italic"`
	Underline  *bool      `json:"underline" mapstructure:"underline"`
}

func (t *Typography) Clone() *Typography {
	if t == nil {
		return nil
	}
	return &Typography{
		FontFamily: t.FontFamily,
		FontWeight: t.FontWeight,
		FontSize:   t.FontSize,
		Color:      t.Color,
		TextAlign:  t.TextAlign,
		Bold:       t.Bold,
		Italic:     t.Italic,
		Underline:  t.Underline,
	}
}

type TextAlign string

const (
	TextAlignLeft       TextAlign = "left"
	TextAlignCenter     TextAlign = "center"
	TextAlignRight      TextAlign = "right"
	TextAlignJustify    TextAlign = "justify"
	TextAlignJustifyAll TextAlign = "justify_all"
)

func TextAlignFrom(t string) (TextAlign, bool) {
	switch TextAlign(t) {
	case TextAlignLeft:
		return TextAlignLeft, true
	case TextAlignCenter:
		return TextAlignCenter, true
	case TextAlignRight:
		return TextAlignRight, true
	case TextAlignJustify:
		return TextAlignJustify, true
	case TextAlignJustifyAll:
		return TextAlignJustifyAll, true
	}
	return TextAlign(""), false
}

func TextAlignFromRef(t *string) *TextAlign {
	if t == nil {
		return nil
	}
	var t2 TextAlign
	switch TextAlign(*t) {
	case TextAlignLeft:
		t2 = TextAlignLeft
	case TextAlignCenter:
		t2 = TextAlignCenter
	case TextAlignRight:
		t2 = TextAlignRight
	case TextAlignJustify:
		t2 = TextAlignJustify
	case TextAlignJustifyAll:
		t2 = TextAlignJustifyAll
	default:
		return nil
	}
	return &t2
}

func (t TextAlign) String() string {
	return string(t)
}

func (t *TextAlign) StringRef() *string {
	if t == nil {
		return nil
	}
	t2 := string(*t)
	return &t2
}

type typePropertyTypography struct{}

func (*typePropertyTypography) I2V(i interface{}) (interface{}, bool) {
	if v, ok := i.(Typography); ok {
		return v, true
	}

	if v, ok := i.(*Typography); ok {
		if v != nil {
			return *v, true
		}
		return nil, false
	}

	v := Typography{}
	if err := mapstructure.Decode(i, &v); err == nil {
		return v, true
	}

	return nil, false
}

func (*typePropertyTypography) V2I(v interface{}) (interface{}, bool) {
	return v, true
}

func (*typePropertyTypography) Validate(i interface{}) bool {
	_, ok := i.(Typography)
	return ok
}

func (p *typePropertyTypography) String(i interface{}) string {
	if !p.Validate(i) {
		return ""
	}
	return ""
	// Should be implemented if needed
	// return i.(Typography).String()
}

func (v *typePropertyTypography) JSONSchema() map[string]any {
	return map[string]any{
		"type":  "object",
		"title": "Typography",
		"properties": map[string]any{
			"fontFamily": map[string]any{
				"type": "string",
			},
			"fontWeight": map[string]any{
				"type": "string",
			},
			"fontSize": map[string]any{
				"type": "integer",
			},
			"color": map[string]any{
				"type": "string",
			},
			"textAlign": map[string]any{
				"type": "string",
				"enum": []string{
					"left",
					"center",
					"right",
					"justify",
					"justify_all",
				},
			},
			"bold": map[string]any{
				"type": "boolean",
			},
			"italic": map[string]any{
				"type": "boolean",
			},
			"underline": map[string]any{
				"type": "boolean",
			},
		},
	}
}

func (v *Value) ValueTypography() (vv Typography, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.Value().(Typography)
	return
}
