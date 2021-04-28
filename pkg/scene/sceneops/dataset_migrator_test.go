package sceneops

//import (
//	"github.com/reearth/reearth-backend/pkg/dataset"
//	"github.com/reearth/reearth-backend/pkg/id"
//	"testing"
//)
//
//func TestDatasetMigrator_Migrate(t *testing.T) {
//	sid := id.NewSceneID()
//	dsid:=id.NewDatasetID()
//	dssid:=id.NewDatasetSchemaID()
//	dssfid:=id.NewDatasetSchemaFieldID()
//	testCases := []struct {
//		Name     string
//		SID      id.SceneID
//		NewDSL   []*dataset.Schema
//		NewDL    dataset.List
//		Expected MigrateDatasetResult
//		Err      error
//	}{
//		{
//			Name:     "",
//			SID:      sid,
//			NewDSL:   []*dataset.Schema{
//				dataset.NewSchema().
//					ID(dssid).
//					Fields([]*dataset.SchemaField{
//						dataset.NewSchemaField().
//							ID(dssfid).MustBuild(),
//					}).Scene(sid).MustBuild()},
//			NewDL:    dataset.List{
//				dataset.New().ID(dsid).MustBuild(),
//			},
//			Expected: MigrateDatasetResult{},
//			Err:      nil,
//		},
//	}
//	for _,tc:=range testCases{
//		tc:=tc
//		t.Run(tc.Name, func(tt *testing.T) {
//			tt.Parallel()
//			res,err:=tc
//		})
//	}
//}
