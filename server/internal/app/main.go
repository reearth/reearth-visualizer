package app

import (
	"context"
	"os"
	"strconv"

	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/app/otel"
	mongorepo "github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/internal/infrastructure/mongo/migration"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo"
)

func Start(debug bool, version string) {
	log.Infof("Re:Earth Visualizer API version %s", version)

	ctx := context.Background()

	// Load config
	conf, cerr := config.ReadConfig(debug)
	if cerr != nil {
		log.Fatalf("failed to load config: %v", cerr)
	}
	log.Infof("config: %s", conf.Print())

	// Init profiler
	initProfiler(conf.Profiler, version)

	// Init tracer
	if conf.OtelEnabled {
		closer, err := otel.InitTracer(ctx, &otel.Config{
			Enabled:            conf.OtelEnabled,
			Endpoint:           conf.OtelEndpoint,
			ExporterType:       otel.ExporterType(conf.OtelExporterType),
			MaxExportBatchSize: conf.OtelMaxExportBatchSize,
			BatchTimeout:       conf.OtelBatchTimeout,
			MaxQueueSize:       conf.OtelMaxQueueSize,
		})

		if err != nil {
			log.Fatalf("failed to init tracer: %v", err)
		}

		defer func() {
			if err := closer.Shutdown(ctx); err != nil {
				log.Errorf("Failed to shutdown tracer: %s\n", err.Error())
			}
		}()
	}

	// run migration
	if os.Getenv("RUN_MIGRATION") == "true" {
		client, err := mongo.Connect(
			ctx,
			options.Client().
				ApplyURI(conf.DB).
				SetMonitor(otelmongo.NewMonitor()),
		)

		if err != nil {
			log.Fatalf("failed to connect to mongo: %v", err)
			return
		}

		clientx := mongox.NewClient(conf.DB_Vis, client)
		db := clientx.Database()

		lock, err := mongorepo.NewLock(db.Collection("locks"))
		if err != nil {
			log.Fatalf("failed to create lock: %v", err)
		}

		migrationKeyStr := os.Getenv("MIGRATION_KEY")
		if migrationKeyStr != "" {
			migrationKey, err := strconv.ParseInt(migrationKeyStr, 10, 64)
			if err != nil {
				log.Fatalf("Failed to parse MIGRATION_KEY: %v", err)
				return
			}
			result, err := db.Collection("config").UpdateOne(ctx, bson.M{}, bson.M{
				"$set": bson.M{
					"migration": migrationKey,
				},
			})
			if err != nil {
				log.Fatalf("failed to migration set: %v", err)
				return
			}
			log.Infof("MatchedCount: %d, ModifiedCount: %d migration key: %s \n", result.MatchedCount, result.ModifiedCount, migrationKey)
		}

		log.Infof("------migration start------")
		if err := migration.Do(ctx, clientx, mongorepo.NewConfig(db.Collection("config"), lock)); err != nil {
			log.Fatalf("failed to run migration: %v", err)
		}
		log.Infof("------migration done------")
		return
	}

	// run server
	runServer(ctx, conf, debug)
}
