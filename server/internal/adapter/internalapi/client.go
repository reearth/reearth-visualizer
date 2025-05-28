package internalapi

import (
	"context"
	"crypto/tls"
	"io"
	"log"

	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"google.golang.org/api/idtoken"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/oauth"
	"google.golang.org/grpc/metadata"
)

func InvokeApi(
	ctx context.Context,
	userID string,
	endpoint string,
	handleFunc func(client pb.ReEarthVisualizerClient, ctx context.Context) error,
) error {
	audience := "https://" + endpoint
	host := endpoint + ":443"

	ctx = metadata.NewOutgoingContext(ctx, metadata.New(map[string]string{
		"user-id": userID,
	}))

	ts, err := idtoken.NewTokenSource(ctx, audience)
	if err != nil {
		log.Fatalf("failed to get ID token source: %v", err)
		return err
	}

	tlsCreds := credentials.NewTLS(&tls.Config{})
	callCreds := oauth.TokenSource{TokenSource: ts}

	conn, err := grpc.NewClient(host,
		grpc.WithTransportCredentials(tlsCreds),
		grpc.WithPerRPCCredentials(callCreds),
	)
	if err != nil {
		log.Fatalf("failed to create gRPC client: %v", err)
		return err
	}
	defer SafeClose(conn)

	client := pb.NewReEarthVisualizerClient(conn)

	return handleFunc(client, ctx)
}

func SafeClose(c io.Closer) {
	if err := c.Close(); err != nil {
		log.Printf("warning: failed to close: %v", err)
	}
}
