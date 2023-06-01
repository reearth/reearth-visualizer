package id

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPropertySchemaIDList_Clone(t *testing.T) {
	tests := []struct {
		name string
		l    PropertySchemaIDList
		want PropertySchemaIDList
	}{
		{
			name: "nil",
			l:    nil,
			want: nil,
		},
		{
			name: "empty",
			l:    PropertySchemaIDList{},
			want: PropertySchemaIDList{},
		},
		{
			name: "normal",
			l:    PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")},
			want: PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.l.Clone()
			assert.Equal(t, tt.want, got)
			assert.NotSame(t, tt.want, got)
		})
	}
}

func TestPropertySchemaIDList_Contains(t *testing.T) {
	type args struct {
		id PropertySchemaID
	}
	tests := []struct {
		name string
		l    PropertySchemaIDList
		args args
		want bool
	}{
		{
			name: "nil",
			l:    nil,
			args: args{MustPropertySchemaID("hoge~0.1.0/a")},
			want: false,
		},
		{
			name: "empty",
			l:    PropertySchemaIDList{},
			args: args{MustPropertySchemaID("hoge~0.1.0/a")},
			want: false,
		},
		{
			name: "normal",
			l:    PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")},
			args: args{MustPropertySchemaID("hoge~0.1.0/a")},
			want: true,
		},
		{
			name: "not found",
			l:    PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")},
			args: args{MustPropertySchemaID("hoge~0.1.0/c")},
			want: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equalf(t, tt.want, tt.l.Contains(tt.args.id), "Contains(%v)", tt.args.id)
		})
	}
}

func TestPropertySchemaIDList_Merge(t *testing.T) {
	type args struct {
		l2 PropertySchemaIDList
	}
	tests := []struct {
		name string
		l    PropertySchemaIDList
		args args
		want PropertySchemaIDList
	}{
		{
			name: "nil",
			l:    nil,
			args: args{PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")}},
			want: PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")},
		},
		{
			name: "empty",
			l:    PropertySchemaIDList{},
			args: args{PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")}},
			want: PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")},
		},
		{
			name: "normal",
			l:    PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")},
			args: args{PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/c"), MustPropertySchemaID("hoge~0.1.0/d")}},
			want: PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b"), MustPropertySchemaID("hoge~0.1.0/c"), MustPropertySchemaID("hoge~0.1.0/d")},
		},
		{
			name: "duplicated",
			l:    PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")},
			args: args{PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")}},
			want: PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b"), MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")},
		},
		{
			name: "duplicated2",
			l:    PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")},
			args: args{PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/b"), MustPropertySchemaID("hoge~0.1.0/c")}},
			want: PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b"), MustPropertySchemaID("hoge~0.1.0/b"), MustPropertySchemaID("hoge~0.1.0/c")},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.l.Merge(tt.args.l2))
		})
	}
}

func TestPropertySchemaIDList_MergeUnique(t *testing.T) {
	type args struct {
		l2 PropertySchemaIDList
	}
	tests := []struct {
		name string
		l    PropertySchemaIDList
		args args
		want PropertySchemaIDList
	}{
		{
			name: "nil",
			l:    nil,
			args: args{PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")}},
			want: PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")},
		},
		{
			name: "empty",
			l:    PropertySchemaIDList{},
			args: args{PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")}},
			want: PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")},
		},
		{
			name: "normal",
			l:    PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")},
			args: args{PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/c"), MustPropertySchemaID("hoge~0.1.0/d")}},
			want: PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b"), MustPropertySchemaID("hoge~0.1.0/c"), MustPropertySchemaID("hoge~0.1.0/d")},
		},
		{
			name: "duplicated",
			l:    PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")},
			args: args{PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")}},
			want: PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")},
		},
		{
			name: "duplicated2",
			l:    PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b")},
			args: args{PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/b"), MustPropertySchemaID("hoge~0.1.0/c")}},
			want: PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/b"), MustPropertySchemaID("hoge~0.1.0/c")},
		},
		{
			name: "duplicated3",
			l:    PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/a")},
			args: args{PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/a")}},
			want: PropertySchemaIDList{MustPropertySchemaID("hoge~0.1.0/a"), MustPropertySchemaID("hoge~0.1.0/a")},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equalf(t, tt.want, tt.l.MergeUnique(tt.args.l2), "MergeUnique(%v)", tt.args.l2)
		})
	}
}
