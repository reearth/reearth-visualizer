package apiv1

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/apperr"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/storytelling"
)

// PublishStory publishes the project's story. The web app creates one story
// per project, so the story is found through the project rather than asking
// clients for its ID.
func (s Server) PublishStory(ctx context.Context, req PublishStoryRequestObject) (PublishStoryResponseObject, error) {
	uc, op := usecases(ctx)
	pid, err := id.ProjectIDFrom(req.ProjectId)
	if err != nil {
		return nil, invalidInput("invalid project ID %q", req.ProjectId)
	}
	status, ok := fromStoryPublishmentStatus(req.Body.Status)
	if !ok {
		return nil, invalidInput("invalid status %q (want public, limited or private)", req.Body.Status)
	}
	prj, err := fetchProject(ctx, uc, pid)
	if err != nil {
		return nil, err
	}
	if prj.IsDeleted() {
		return nil, conflict("project %s is in the trash; restore it first", pid)
	}

	sc, err := uc.Scene.FindByProject(ctx, pid, op)
	if err != nil {
		if apperr.Classify(err) == apperr.ClassNotFound {
			return nil, notFound("story")
		}
		return nil, err
	}
	stories, err := uc.StoryTelling.FetchByScene(ctx, sc.ID(), op)
	if err != nil {
		return nil, err
	}
	if stories == nil || len(*stories) == 0 {
		return nil, notFound("story")
	}
	if len(*stories) > 1 {
		return nil, conflict("project %s has %d stories", pid, len(*stories))
	}

	story, err := uc.StoryTelling.Publish(ctx, interfaces.PublishStoryInput{
		ID:     (*stories)[0].Id(),
		Alias:  req.Body.Alias,
		Status: status,
	}, op)
	if err != nil {
		return nil, err
	}
	out := PublishStoryResponse{Story: toStory(story, pid)}
	if status != storytelling.PublishmentStatusPrivate {
		out.Url = publishedURL(s.publishedHost, story.Alias())
	}
	return PublishStory200JSONResponse(out), nil
}

func toStory(st *storytelling.Story, pid id.ProjectID) Story {
	res := Story{
		Id:                st.Id().String(),
		ProjectId:         pid.String(),
		Title:             st.Title(),
		PublishmentStatus: toPublishmentStatus(project.PublishmentStatus(st.PublishmentStatus())),
		UpdatedAt:         st.UpdatedAt().UTC(),
	}
	if a := st.Alias(); a != "" {
		res.PublishedAlias = &a
	}
	if t := st.PublishedAt(); t != nil && !t.IsZero() {
		u := t.UTC()
		res.PublishedAt = &u
	}
	return res
}

func fromStoryPublishmentStatus(s PublishmentStatus) (storytelling.PublishmentStatus, bool) {
	ps, ok := fromPublishmentStatus(s)
	if !ok {
		return "", false
	}
	// The project and story statuses share their values.
	return storytelling.PublishmentStatus(ps), true
}
