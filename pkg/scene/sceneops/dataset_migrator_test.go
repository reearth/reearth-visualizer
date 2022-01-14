package sceneops

//import (
//	"testing"
//
//	"github.com/reearth/reearth-backend/pkg/dataset"
//)
//
//func TestDatasetMigrator_Migrate(t *testing.T) {
//	sid := dataset.NewSceneID()
//	dsid := dataset.NewID()
//	dssid := dataset.NewSchemaID()
//	dssfid := dataset.MewFieldID()
//	testCases := []struct {
//		Name     string
//		SID      dataset.SceneID
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
