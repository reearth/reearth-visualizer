package migration

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

// go test -v -run TestAddProjectAlias2 ./internal/infrastructure/mongo/migration/...

func TestAddProjectAlias2(t *testing.T) {
	// テスト用MongoDBクライアント
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()
	projectCollection := client.WithCollection("project").Client()

	// 初期データ挿入
	docs := []interface{}{
		bson.M{"_id": "1", "id": "abc123"},                            // projectaliasなし
		bson.M{"_id": "2", "id": "def456", "projectalias": nil},       // nil
		bson.M{"_id": "3", "id": "ghi789", "projectalias": ""},        // 空文字
		bson.M{"_id": "4", "id": "already", "projectalias": "exists"}, // 既に存在
	}
	_, err := projectCollection.InsertMany(ctx, docs)
	assert.NoError(t, err)

	// マイグレーション実行
	err = AddProjectAlias2(ctx, client)
	assert.NoError(t, err)

	// 結果検証
	check := func(id string, expected string) {
		var result bson.M
		err := projectCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&result)
		assert.NoError(t, err)
		assert.Equal(t, expected, result["projectalias"])
	}

	check("1", "p-abc123")
	check("2", "p-def456")
	check("3", "p-ghi789")
	check("4", "exists") // 上書きされないことを確認
}
