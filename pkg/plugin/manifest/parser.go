package manifest

//go:generate go run github.com/idubinskiy/schematyper -o schema_gen.go --package manifest ../../../plugin_manifest_schema.json
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/embed -o schema_json_gen.go -n SchemaJSON -i ../../../plugin_manifest_schema.json

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"

	"github.com/xeipuuv/gojsonschema"
)

var (
	ErrInvalidManifest       error = errors.New("invalid manifest")
	ErrFailedToParseManifest error = errors.New("failed to parse plugin manifest")
	ErrSystemManifest              = errors.New("cannot build system manifest")
	schemaLoader                   = gojsonschema.NewStringLoader(SchemaJSON)
)

func Parse(source io.Reader) (*Manifest, error) {
	// TODO: When using gojsonschema.NewReaderLoader, gojsonschema.Validate returns io.EOF error.
	doc, err := io.ReadAll(source)
	if err != nil {
		return nil, ErrFailedToParseManifest
	}

	documentLoader := gojsonschema.NewBytesLoader(doc)
	if err := validate(documentLoader); err != nil {
		return nil, err
	}

	root := Root{}
	// err = json.NewDecoder(reader2).Decode(&root)
	if err = json.Unmarshal(doc, &root); err != nil {
		return nil, ErrFailedToParseManifest
	}

	manifest, err := root.manifest()
	if err != nil {
		return nil, err
	}
	if manifest.Plugin.ID().System() {
		return nil, ErrSystemManifest
	}

	return manifest, nil
}

func ParseSystemFromStaticJSON(source string) (*Manifest, error) {
	src := []byte(source)
	documentLoader := gojsonschema.NewBytesLoader(src)
	if err := validate(documentLoader); err != nil {
		return nil, err
	}

	root := Root{}
	if err := json.Unmarshal(src, &root); err != nil {
		return nil, ErrFailedToParseManifest
	}

	manifest, err := root.manifest()
	if err != nil {
		return nil, err
	}

	return manifest, nil
}

func MustParseSystemFromStaticJSON(source string) *Manifest {
	m, err := ParseSystemFromStaticJSON(source)
	if err != nil {
		panic(err)
	}
	return m
}

func validate(ld gojsonschema.JSONLoader) error {
	// documentLoader, reader2 := gojsonschema.NewReaderLoader(source)
	result, err := gojsonschema.Validate(schemaLoader, ld)
	if err != nil {
		return ErrFailedToParseManifest
	}

	if !result.Valid() {
		var errstr string
		for i, e := range result.Errors() {
			if i > 0 {
				errstr += ", "
			}
			errstr += e.String()
		}
		return fmt.Errorf("invalid manifest: %w", errors.New(errstr))
	}

	return nil
}
