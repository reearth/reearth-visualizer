package interactor

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/repo"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/project"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/reearth/reearth-backend/pkg/scene"
)

type common struct{}

func (common) OnlyOperator(op *usecase.Operator) error {
	if op == nil {
		return interfaces.ErrOperationDenied
	}
	return nil
}

func (i common) IsMe(u id.UserID, op *usecase.Operator) error {
	if err := i.OnlyOperator(op); err != nil {
		return err
	}
	if op.User != u {
		return interfaces.ErrOperationDenied
	}
	return nil
}

func (i common) CanReadTeam(t id.TeamID, op *usecase.Operator) error {
	if err := i.OnlyOperator(op); err != nil {
		return err
	}
	if !op.IsReadableTeamIncluded(t) {
		return interfaces.ErrOperationDenied
	}
	return nil
}

func (i common) CanWriteTeam(t id.TeamID, op *usecase.Operator) error {
	if err := i.OnlyOperator(op); err != nil {
		return err
	}
	if !op.IsWritableTeamIncluded(t) {
		return interfaces.ErrOperationDenied
	}
	return nil
}

type commonScene struct {
	common
	sceneRepo repo.Scene
}

func (i commonScene) OnlyReadableScenes(ctx context.Context, op *usecase.Operator) ([]id.SceneID, error) {
	if err := i.OnlyOperator(op); err != nil {
		return nil, err
	}
	scenes, err := i.sceneRepo.FindIDsByTeam(ctx, op.ReadableTeams)
	if err != nil {
		return nil, err
	}
	return scenes, nil
}

func (i commonScene) OnlyWritableScenes(ctx context.Context, op *usecase.Operator) ([]id.SceneID, error) {
	if err := i.OnlyOperator(op); err != nil {
		return nil, err
	}
	scenes, err := i.sceneRepo.FindIDsByTeam(ctx, op.WritableTeams)
	if err != nil {
		return nil, err
	}
	return scenes, nil
}

func (i commonScene) CanReadScene(ctx context.Context, s id.SceneID, op *usecase.Operator) error {
	if err := i.OnlyOperator(op); err != nil {
		return err
	}
	res, err := i.sceneRepo.HasSceneTeam(ctx, s, op.ReadableTeams)
	if err != nil {
		return err
	}
	if !res {
		return interfaces.ErrOperationDenied
	}
	return nil
}

func (i commonScene) CanWriteScene(ctx context.Context, s id.SceneID, op *usecase.Operator) error {
	if err := i.OnlyOperator(op); err != nil {
		return err
	}
	res, err := i.sceneRepo.HasSceneTeam(ctx, s, op.WritableTeams)
	if err != nil {
		return err
	}
	if !res {
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
	s, err := d.Scene.FindByProject(ctx, prj.ID(), operator.WritableTeams)
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
