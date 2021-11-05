package manifest

// Generating types with schema typer for translation schema is disabled because some fields are wrongly typed.
// DISABLED go:generate go run github.com/idubinskiy/schematyper -o schema_translation_gen.go --package manifest --prefix Translation ../../../plugin_manifest_schema_translation.json

import (
	"errors"
	"io"

	"github.com/goccy/go-yaml"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
)

var (
	ErrInvalidManifestTranslation       error = errors.New("invalid manifest translation")
	ErrFailedToParseManifestTranslation error = errors.New("failed to parse plugin manifest translation")
)

func ParseTranslation(source io.Reader) (*TranslationRoot, error) {
	root := TranslationRoot{}
	if err := yaml.NewDecoder(source).Decode(&root); err != nil {
		return nil, ErrFailedToParseManifestTranslation
		// return nil, fmt.Errorf("failed to parse plugin manifest translation: %w", err)
	}

	return &root, nil
}

func ParseTranslationFromBytes(source []byte) (*TranslationRoot, error) {
	tr := TranslationRoot{}
	if err := yaml.Unmarshal(source, &tr); err != nil {
		return nil, ErrFailedToParseManifestTranslation
		// return nil, fmt.Errorf("failed to parse plugin manifest translation: %w", err)
	}
	return &tr, nil
}

func MustParseTranslationFromBytes(source []byte) *TranslationRoot {
	m, err := ParseTranslationFromBytes(source)
	if err != nil {
		panic(err)
	}
	return m
}

func MergeManifestTranslation(m *Manifest, tl map[string]*TranslationRoot) *Manifest {
	for lang, t := range tl {
		if t == nil {
			continue
		}

		if t.Name != nil {
			name := m.Plugin.Name()
			name[lang] = *t.Name
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

			if te.Name != nil {
				name := ext.Name()
				name[lang] = *te.Name
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
				psg := ps.Group(id.PropertySchemaGroupID(key))
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
