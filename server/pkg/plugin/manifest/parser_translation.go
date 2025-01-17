package manifest

// Generating types with schema typer for translation schema is disabled because some fields are wrongly typed.
// DISABLED go:generate go run github.com/idubinskiy/schematyper -o schema_translation_gen.go --package manifest --prefix Translation ../../../schemas/plugin_manifest_translation.json

import (
	"errors"
	"io"

	"github.com/goccy/go-yaml"
)

var (
	ErrInvalidManifestTranslation       error = errors.New("invalid manifest translation")
	ErrFailedToParseManifestTranslation error = errors.New("failed to parse plugin manifest translation")
)

func ParseTranslation(source io.Reader) (TranslationRoot, error) {
	root := TranslationRoot{}
	if err := yaml.NewDecoder(source).Decode(&root); err != nil {
		return root, ErrFailedToParseManifestTranslation
	}

	return root, nil
}

func ParseTranslationFromBytes(source []byte) (TranslationRoot, error) {
	tr := TranslationRoot{}
	if err := yaml.Unmarshal(source, &tr); err != nil {
		return tr, ErrFailedToParseManifestTranslation
	}
	return tr, nil
}

func MustParseTranslationFromBytes(source []byte) TranslationRoot {
	m, err := ParseTranslationFromBytes(source)
	if err != nil {
		panic(err)
	}
	return m
}
