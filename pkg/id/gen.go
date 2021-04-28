//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=asset_gen.go --name=Asset
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=dataset_gen.go --name=Dataset
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=dataset_schema_gen.go --name=DatasetSchema
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=layer_gen.go --name=Layer
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=project_gen.go --name=Project
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=property_gen.go --name=Property
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=property_item_gen.go --name=PropertyItem
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=scene_gen.go --name=Scene
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=widget_gen.go --name=Widget
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=team_gen.go --name=Team
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=user_gen.go --name=User

package id
