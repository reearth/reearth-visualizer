package mongodoc

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/exp/slices"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/account/accountdomain"
)

type SceneDocument struct {
	ID          string
	Project     string
	Team        string // DON'T CHANGE NAME'
	RootLayer   string
	Widgets     []SceneWidgetDocument
	AlignSystem *WidgetAlignSystemDocument
	Plugins     []ScenePluginDocument
	UpdateAt    time.Time
	Property    string
	Clusters    []SceneClusterDocument
}

type SceneWidgetDocument struct {
	ID        string
	Plugin    string
	Extension string
	Property  string
	Enabled   bool
	Extended  bool
}

type ScenePluginDocument struct {
	Plugin   string
	Property *string
}

type SceneClusterDocument struct {
	ID       string
	Name     string
	Property string
}

type SceneConsumer = Consumer[*SceneDocument, *scene.Scene]

func NewSceneConsumer(workspaces []accountdomain.WorkspaceID) *SceneConsumer {
	return NewConsumer[*SceneDocument, *scene.Scene](func(s *scene.Scene) bool {
		return workspaces == nil || slices.Contains(workspaces, s.Workspace())
	})
}

type SceneIDDocument struct {
	ID string
}

type SceneIDConsumer struct {
	Rows []id.SceneID
}

func (c *SceneIDConsumer) Consume(raw bson.Raw) error {
	if raw == nil {
		return nil
	}

	var doc SceneIDDocument
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return err
	}
	scene, err := id.SceneIDFrom(doc.ID)
	if err != nil {
		return err
	}
	c.Rows = append(c.Rows, scene)
	return nil
}

func NewScene(scene *scene.Scene) (*SceneDocument, string) {
	widgets := scene.Widgets().Widgets()
	plugins := scene.Plugins().Plugins()
	clusters := scene.Clusters().Clusters()

	widgetsDoc := make([]SceneWidgetDocument, 0, len(widgets))
	pluginsDoc := make([]ScenePluginDocument, 0, len(plugins))
	clsuterDoc := make([]SceneClusterDocument, 0, len(clusters))

	for _, w := range widgets {
		widgetsDoc = append(widgetsDoc, SceneWidgetDocument{
			ID:        w.ID().String(),
			Plugin:    w.Plugin().String(),
			Extension: string(w.Extension()),
			Property:  w.Property().String(),
			Enabled:   w.Enabled(),
			Extended:  w.Extended(),
		})
	}

	for _, sp := range plugins {
		pluginsDoc = append(pluginsDoc, ScenePluginDocument{
			Plugin:   sp.Plugin().String(),
			Property: sp.Property().StringRef(),
		})
	}

	for _, cl := range clusters {
		clsuterDoc = append(clsuterDoc, SceneClusterDocument{
			ID:       cl.ID().String(),
			Name:     cl.Name(),
			Property: cl.Property().String(),
		})
	}

	id := scene.ID().String()
	return &SceneDocument{
		ID:          id,
		Project:     scene.Project().String(),
		Team:        scene.Workspace().String(),
		Widgets:     widgetsDoc,
		Plugins:     pluginsDoc,
		AlignSystem: NewWidgetAlignSystem(scene.Widgets().Alignment()),
		UpdateAt:    scene.UpdatedAt(),
		Property:    scene.Property().String(),
		Clusters:    clsuterDoc,
	}, id
}

func (d *SceneDocument) Model() (*scene.Scene, error) {
	sid, err := id.SceneIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	projectID, err := id.ProjectIDFrom(d.Project)
	if err != nil {
		return nil, err
	}
	prid, err := id.PropertyIDFrom(d.Property)
	if err != nil {
		return nil, err
	}
	tid, err := accountdomain.WorkspaceIDFrom(d.Team)
	if err != nil {
		return nil, err
	}

	ws := make([]*scene.Widget, 0, len(d.Widgets))
	ps := make([]*scene.Plugin, 0, len(d.Plugins))
	clusters := make([]*scene.Cluster, 0, len(d.Clusters))

	for _, w := range d.Widgets {
		wid, err := id.WidgetIDFrom(w.ID)
		if err != nil {
			return nil, err
		}
		pid, err := id.PluginIDFrom(w.Plugin)
		if err != nil {
			return nil, err
		}
		prid, err := id.PropertyIDFrom(w.Property)
		if err != nil {
			return nil, err
		}
		sw, err := scene.NewWidget(
			wid,
			pid,
			id.PluginExtensionID(w.Extension),
			prid,
			w.Enabled,
			w.Extended,
		)
		if err != nil {
			return nil, err
		}
		ws = append(ws, sw)
	}

	for _, p := range d.Plugins {
		pid, err := id.PluginIDFrom(p.Plugin)
		if err != nil {
			return nil, err
		}
		ps = append(ps, scene.NewPlugin(pid, id.PropertyIDFromRef(p.Property)))
	}

	for _, c := range d.Clusters {
		cid, err := id.ClusterIDFrom(c.ID)
		if err != nil {
			return nil, err
		}
		pid, err := id.PropertyIDFrom(c.Property)
		if err != nil {
			return nil, err
		}
		cluster, err := scene.NewCluster(cid, c.Name, pid)
		if err != nil {
			return nil, err
		}
		clusters = append(clusters, cluster)
	}

	cl := scene.NewClusterListFrom(clusters)

	return scene.New().
		ID(sid).
		Project(projectID).
		Workspace(tid).
		Clusters(cl).
		Widgets(scene.NewWidgets(ws, d.AlignSystem.Model())).
		Plugins(scene.NewPlugins(ps)).
		UpdatedAt(d.UpdateAt).
		Property(prid).
		Build()
}

type SceneLockConsumer struct {
	Rows []scene.LockMode
}

type SceneLockDocument struct {
	Scene string
	Lock  string
}

func (c *SceneLockConsumer) Consume(raw bson.Raw) error {
	if raw == nil {
		return nil
	}

	var doc SceneLockDocument
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return err
	}
	_, sceneLock, err := doc.Model()
	if err != nil {
		return err
	}
	c.Rows = append(c.Rows, sceneLock)
	return nil
}

func NewSceneLock(sceneID id.SceneID, lock scene.LockMode) *SceneLockDocument {
	return &SceneLockDocument{
		Scene: sceneID.String(),
		Lock:  string(lock),
	}
}

func (d *SceneLockDocument) Model() (id.SceneID, scene.LockMode, error) {
	sceneID, err := id.SceneIDFrom(d.Scene)
	if err != nil {
		return sceneID, scene.LockMode(""), err
	}
	sceneLock, ok := scene.LockMode(d.Lock).Validate()
	if !ok {
		return sceneID, sceneLock, errors.New("invalid scene lock mode")
	}
	return sceneID, sceneLock, nil
}
