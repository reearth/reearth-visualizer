package interactor

import (
	"context"
	"errors"
	"net/url"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountusecase/accountgateway"
	"github.com/reearth/reearthx/account/accountusecase/accountinteractor"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/rerror"
)

type ContainerConfig struct {
	SignupSecret       string
	AuthSrvUIDomain    string
	PublishedIndexHTML string
	PublishedIndexURL  *url.URL
}

func NewContainer(r *repo.Container, g *gateway.Container,
	ar *accountrepo.Container, ag *accountgateway.Container,
	config ContainerConfig) interfaces.Container {
	var published interfaces.Published
	if config.PublishedIndexURL != nil && config.PublishedIndexURL.String() != "" {
		published = NewPublishedWithURL(r.Project, r.Storytelling, g.File, config.PublishedIndexURL)
	} else {
		published = NewPublished(r.Project, r.Storytelling, g.File, config.PublishedIndexHTML)
	}

	return interfaces.Container{
		Asset:        NewAsset(r, g),
		Dataset:      NewDataset(r, g),
		Layer:        NewLayer(r),
		NLSLayer:     NewNLSLayer(r),
		Style:        NewStyle(r),
		Plugin:       NewPlugin(r, g),
		Policy:       NewPolicy(r),
		Project:      NewProject(r, g),
		Property:     NewProperty(r, g),
		Published:    published,
		Scene:        NewScene(r, g),
		Tag:          NewTag(r),
		StoryTelling: NewStorytelling(r, g),
		Workspace:    accountinteractor.NewWorkspace(ar, workspaceMemberCountEnforcer(r)),
		User:         accountinteractor.NewMultiUser(ar, ag, config.SignupSecret, config.AuthSrvUIDomain, ar.Users),
	}
}

// Deprecated: common will be deprecated. Please use the Usecase function instead.
type common struct{}

func (common) OnlyOperator(op *usecase.Operator) error {
	if op == nil {
		return interfaces.ErrOperationDenied
	}
	return nil
}

func (i common) CanReadWorkspace(t accountdomain.WorkspaceID, op *usecase.Operator) error {
	if err := i.OnlyOperator(op); err != nil {
		return err
	}
	if !op.IsReadableWorkspace(t) {
		return interfaces.ErrOperationDenied
	}
	return nil
}

func (i common) CanWriteWorkspace(t accountdomain.WorkspaceID, op *usecase.Operator) error {
	if err := i.OnlyOperator(op); err != nil {
		return err
	}
	if !op.IsWritableWorkspace(t) {
		return interfaces.ErrOperationDenied
	}
	return nil
}

func (i common) CanReadScene(t id.SceneID, op *usecase.Operator) error {
	if err := i.OnlyOperator(op); err != nil {
		return err
	}
	if !op.IsReadableScene(t) {
		return interfaces.ErrOperationDenied
	}
	return nil
}

func (i common) CanWriteScene(t id.SceneID, op *usecase.Operator) error {
	if err := i.OnlyOperator(op); err != nil {
		return err
	}
	if !op.IsWritableScene(t) {
		return interfaces.ErrOperationDenied
	}
	return nil
}

type commonSceneLock struct {
	sceneLockRepo repo.SceneLock
}

func (i commonSceneLock) CheckSceneLock(ctx context.Context, s id.SceneID) error {
	// check scene lock
	if lock, err := i.sceneLockRepo.GetLock(ctx, s); err != nil {
		return err
	} else if lock.IsLocked() {
		return interfaces.ErrSceneIsLocked
	}
	return nil
}

func (i commonSceneLock) UpdateSceneLock(ctx context.Context, s id.SceneID, before, after scene.LockMode) error {
	// get lock
	lm, err := i.sceneLockRepo.GetLock(ctx, s)
	if err != nil {
		return err
	}

	// check lock
	if lm != before {
		return scene.ErrSceneIsLocked
	}

	// change lock
	err = i.sceneLockRepo.SaveLock(ctx, s, after)
	if err != nil {
		return err
	}
	return nil
}

func (i commonSceneLock) ReleaseSceneLock(ctx context.Context, s id.SceneID) {
	_ = i.sceneLockRepo.SaveLock(ctx, s, scene.LockModeFree)
}

type SceneDeleter struct {
	Scene         repo.Scene
	SceneLock     repo.SceneLock
	Layer         repo.Layer
	Property      repo.Property
	Dataset       repo.Dataset
	DatasetSchema repo.DatasetSchema
}

func (d SceneDeleter) Delete(ctx context.Context, s *scene.Scene, force bool) error {
	if s == nil {
		return nil
	}

	if force {
		lock, err := d.SceneLock.GetLock(ctx, s.ID())
		if err != nil {
			return err
		}

		if lock != scene.LockModeFree {
			return scene.ErrSceneIsLocked
		}
	}

	// Delete layer
	if err := d.Layer.RemoveByScene(ctx, s.ID()); err != nil {
		return err
	}

	// Delete property
	if err := d.Property.RemoveByScene(ctx, s.ID()); err != nil {
		return err
	}

	// Delete dataset
	if err := d.Dataset.RemoveByScene(ctx, s.ID()); err != nil {
		return err
	}

	// Delete dataset schema
	if err := d.DatasetSchema.RemoveByScene(ctx, s.ID()); err != nil {
		return err
	}

	// Release scene lock
	if err := d.SceneLock.SaveLock(ctx, s.ID(), scene.LockModeFree); err != nil {
		return err
	}

	// Delete scene
	if err := d.Scene.Remove(ctx, s.ID()); err != nil {
		return err
	}

	return nil
}

type ProjectDeleter struct {
	SceneDeleter
	File    gateway.File
	Project repo.Project
}

func (d ProjectDeleter) Delete(ctx context.Context, prj *project.Project, force bool, operator *usecase.Operator) error {
	if prj == nil {
		return nil
	}

	// Fetch scene
	s, err := d.Scene.FindByProject(ctx, prj.ID())
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return err
	}

	// Delete scene
	if err := d.SceneDeleter.Delete(ctx, s, force); err != nil {
		return err
	}

	// Unpublish project
	if prj.PublishmentStatus() != project.PublishmentStatusPrivate {
		if err := d.File.RemoveBuiltScene(ctx, prj.Alias()); err != nil {
			return err
		}
	}

	// Delete project
	if err := d.Project.Remove(ctx, prj.ID()); err != nil {
		return err
	}

	return nil
}
