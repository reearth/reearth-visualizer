package manifest

// Generating types with schema typer for translation schema is disabled because some fields are wrongly typed.
// DISABLED go:generate go run github.com/idubinskiy/schematyper -o schema_translation_gen.go --package manifest --prefix Translation ../../../plugin_manifest_schema_translation.json
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/embed -o schema_json_translation_gen.go -n SchemaTranslationJSON -i ../../../plugin_manifest_schema_translation.json

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/xeipuuv/gojsonschema"
)

var (
	ErrInvalidManifestTranslation       error                   = errors.New("invalid manifest translation")
	ErrFailedToParseManifestTranslation error                   = errors.New("failed to parse plugin manifest translation")
	schemaTranslationLoader             gojsonschema.JSONLoader = gojsonschema.NewStringLoader(SchemaTranslationJSON)
)

func ParseTranslation(source io.Reader) (*TranslationRoot, error) {
	// TODO: When using gojsonschema.NewReaderLoader, gojsonschema.Validate returns io.EOF error.
	doc, err := io.ReadAll(source)
	if err != nil {
		return nil, ErrFailedToParseManifestTranslation
	}

	documentLoader := gojsonschema.NewBytesLoader(doc)
	if err := validateTranslation(documentLoader); err != nil {
		return nil, err
	}

	root := TranslationRoot{}
	// err = json.NewDecoder(reader2).Decode(&root)
	if err = json.Unmarshal(doc, &root); err != nil {
		return nil, ErrInvalidManifestTranslation
	}

	return &root, nil
}

func ParseTranslationFromStaticJSON(source string) (*TranslationRoot, error) {
	src := []byte(source)

	documentLoader := gojsonschema.NewBytesLoader(src)
	if err := validateTranslation(documentLoader); err != nil {
		return nil, err
	}

	tr := TranslationRoot{}
	if err := json.Unmarshal(src, &tr); err != nil {
		return nil, ErrFailedToParseManifest
	}
	return &tr, nil
}

func MustParseTransSystemFromStaticJSON(source string) *TranslationRoot {
	m, err := ParseTranslationFromStaticJSON(source)
	if err != nil {
		panic(err)
	}
	return m
}

func validateTranslation(ld gojsonschema.JSONLoader) error {
	// documentLoader, reader2 := gojsonschema.NewReaderLoader(source)
	result, err := gojsonschema.Validate(schemaTranslationLoader, ld)
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
		return fmt.Errorf("invalid manifest translation: %w", errors.New(errstr))
	}

	return nil
}

func MergeManifestTranslation(m *Manifest, tl map[string]*TranslationRoot) *Manifest {
	for lang, t := range tl {
		if t == nil {
			continue
		}

		if t.Title != nil {
			name := m.Plugin.Name()
			name[lang] = *t.Title
			m.Plugin.Rename(name)
		}

		if t.Description != nil {
			des := m.Plugin.Description()
			des[lang] = *t.Description
			m.Plugin.SetDescription(des)
		}

		for key, te := range t.Extensions {
			ext := m.Plugin.Extension(id.PluginExtensionID(key))
			if ext == nil {
				continue
			}

			if te.Title != nil {
				name := ext.Name()
				name[lang] = *te.Title
				ext.Rename(name)
			}

			if te.Description != nil {
				des := ext.Description()
				des[lang] = *te.Description
				ext.SetDescription(des)
			}

			var ps *property.Schema
			for _, s := range m.ExtensionSchema {
				if s.ID() == ext.Schema() {
					ps = s
					break
				}
			}
			if ps == nil {
				continue
			}

			for key, tsg := range te.PropertySchema {
				psg := ps.Group(id.PropertySchemaFieldID(key))
				if psg == nil {
					continue
				}

				if tsg.Title != nil {
					t := psg.Title()
					t[lang] = *tsg.Title
					psg.SetTitle(t)
				}

				// PropertySchemaGroup does not have description for now
				// if tsg.Description != nil {
				// 	t := psg.Description()
				// 	t[lang] = *tsg.Description
				// 	psg.SetDescription(t)
				// }

				for key, tsf := range tsg.Fields {
					psf := psg.Field(id.PropertySchemaFieldID(key))
					if psf == nil {
						continue
					}

					if tsf.Title != nil {
						t := psf.Title()
						t[lang] = *tsf.Title
						psf.SetTitle(t)
					}

					if tsf.Description != nil {
						t := psf.Description()
						t[lang] = *tsf.Description
						psf.SetDescription(t)
					}

					for key, label := range tsf.Choices {
						psfc := psf.Choice(key)
						if psfc == nil {
							continue
						}

						psfc.Title[lang] = label
					}
				}
			}
		}
	}

	return m
}
