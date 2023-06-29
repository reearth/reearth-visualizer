package fs

import (
	"context"
	"errors"
	"path/filepath"
	"regexp"

	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/plugin/manifest"
	"github.com/reearth/reearthx/rerror"
	"github.com/spf13/afero"
)

type pluginRepo struct {
	fs afero.Fs
	f  repo.SceneFilter
}

func NewPlugin(fs afero.Fs) repo.Plugin {
	return &pluginRepo{
		fs: fs,
	}
}

func (r *pluginRepo) Filtered(f repo.SceneFilter) repo.Plugin {
	return &pluginRepo{
		fs: r.fs,
		f:  r.f.Merge(f),
	}
}

func (r *pluginRepo) FindByID(ctx context.Context, pid id.PluginID) (*plugin.Plugin, error) {
	m, err := readPluginManifest(ctx, r.fs, pid)
	if err != nil {
		return nil, err
	}

	if s := m.Plugin.ID().Scene(); s != nil && !r.f.CanRead(*s) {
		return nil, nil
	}

	return m.Plugin, nil
}

func (r *pluginRepo) FindByIDs(ctx context.Context, ids []id.PluginID) ([]*plugin.Plugin, error) {
	results := make([]*plugin.Plugin, 0, len(ids))
	for _, id := range ids {
		res, err := r.FindByID(ctx, id)
		if err != nil {
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}

func (r *pluginRepo) Save(ctx context.Context, p *plugin.Plugin) error {
	return rerror.ErrInternalByWithContext(ctx, errors.New("read only"))
}

func (r *pluginRepo) Remove(ctx context.Context, pid id.PluginID) error {
	return rerror.ErrInternalByWithContext(ctx, errors.New("read only"))
}

var translationFileNameRegexp = regexp.MustCompile(`reearth_([a-zA-Z]+(?:-[a-zA-Z]+)?).yml`)

func readPluginManifest(ctx context.Context, fs afero.Fs, pid id.PluginID) (*manifest.Manifest, error) {
	base := filepath.Join(pluginDir, pid.String())
	translationMap, err := readPluginTranslation(ctx, fs, base)
	if err != nil {
		return nil, err
	}

	f, err := fs.Open(filepath.Join(base, manifestFilePath))
	if err != nil {
		return nil, rerror.ErrInternalByWithContext(ctx, err)
	}
	defer func() {
		_ = f.Close()
	}()

	m, err := manifest.Parse(f, nil, translationMap.TranslatedRef())
	if err != nil {
		return nil, err
	}

	return m, nil
}

func readPluginTranslation(ctx context.Context, fs afero.Fs, base string) (manifest.TranslationMap, error) {
	d, err := afero.ReadDir(fs, base)
	if err != nil {
		return nil, rerror.ErrInternalByWithContext(ctx, err)
	}

	translationMap := manifest.TranslationMap{}
	for _, e := range d {
		if e.IsDir() {
			continue
		}
		name := e.Name()
		lang := translationFileNameRegexp.FindStringSubmatch(name)
		if len(lang) == 0 {
			continue
		}
		langfile, err := fs.Open(filepath.Join(base, name))
		if err != nil {
			return nil, rerror.ErrInternalByWithContext(ctx, err)
		}
		defer func() {
			_ = langfile.Close()
		}()
		t, err := manifest.ParseTranslation(langfile)
		if err != nil {
			return nil, err
		}
		translationMap[lang[1]] = t
	}

	return translationMap, nil
}
