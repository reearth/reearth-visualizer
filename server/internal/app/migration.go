package app

import (
	"context"

	"github.com/reearth/reearth/server/internal/app/config"
	mongorepo "github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo/migration"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo"
)

func runMigration(ctx context.Context, conf *config.Config) {
	client, err := mongo.Connect(
		ctx,
		options.Client().
			ApplyURI(conf.DB).
			SetMonitor(otelmongo.NewMonitor()),
	)
	if err != nil {
		log.Fatalf("failed to connect to mongo: %v", err)
	}

	clientx := mongox.NewClient(conf.DB_Vis, client)
	db := clientx.Database()

	lock, err := mongorepo.NewLock(db.Collection("locks"))
	if err != nil {
		log.Fatalf("failed to create lock: %v", err)
	}

	log.Infof("------migration start------")
	if err := migration.Do(ctx, clientx, mongorepo.NewConfig(db.Collection("config"), lock)); err != nil {
		log.Fatalf("failed to run migration: %v", err)
	}
	log.Infof("------migration done------")
}
