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
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=dataset_schema_field_gen.go --name=DatasetSchemaField
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=infobox_field_gen.go --name=InfoboxField
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=auth_request_gen.go --name=AuthRequest
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=tag_gen.go --name=Tag
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id.tmpl --output=cluster_gen.go --name=Cluster

// Testing
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=asset_gen_test.go --name=Asset
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=tag_gen_test.go --name=Tag
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=dataset_gen_test.go --name=Dataset
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=dataset_schema_gen_test.go --name=DatasetSchema
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=layer_gen_test.go --name=Layer
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=project_gen_test.go --name=Project
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=property_gen_test.go --name=Property
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=property_item_gen_test.go --name=PropertyItem
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=scene_gen_test.go --name=Scene
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=widget_gen_test.go --name=Widget
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=team_gen_test.go --name=Team
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=user_gen_test.go --name=User
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=dataset_schema_field_gen_test.go --name=DatasetSchemaField
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=infobox_field_gen_test.go --name=InfoboxField
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=auth_request_gen_test.go --name=AuthRequest
//go:generate go run github.com/reearth/reearth-backend/tools/cmd/gen --template=id_test.tmpl --output=cluster_field_gen_test.go --name=Cluster

package id
