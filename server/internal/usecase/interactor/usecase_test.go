package interactor

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/usecasex"
	"github.com/stretchr/testify/assert"
)

func TestUc_checkPermission(t *testing.T) {
	wid := accountdomain.NewWorkspaceID()
	sid := id.NewSceneID()

	tests := []struct {
		name               string
		op                 *usecase.Operator
		readableWorkspaces accountdomain.WorkspaceIDList
		writableWorkspaces accountdomain.WorkspaceIDList
		readableScenes     id.SceneIDList
		writableScenes     id.SceneIDList
		wantErr            bool
	}{
		{
			name:    "nil operator",
			wantErr: false,
		},
		{
			name:               "nil operator 2",
			readableWorkspaces: accountdomain.WorkspaceIDList{accountdomain.NewWorkspaceID()},
			wantErr:            false,
		},
		{
			name:               "can read a workspace",
			readableWorkspaces: accountdomain.WorkspaceIDList{wid},
			op: &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					ReadableWorkspaces: accountdomain.WorkspaceIDList{wid}},
			},
			wantErr: false,
		},
		{
			name:               "cannot read a workspace",
			readableWorkspaces: accountdomain.WorkspaceIDList{accountdomain.NewWorkspaceID()},
			op: &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					ReadableWorkspaces: accountdomain.WorkspaceIDList{}}},
			wantErr: true,
		},
		{
			name:               "can write a workspace",
			writableWorkspaces: accountdomain.WorkspaceIDList{wid},
			op: &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: accountdomain.WorkspaceIDList{wid},
				},
			},
			wantErr: false,
		},
		{
			name:               "cannot write a workspace",
			writableWorkspaces: accountdomain.WorkspaceIDList{wid},
			op: &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					WritableWorkspaces: accountdomain.WorkspaceIDList{},
				}},
			wantErr: true,
		},
		{
			name:           "can read a scene",
			readableScenes: id.SceneIDList{sid},
			op: &usecase.Operator{
				ReadableScenes: id.SceneIDList{sid},
			},
			wantErr: false,
		},
		{
			name:           "cannot read a scene",
			readableScenes: id.SceneIDList{sid},
			op: &usecase.Operator{
				ReadableScenes: id.SceneIDList{},
			},
			wantErr: true,
		},
		{
			name:           "can write a scene",
			writableScenes: id.SceneIDList{sid},
			op: &usecase.Operator{
				WritableScenes: id.SceneIDList{sid},
			},
			wantErr: false,
		},
		{
			name:           "cannot write a scene",
			writableScenes: id.SceneIDList{sid},
			op: &usecase.Operator{
				WritableScenes: id.SceneIDList{},
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			e := &uc{
				readableWorkspaces: tt.readableWorkspaces,
				writableWorkspaces: tt.writableWorkspaces,
				readableScenes:     tt.readableScenes,
				writableScenes:     tt.writableScenes,
			}
			got := e.checkPermission(tt.op)
			if tt.wantErr {
				assert.Equal(t, interfaces.ErrOperationDenied, got)
			} else {
				assert.Nil(t, got)
			}
		})
	}
}

func TestUc(t *testing.T) {
	workspaces := accountdomain.WorkspaceIDList{accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()}
	scenes := id.SceneIDList{id.NewSceneID(), id.NewSceneID(), id.NewSceneID()}
	assert.Equal(t, &uc{}, Usecase())
	assert.Equal(t, &uc{readableWorkspaces: workspaces}, (&uc{}).WithReadableWorkspaces(workspaces...))
	assert.Equal(t, &uc{writableWorkspaces: workspaces}, (&uc{}).WithWritableWorkspaces(workspaces...))
	assert.Equal(t, &uc{readableScenes: scenes}, (&uc{}).WithReadablScenes(scenes...))
	assert.Equal(t, &uc{writableScenes: scenes}, (&uc{}).WithWritableScenes(scenes...))
	assert.Equal(t, &uc{tx: true}, (&uc{}).Transaction())
}

func TestRun(t *testing.T) {
	ctx := context.Background()
	err := errors.New("test")
	a, b, c := &struct{}{}, &struct{}{}, &struct{}{}

	// regular1: without tx
	tr := &usecasex.NopTransaction{}
	r := &repo.Container{Transaction: tr}
	gota, gotb, gotc, goterr := Run3(
		ctx, nil, r,
		Usecase(),
		func(ctx context.Context) (any, any, any, error) {
			return a, b, c, nil
		},
	)
	assert.Same(t, a, gota)
	assert.Same(t, b, gotb)
	assert.Same(t, c, gotc)
	assert.Nil(t, goterr)
	assert.False(t, tr.IsCommitted()) // not IsCommitted

	// regular2: with tx
	tr = &usecasex.NopTransaction{}
	r.Transaction = tr
	_ = Run0(
		ctx, nil, r,
		Usecase().Transaction(),
		func(ctx context.Context) error {
			return nil
		},
	)
	assert.True(t, tr.IsCommitted())

	// iregular1: the usecase returns an error
	tr = &usecasex.NopTransaction{}
	r.Transaction = tr
	goterr = Run0(
		ctx, nil, r,
		Usecase().Transaction(),
		func(ctx context.Context) error {
			return err
		},
	)
	assert.Same(t, err, goterr)
	assert.False(t, tr.IsCommitted())

	// iregular2: tx.Begin returns an error
	tr = &usecasex.NopTransaction{}
	r.Transaction = tr
	tr.BeginError = err
	tr.CommitError = nil
	goterr = Run0(
		ctx, nil, r,
		Usecase().Transaction(),
		func(ctx context.Context) error {
			return nil
		},
	)
	assert.Same(t, err, goterr)
	assert.False(t, tr.IsCommitted())

	// iregular3: tx.End returns an error
	tr = &usecasex.NopTransaction{}
	r.Transaction = tr
	tr.BeginError = nil
	tr.CommitError = err
	goterr = Run0(
		ctx, nil, r,
		Usecase().Transaction(),
		func(ctx context.Context) error {
			return nil
		},
	)
	assert.Same(t, err, goterr)
	assert.True(t, tr.IsCommitted())
}
