package id

import (
	"regexp"
	"strings"
)

const schemaSystemIDPrefix = "reearth"

var schemaNameRe = regexp.MustCompile("^[a-zA-Z0-9_-]+$")

// PropertySchemaID is an ID for PropertySchema.
type PropertySchemaID struct {
	plugin PluginID
	id     string
}

// PropertySchemaIDFrom generates a new PropertySchemaID from a string.
func PropertySchemaIDFrom(id string) (PropertySchemaID, error) {
	ids := strings.SplitN(id, "/", 2)
	if len(ids) < 2 || !schemaNameRe.MatchString(ids[len(ids)-1]) {
		return PropertySchemaID{}, ErrInvalidID
	}
	pid, err := PluginIDFrom(ids[0])
	if err != nil {
		return PropertySchemaID{}, ErrInvalidID
	}
	return PropertySchemaID{plugin: pid, id: ids[1]}, nil
}

// PropertySchemaIDFromExtension generates a new PropertySchemaID from a plugin ID and an extension ID.
func PropertySchemaIDFromExtension(p PluginID, e PluginExtensionID) (PropertySchemaID, error) {
	return PropertySchemaID{plugin: p, id: e.String()}, nil
}

// MustPropertySchemaID generates a new PropertySchemaID from a string, but panics if the string cannot be parsed.
func MustPropertySchemaID(id string) PropertySchemaID {
	did, err := PropertySchemaIDFrom(id)
	if err != nil {
		panic(err)
	}
	return did
}

// MustPropertySchemaIDFromExtension generates a new PropertySchemaID from a plugin ID and an extension ID, but panics if the string cannot be parsed.
func MustPropertySchemaIDFromExtension(p PluginID, e PluginExtensionID) PropertySchemaID {
	did, err := PropertySchemaIDFromExtension(p, e)
	if err != nil {
		panic(err)
	}
	return did
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

// ID returns a fragment of just ID.
func (d PropertySchemaID) ID() string {
	return d.id
}

// Plugin returns a fragment of plugin ID.
func (d PropertySchemaID) Plugin() PluginID {
	return d.plugin
}

// System returns if it is system ID
func (d PropertySchemaID) System() bool {
	return d.id == schemaSystemIDPrefix || strings.HasPrefix(d.id, schemaSystemIDPrefix+"/")
}

// String returns a string representation.
func (d PropertySchemaID) String() string {
	return d.plugin.String() + "/" + d.id
}

// Ref returns a reference.
func (d PropertySchemaID) Ref() *PropertySchemaID {
	d2 := d
	return &d2
}

// CopyRef returns a copy of a reference.
func (d *PropertySchemaID) CopyRef() *PropertySchemaID {
	if d == nil {
		return nil
	}
	d2 := *d
	return &d2
}

// IsNil checks if ID is empty or not.
func (d PropertySchemaID) IsNil() bool {
	return d.plugin == PluginID{} && d.id == ""
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
func PropertySchemaIDToKeys(ids []PropertySchemaID) []string {
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
