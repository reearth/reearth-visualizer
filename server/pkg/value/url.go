package value

import "net/url"

var TypeURL Type = "url"

type propertyURL struct{}

func (p *propertyURL) I2V(i interface{}) (interface{}, bool) {
	if v, ok := i.(url.URL); ok {
		return &v, true
	}

	if v, ok := i.(*url.URL); ok && v != nil {
		return p.I2V(*v) // clone URL
	}

	if v, ok := i.(string); ok {
		if u, err := url.Parse(v); err == nil {
			return u, true
		}
	}

	if v, ok := i.(*string); ok && v != nil {
		return p.I2V(*v)
	}

	return nil, false
}

func (*propertyURL) V2I(v interface{}) (interface{}, bool) {
	u, ok := v.(*url.URL)
	if !ok {
		return nil, false
	}
	if u == nil {
		return "", true
	}
	return u.String(), true
}

func (*propertyURL) Validate(i interface{}) bool {
	_, ok := i.(*url.URL)
	return ok
}

func (p *propertyURL) String(i any) string {
	if !p.Validate(i) {
		return ""
	}
	return i.(*url.URL).String()
}

func (v *propertyURL) JSONSchema() map[string]any {
	return map[string]any{
		"type":   "string",
		"title":  "URL",
		"format": "uri",
	}
}

func (v *Value) ValueURL() (vv *url.URL, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(*url.URL)
	return
}
