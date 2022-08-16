package manifest

//go:generate go run github.com/idubinskiy/schematyper -o schema_gen.go --package manifest ../../../schemas/plugin_manifest.json

import (
	"errors"
	"io"

	"github.com/goccy/go-yaml"
	"github.com/reearth/reearth/server/pkg/plugin"
)

var (
	ErrInvalidManifest       error = errors.New("invalid manifest")
	ErrFailedToParseManifest error = errors.New("failed to parse plugin manifest")
	ErrSystemManifest              = errors.New("cannot build system manifest")
)

func Parse(source io.Reader, scene *plugin.SceneID, tl *TranslatedRoot) (*Manifest, error) {
	root := Root{}
	if err := yaml.NewDecoder(source).Decode(&root); err != nil {
		return nil, ErrFailedToParseManifest
		// return nil, fmt.Errorf("failed to parse plugin manifest: %w", err)
	}

	manifest, err := root.manifest(scene, tl)
	if err != nil {
		return nil, err
	}
	if manifest.Plugin.ID().System() {
		return nil, ErrSystemManifest
	}

	return manifest, nil
}

func ParseSystemFromBytes(source []byte, scene *plugin.SceneID, tl *TranslatedRoot) (*Manifest, error) {
	root := Root{}
	if err := yaml.Unmarshal(source, &root); err != nil {
		return nil, ErrFailedToParseManifest
		// return nil, fmt.Errorf("failed to parse plugin manifest: %w", err)
	}

	manifest, err := root.manifest(scene, tl)
	if err != nil {
		return nil, err
	}

	return manifest, nil
}

func MustParseSystemFromBytes(source []byte, scene *plugin.SceneID, tl *TranslatedRoot) *Manifest {
	m, err := ParseSystemFromBytes(source, scene, tl)
	if err != nil {
		panic(err)
	}
	return m
}
