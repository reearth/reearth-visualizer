package gateway

import "context"

type RedisGateway interface {
	GetValue(ctx context.Context, key string) (string, error)
	SetValue(ctx context.Context, key string, value interface{}) error
	RemoveValue(ctx context.Context, key string) error
}
