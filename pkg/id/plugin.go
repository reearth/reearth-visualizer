package id

import (
	"regexp"
	"strings"

	"github.com/blang/semver"
)

// MUST NOT CHANGE
const officialPluginIDStr = "reearth"

// OfficialPluginID _
var OfficialPluginID = PluginID{name: officialPluginIDStr, sys: true}

// PluginID is an ID for Plugin.
type PluginID struct {
	name    string
	version string
	sys     bool
}

var pluginNameRe = regexp.MustCompile("^[a-zA-Z0-9._-]+$")

func validatePluginName(s string) bool {
	if len(s) == 0 || len(s) > 100 || s == "reearth" || strings.Contains(s, "/") {
		return false
	}
	return pluginNameRe.MatchString(s)
}

// PluginIDFrom generates a new id.PluginID from a string.
func PluginIDFrom(id string) (PluginID, error) {
	if id == officialPluginIDStr {
		// official plugin
		return PluginID{name: id, sys: true}, nil
	}

	ids := strings.Split(id, "#")
	if len(ids) != 2 || !validatePluginName(ids[0]) {
		return PluginID{}, ErrInvalidID
	}
	v, err2 := semver.Parse(ids[1])
	if err2 != nil {
		return PluginID{}, ErrInvalidID
	}
	return PluginID{name: ids[0], version: v.String()}, nil
}

// MustPluginID generates a new id.PluginID from a string, but panics if the string cannot be parsed.
func MustPluginID(id string) PluginID {
	did, err := PluginIDFrom(id)
	if err != nil {
		panic(err)
	}
	return did
}

// PluginIDFromRef generates a new id.PluginID from a string ref.
func PluginIDFromRef(id *string) *PluginID {
	if id == nil {
		return nil
	}
	did, err := PluginIDFrom(*id)
	if err != nil {
		return nil
	}
	return &did
}

// Name returns a name.
func (d PluginID) Name() string {
	return d.name
}

// Version returns a version.
func (d PluginID) Version() semver.Version {
	if d.version == "" {
		return semver.Version{}
	}
	v, err := semver.Parse(d.version)
	if err != nil {
		return semver.Version{}
	}
	return v
}

// System returns if the ID is built-in.
func (d PluginID) System() bool {
	return d.sys
}

// Validate returns true if id is valid.
func (d PluginID) Validate() bool {
	if d.sys {
		return true
	}
	return validatePluginName(d.name)
}

// String returns a string representation.
func (d PluginID) String() string {
	if d.sys {
		return d.name
	}
	return d.name + "#" + d.version
}

// Ref returns a reference.
func (d PluginID) Ref() *PluginID {
	d2 := d
	return &d2
}

// CopyRef _
func (d *PluginID) CopyRef() *PluginID {
	if d == nil {
		return nil
	}
	d2 := *d
	return &d2
}

// StringRef returns a reference of a string representation.
func (d *PluginID) StringRef() *string {
	if d == nil {
		return nil
	}
	id := (*d).String()
	return &id
}

// Equal returns if two IDs are quivarent.
func (d PluginID) Equal(d2 PluginID) bool {
	return d.name == d2.name && d.version == d2.version
}

// MarshalText implements encoding.TextMarshaler interface
func (d *PluginID) MarshalText() ([]byte, error) {
	return []byte(d.String()), nil
}

// UnmarshalText implements encoding.TextUnmarshaler interface
func (d *PluginID) UnmarshalText(text []byte) (err error) {
	*d, err = PluginIDFrom(string(text))
	return
}

// PluginIDToKeys converts IDs into a string slice.
func PluginIDToKeys(ids []PluginID) []string {
	keys := make([]string, 0, len(ids))
	for _, id := range ids {
		keys = append(keys, id.String())
	}
	return keys
}

// PluginIDsFrom converts a string slice into a ID slice.
func PluginIDsFrom(ids []string) ([]PluginID, error) {
	dids := make([]PluginID, 0, len(ids))
	for _, id := range ids {
		did, err := PluginIDFrom(id)
		if err != nil {
			return nil, err
		}
		dids = append(dids, did)
	}
	return dids, nil
}
