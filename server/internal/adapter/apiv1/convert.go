package apiv1

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/samber/lo"
)

// toProject converts a project for responses. Secrets such as the basic auth
// password are never part of it. The scene is passed in because the project
// does not store it: the scene points to its project.
func toProject(p *project.Project, sceneID *id.SceneID) Project {
	res := Project{
		Id:                p.ID().String(),
		WorkspaceId:       p.Workspace().String(),
		Name:              p.Name(),
		Description:       p.Description(),
		Visibility:        Visibility(p.Visibility()),
		Starred:           p.Starred(),
		Archived:          p.IsArchived(),
		Deleted:           p.IsDeleted(),
		PublishmentStatus: toPublishmentStatus(p.PublishmentStatus()),
		CreatedAt:         p.CreatedAt().UTC(),
		UpdatedAt:         p.UpdatedAt().UTC(),
	}
	if sceneID != nil {
		res.SceneId = lo.ToPtr(sceneID.String())
	}
	if a := p.ProjectAlias(); a != "" {
		res.Alias = &a
	}
	if u := p.ImageURL(); u != nil {
		res.ImageUrl = lo.ToPtr(u.String())
	}
	if t := p.PublishedAt(); !t.IsZero() {
		t = t.UTC()
		res.PublishedAt = &t
	}
	return res
}

func toPublishmentStatus(s project.PublishmentStatus) PublishmentStatus {
	switch s {
	case project.PublishmentStatusPublic:
		return PublishmentStatusPublic
	case project.PublishmentStatusLimited:
		return PublishmentStatusLimited
	default:
		return PublishmentStatusPrivate
	}
}

func toSortType(s *ProjectSort) (*project.SortType, error) {
	if s == nil {
		return &project.SortType{Key: project.SortTypeUpdatedAt.Key, Desc: true}, nil
	}
	switch *s {
	case ProjectSortUpdatedAt:
		return &project.SortType{Key: project.SortTypeUpdatedAt.Key}, nil
	case ProjectSortMinusUpdatedAt:
		return &project.SortType{Key: project.SortTypeUpdatedAt.Key, Desc: true}, nil
	case ProjectSortName:
		return &project.SortType{Key: project.SortTypeName.Key}, nil
	case ProjectSortMinusName:
		return &project.SortType{Key: project.SortTypeName.Key, Desc: true}, nil
	}
	return nil, invalidInput("invalid sort %q", *s)
}
