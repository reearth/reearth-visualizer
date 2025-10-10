package mongodoc

import (
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/exp/slices"
)

type ProjectMetadataDocument struct {
	ID              string
	Workspace       string
	Project         string
	ImportStatus    *string
	ImportResultLog *map[string]any
	Readme          *string
	License         *string
	Topics          interface{} `bson:"topics,omitempty"` // Can be *string (old) or *[]string (new)
	CreatedAt       *time.Time
	UpdatedAt       *time.Time
}

type ProjectMetadataConsumer = Consumer[*ProjectMetadataDocument, *project.ProjectMetadata]

func NewProjectMetadataConsumer(workspaces []accountdomain.WorkspaceID) *ProjectMetadataConsumer {
	return NewConsumer[*ProjectMetadataDocument, *project.ProjectMetadata](func(s *project.ProjectMetadata) bool {
		return workspaces == nil || slices.Contains(workspaces, s.Workspace())
	})
}

func NewProjectMetadata(r *project.ProjectMetadata) (*ProjectMetadataDocument, string) {
	rid := r.ID().String()

	var importStatus *string
	if r.ImportStatus() != nil {
		v := string(*r.ImportStatus())
		importStatus = &v
	}

	return &ProjectMetadataDocument{
		ID:              rid,
		Workspace:       r.Workspace().String(),
		Project:         r.Project().String(),
		ImportStatus:    importStatus,
		ImportResultLog: r.ImportResultLog(),
		Readme:          r.Readme(),
		License:         r.License(),
		Topics:          r.Topics(),
		CreatedAt:       r.CreatedAt(),
		UpdatedAt:       r.UpdatedAt(),
	}, rid

}

func (d *ProjectMetadataDocument) Model() (*project.ProjectMetadata, error) {
	rid, err := id.ProjectMetadataIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	wid, err := accountdomain.WorkspaceIDFrom(d.Workspace)
	if err != nil {
		return nil, err
	}

	pid, err := id.ProjectIDFrom(d.Project)
	if err != nil {
		return nil, err
	}

	var importStatus *project.ProjectImportStatus
	if d.ImportStatus != nil {
		v := project.ProjectImportStatus(*d.ImportStatus)
		importStatus = &v
	}

	builder := project.NewProjectMetadata().
		ID(rid).
		Workspace(wid).
		Project(pid).
		ImportStatus(importStatus).
		ImportResultLog(d.ImportResultLog).
		Readme(d.Readme).
		License(d.License).
		UpdatedAt(d.UpdatedAt).
		CreatedAt(d.CreatedAt)

	// Handle both old string format and new array format for topics
	if d.Topics != nil {
		switch topics := d.Topics.(type) {
		case []string:
			if len(topics) > 0 {
				builder = builder.Topics(&topics)
			}
		case *[]string:
			if topics != nil && len(*topics) > 0 {
				builder = builder.Topics(topics)
			}
		case primitive.A:
			// MongoDB primitive array - convert to []string
			if len(topics) > 0 {
				stringTopics := make([]string, len(topics))
				for i, topic := range topics {
					if str, ok := topic.(string); ok {
						stringTopics[i] = str
					}
				}
				builder = builder.Topics(&stringTopics)
			}
		case string:
			// Old string format (without pointer) - convert to array
			if topics != "" {
				topicsArray := []string{topics}
				builder = builder.Topics(&topicsArray)
			}
		case *string:
			// Old string format (with pointer) - convert to array
			if topics != nil && *topics != "" {
				topicsArray := []string{*topics}
				builder = builder.Topics(&topicsArray)
			}
		}
	}

	return builder.Build()
}
