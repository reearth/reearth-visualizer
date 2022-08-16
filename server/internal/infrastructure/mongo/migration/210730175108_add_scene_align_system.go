package migration

import (
	"context"

	"github.com/labstack/gommon/log"
	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/pkg/builtin"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/scene"
	"go.mongodb.org/mongo-driver/bson"
)

func AddSceneAlignSystem(ctx context.Context, c DBClient) error {
	col := c.WithCollection("scene")

	return col.Find(ctx, bson.D{}, &mongodoc.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			ids := make([]string, 0, len(rows))
			newRows := make([]interface{}, 0, len(rows))

			log.Infof("migration: AddSceneAlignSystem: hit scenes: %d\n", len(rows))

			for _, row := range rows {
				var doc mongodoc.SceneDocument
				if err := bson.Unmarshal(row, &doc); err != nil {
					return err
				}

				swas := scene.NewWidgetAlignSystem()

				for _, w := range doc.Widgets {
					wid, err := id.WidgetIDFrom(w.ID)
					if err != nil {
						continue
					}

					pid, err := id.PluginIDFrom(w.Plugin)
					if err != nil {
						continue
					}

					l := builtin.GetPlugin(pid).Extension(id.PluginExtensionID(w.Extension)).WidgetLayout()
					if l == nil || l.Floating() {
						continue
					}

					dl := l.DefaultLocation()
					if dl == nil {
						dl = &plugin.WidgetLocation{
							Zone:    plugin.WidgetZoneInner,
							Section: plugin.WidgetSectionLeft,
							Area:    plugin.WidgetAreaTop,
						}
					}

					swas.Area(scene.WidgetLocation{
						Zone:    scene.WidgetZoneType(dl.Zone),
						Section: scene.WidgetSectionType(dl.Section),
						Area:    scene.WidgetAreaType(dl.Area),
					}).Add(wid, -1)
				}

				doc.AlignSystem = mongodoc.NewWidgetAlignSystem(swas)
				ids = append(ids, doc.ID)
				newRows = append(newRows, doc)
			}

			return col.SaveAll(ctx, ids, newRows)
		},
	})
}
