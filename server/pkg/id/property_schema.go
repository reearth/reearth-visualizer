package id

import (
	"regexp"
	"strings"
)

var propertySchemaIDRe = regexp.MustCompile("^[a-zA-Z0-9][a-zA-Z0-9_-]*$|^@$")

type PropertySchemaID struct {
	plugin PluginID
	id     string
}

// NewPropertySchemaID generates a new PropertySchemaID from a plugin ID and name.
func NewPropertySchemaID(p PluginID, name string) PropertySchemaID {
	if p.IsNil() || !propertySchemaIDRe.MatchString(name) {
		return PropertySchemaID{}
	}
	return PropertySchemaID{plugin: p.Clone(), id: name}
}

// PropertySchemaIDFrom generates a new PropertySchemaID from a string.
func PropertySchemaIDFrom(id string) (PropertySchemaID, error) {
	ids := strings.SplitN(id, "/", 2)
	if len(ids) < 2 || !propertySchemaIDRe.MatchString(ids[len(ids)-1]) {
		return PropertySchemaID{}, ErrInvalidID
	}
	pid, err := PluginIDFrom(ids[0])
	if err != nil {
		return PropertySchemaID{}, ErrInvalidID
	}
	return PropertySchemaID{plugin: pid, id: ids[1]}, nil
}

// PropertySchemaIDFromRef generates a new PropertySchemaID from a string ref.
func PropertySchemaIDFromRef(id *string) *PropertySchemaID {
	if id == nil {
		return nil
	}
	did, err := PropertySchemaIDFrom(*id)
	if err != nil {
		return nil
	}
	return &did
}

// MustPropertySchemaID generates a new PropertySchemaID from a string, but panics if the string cannot be parsed.
func MustPropertySchemaID(id string) PropertySchemaID {
	did, err := PropertySchemaIDFrom(id)
	if err != nil {
		panic(err)
	}
	return did
}

// Clone duplicates the PropertySchemaID
func (d PropertySchemaID) Clone() PropertySchemaID {
	return PropertySchemaID{
		plugin: d.plugin.Clone(),
		id:     d.id,
	}
}

// WithPlugin duplicates the PropertySchemaID but its plugin ID is changed
func (d PropertySchemaID) WithPlugin(plugin PluginID) PropertySchemaID {
	return PropertySchemaID{
		plugin: plugin.Clone(),
		id:     d.id,
	}
}

// ID returns a fragment of just ID.
func (d PropertySchemaID) ID() string {
	return d.id
}

// Plugin returns a fragment of plugin ID.
func (d PropertySchemaID) Plugin() PluginID {
	return d.plugin
}

// String returns a string representation.
func (d PropertySchemaID) String() string {
	if d.IsNil() {
		return ""
	}
	return d.plugin.String() + "/" + d.id
}

// Ref returns a reference.
func (d PropertySchemaID) Ref() *PropertySchemaID {
	if d.IsNil() {
		return nil
	}
	d2 := d
	return &d2
}

// CopyRef returns a copy of a reference.
func (d *PropertySchemaID) CopyRef() *PropertySchemaID {
	if d == nil || d.IsNil() {
		return nil
	}
	d2 := *d
	return &d2
}

// IsNil checks if ID is empty or not.
func (d PropertySchemaID) IsNil() bool {
	return d.plugin.IsNil() && d.id == ""
}

// Equal returns true if two IDs are equal.
func (d PropertySchemaID) Equal(d2 PropertySchemaID) bool {
	return d.plugin.Equal(d2.plugin) && d.id == d2.id
}

// StringRef returns a reference of a string representation.
func (d *PropertySchemaID) StringRef() *string {
	if d == nil {
		return nil
	}
	id := d.String()
	return &id
}

// MarshalText implements encoding.TextMarshaler interface
func (d *PropertySchemaID) MarshalText() ([]byte, error) {
	return []byte(d.String()), nil
}

// UnmarshalText implements encoding.TextUnmarshaler interface
func (d *PropertySchemaID) UnmarshalText(text []byte) (err error) {
	*d, err = PropertySchemaIDFrom(string(text))
	return
}

// PropertySchemaIDToKeys converts IDs into a string slice.
func PropertySchemaIDsToStrings(ids []PropertySchemaID) []string {
	keys := make([]string, 0, len(ids))
	for _, id := range ids {
		keys = append(keys, id.String())
	}
	return keys
}

// PropertySchemaIDsFrom converts a string slice into a ID slice.
func PropertySchemaIDsFrom(ids []string) ([]PropertySchemaID, error) {
	dids := make([]PropertySchemaID, 0, len(ids))
	for _, id := range ids {
		did, err := PropertySchemaIDFrom(id)
		if err != nil {
			return nil, err
		}
		dids = append(dids, did)
	}
	return dids, nil
}
