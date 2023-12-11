package interactor

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
)

const retry = 2

type uc struct {
	tx                 bool
	readableWorkspaces accountdomain.WorkspaceIDList
	writableWorkspaces accountdomain.WorkspaceIDList
	readableScenes     id.SceneIDList
	writableScenes     id.SceneIDList
}

func Usecase() *uc {
	return &uc{}
}

func (u *uc) WithReadableWorkspaces(ids ...accountdomain.WorkspaceID) *uc {
	u.readableWorkspaces = accountdomain.WorkspaceIDList(ids).Clone()
	return u
}

func (u *uc) WithWritableWorkspaces(ids ...accountdomain.WorkspaceID) *uc {
	u.writableWorkspaces = accountdomain.WorkspaceIDList(ids).Clone()
	return u
}

func (u *uc) WithReadablScenes(ids ...id.SceneID) *uc {
	u.readableScenes = id.SceneIDList(ids).Clone()
	return u
}

func (u *uc) WithWritableScenes(ids ...id.SceneID) *uc {
	u.writableScenes = id.SceneIDList(ids).Clone()
	return u
}

func (u *uc) Transaction() *uc {
	u.tx = true
	return u
}

func Run0(ctx context.Context, op *usecase.Operator, r *repo.Container, e *uc, f func(ctx context.Context) error) (err error) {
	_, _, _, err = Run3(
		ctx, op, r, e,
		func(ctx context.Context) (_, _, _ any, err error) {
			err = f(ctx)
			return
		})
	return
}

func Run1[A any](ctx context.Context, op *usecase.Operator, r *repo.Container, e *uc, f func(ctx context.Context) (A, error)) (a A, err error) {
	a, _, _, err = Run3(
		ctx, op, r, e,
		func(ctx context.Context) (a A, _, _ any, err error) {
			a, err = f(ctx)
			return
		})
	return
}

func Run2[A, B any](ctx context.Context, op *usecase.Operator, r *repo.Container, e *uc, f func(ctx context.Context) (A, B, error)) (a A, b B, err error) {
	a, b, _, err = Run3(
		ctx, op, r, e,
		func(ctx context.Context) (a A, b B, _ any, err error) {
			a, b, err = f(ctx)
			return
		})
	return
}

func Run3[A, B, C any](ctx context.Context, op *usecase.Operator, r *repo.Container, e *uc, f func(ctx context.Context) (A, B, C, error)) (a A, b B, c C, err error) {
	if err = e.checkPermission(op); err != nil {
		return
	}

	var t usecasex.Transaction
	if e.tx && r.Transaction != nil {
		t = r.Transaction
	}

	err = usecasex.DoTransaction(ctx, t, retry, func(ctx context.Context) error {
		a, b, c, err = f(ctx)
		return err
	})
	return
}

func (u *uc) checkPermission(op *usecase.Operator) error {
	if op == nil {
		return nil
	}

	ok := true
	if u.readableWorkspaces != nil {
		ok = op.IsReadableWorkspace(u.readableWorkspaces...)
	}
	if ok && u.writableWorkspaces != nil {
		ok = op.IsWritableWorkspace(u.writableWorkspaces...)
	}
	if ok && u.readableScenes != nil {
		ok = op.IsReadableScene(u.readableScenes...)
	}
	if ok && u.writableScenes != nil {
		ok = op.IsWritableScene(u.writableScenes...)
	}
	if !ok {
		return interfaces.ErrOperationDenied
	}
	return nil
}
