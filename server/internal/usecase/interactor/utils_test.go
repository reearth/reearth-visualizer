package interactor

import (
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/go-redis/redis/v8"
	infraRedis "github.com/reearth/reearth/server/internal/infrastructure/redis"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
)

func setupTestRedis(t *testing.T) (gateway.RedisGateway, func()) {
	t.Helper()

	mr, err := miniredis.Run()
	if err != nil {
		t.Fatal(err)
	}
	cleanup := func() {
		mr.Close()
	}

	redisClient := redis.NewClient(&redis.Options{
		Addr: mr.Addr(),
	})
	redisAdapter := infraRedis.NewRedisAdapter(redisClient)

	return redisAdapter, cleanup
}
