package interactor

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestUc_checkPermission(t *testing.T) {
	tid := id.NewTeamID()
	sid := id.NewSceneID()

	tests := []struct {
		name           string
		op             *usecase.Operator
		readableTeams  id.TeamIDList
		writableTeams  id.TeamIDList
		readableScenes id.SceneIDList
		writableScenes id.SceneIDList
		wantErr        bool
	}{
		{
			name:    "nil operator",
			wantErr: false,
		},
		{
			name:          "nil operator 2",
			readableTeams: id.TeamIDList{id.NewTeamID()},
			wantErr:       false,
		},
		{
			name:          "can read a team",
			readableTeams: id.TeamIDList{tid},
			op: &usecase.Operator{
				ReadableTeams: id.TeamIDList{tid},
			},
			wantErr: true,
		},
		{
			name:          "cannot read a team",
			readableTeams: id.TeamIDList{id.NewTeamID()},
			op: &usecase.Operator{
				ReadableTeams: id.TeamIDList{},
			},
			wantErr: true,
		},
		{
			name:          "can write a team",
			writableTeams: id.TeamIDList{tid},
			op: &usecase.Operator{
				WritableTeams: id.TeamIDList{tid},
			},
			wantErr: true,
		},
		{
			name:          "cannot write a team",
			writableTeams: id.TeamIDList{tid},
			op: &usecase.Operator{
				WritableTeams: id.TeamIDList{},
			},
			wantErr: true,
		},
		{
			name:           "can read a scene",
			readableScenes: id.SceneIDList{sid},
			op: &usecase.Operator{
				ReadableScenes: id.SceneIDList{sid},
			},
			wantErr: true,
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
			wantErr: true,
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
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			e := &uc{
				readableTeams:  tt.readableTeams,
				writableTeams:  tt.writableTeams,
				readableScenes: tt.readableScenes,
				writableScenes: tt.writableScenes,
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
	teams := id.TeamIDList{id.NewTeamID(), id.NewTeamID(), id.NewTeamID()}
	scenes := id.SceneIDList{id.NewSceneID(), id.NewSceneID(), id.NewSceneID()}
	assert.Equal(t, &uc{}, Usecase())
	assert.Equal(t, &uc{readableTeams: teams}, (&uc{}).WithReadableTeams(teams...))
	assert.Equal(t, &uc{writableTeams: teams}, (&uc{}).WithWritableTeams(teams...))
	assert.Equal(t, &uc{readableScenes: scenes}, (&uc{}).WithReadablScenes(scenes...))
	assert.Equal(t, &uc{writableScenes: scenes}, (&uc{}).WithWritableScenes(scenes...))
	assert.Equal(t, &uc{tx: true}, (&uc{}).Transaction())
}

func TestRun(t *testing.T) {
	ctx := context.Background()
	err := errors.New("test")
	a, b, c := &struct{}{}, &struct{}{}, &struct{}{}
	tr := memory.NewTransaction()
	r := &repo.Container{Transaction: tr}

	// regular1: without tx
	gota, gotb, gotc, goterr := Run3(
		ctx, nil, r,
		Usecase(),
		func() (any, any, any, error) {
			return a, b, c, nil
		},
	)
	assert.Same(t, a, gota)
	assert.Same(t, b, gotb)
	assert.Same(t, c, gotc)
	assert.Nil(t, goterr)
	assert.Equal(t, 0, tr.Committed()) // not committed

	// regular2: with tx
	_ = Run0(
		ctx, nil, r,
		Usecase().Transaction(),
		func() error {
			return nil
		},
	)
	assert.Equal(t, 1, tr.Committed()) // committed

	// iregular1: the usecase returns an error
	goterr = Run0(
		ctx, nil, r,
		Usecase().Transaction(),
		func() error {
			return err
		},
	)
	assert.Same(t, err, goterr)
	assert.Equal(t, 1, tr.Committed()) // not committed

	// iregular2: tx.Begin returns an error
	tr.SetBeginError(err)
	tr.SetEndError(nil)
	goterr = Run0(
		ctx, nil, r,
		Usecase().Transaction(),
		func() error {
			return nil
		},
	)
	assert.Same(t, err, goterr)
	assert.Equal(t, 1, tr.Committed()) // not committed

	// iregular3: tx.End returns an error
	tr.SetBeginError(nil)
	tr.SetEndError(err)
	goterr = Run0(
		ctx, nil, r,
		Usecase().Transaction(),
		func() error {
			return nil
		},
	)
	assert.Same(t, err, goterr)
	assert.Equal(t, 1, tr.Committed()) // fails
}
