package app

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/adapter/internalapi"
	pb "github.com/reearth/reearth/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth/server/internal/usecase/interactor"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
)

func initGrpc(cfg *ServerConfig) *grpc.Server {
	if cfg == nil || cfg.Config == nil {
		log.Fatalf("ServerConfig.Config is nil")
	}

	ui := grpc.ChainUnaryInterceptor(
		unaryLogInterceptor(cfg),
		unaryAuthInterceptor(cfg),
		unaryAttachOperatorInterceptor(cfg),
		unaryAttachUsecaseInterceptor(cfg),
	)
	s := grpc.NewServer(ui)
	pb.RegisterReEarthVisualizerServer(s, internalapi.NewServer())

	return s
}

func unaryLogInterceptor(cfg *ServerConfig) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
		logger := log.GetLoggerFromContextOrDefault(ctx).WithCaller(false)

		method := info.FullMethod
		if idx := strings.LastIndex(info.FullMethod, "/"); idx != -1 {
			method = info.FullMethod[idx+1:]
		}

		logger.Infow(fmt.Sprintf("<-- RPC %s", method))
		startTime := time.Now()

		m, err := handler(ctx, req)

		duration := time.Since(startTime)
		if err != nil {
			logger.Errorw(fmt.Sprintf("--> RPC %s (%s), Error: %v", method, duration, err))
		} else {
			logger.Infow(fmt.Sprintf("--> RPC %s (%s)", method, duration))
		}

		return m, err
	}
}

func unaryAuthInterceptor(cfg *ServerConfig) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
		if info.FullMethod == "/reearth.visualizer.v1.ReEarthVisualizer/GetAllProjects" {
			// Check if this is a request for private projects
			// This checks if the request is for private projects
			if getProjectsReq, ok := req.(*pb.GetAllProjectsRequest); ok && getProjectsReq.GetVisibility() == pb.ProjectVisibility_PROJECT_VISIBILITY_PRIVATE {
				log.Infof("unaryAuthInterceptor: GetAllProjects request with private visibility, requiring authentication")
				return authenticateRequest(ctx, req, info, handler, cfg)
			}
			log.Infof("unaryAuthInterceptor: GetAllProjects request with public visibility, proceeding without authentication")
			return handler(ctx, req)
		}

		if isReadOnlyMethod(info.FullMethod) {
			return handler(ctx, req)
		}

		return authenticateRequest(ctx, req, info, handler, cfg)
	}
}

func authenticateRequest(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler, cfg *ServerConfig) (any, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		log.Errorf("authenticateRequest: no metadata found")
		return nil, errors.New("unauthorized")
	}

	// Allow ExportProject without a token.
	if info.FullMethod != "/reearth.visualizer.v1.ReEarthVisualizer/ExportProject" {
		token := tokenFromGrpcMetadata(md)
		if token == "" {
			log.Errorf("authenticateRequest: no token found")
			return nil, errors.New("unauthorized")
		}

		if token != cfg.Config.Visualizer.InternalApi.Token {
			log.Errorf("authenticateRequest: invalid token")
			return nil, errors.New("unauthorized")
		}
	} else {
		log.Infof("Skip token check.")
	}

	return handler(ctx, req)
}

func unaryAttachOperatorInterceptor(cfg *ServerConfig) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
		ctx = adapter.AttachCurrentHost(ctx, cfg.Config.Host)
		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			// For read-only methods, we can proceed without metadata
			if isReadOnlyMethod(info.FullMethod) {
				return handler(ctx, req)
			}
			log.Errorf("unaryAttachOperatorInterceptor: no metadata found")
			return nil, errors.New("unauthorized")
		}
		if len(md["user-id"]) < 1 {
			// For read-only methods, we can proceed without user-id
			if isReadOnlyMethod(info.FullMethod) {
				return handler(ctx, req)
			}
			log.Errorf("unaryAttachOperatorInterceptor: no user id found")
			return nil, errors.New("unauthorized")
		}

		userID, err := accountdomain.UserIDFrom(md["user-id"][0])
		if err != nil {
			log.Errorf("unaryAttachOperatorInterceptor: invalid user id")
			return nil, errors.New("unauthorized")
		}
		u, err := cfg.AccountRepos.User.FindByID(ctx, userID)
		if err != nil {
			log.Errorf("unaryAttachOperatorInterceptor: %v", err)
			return nil, rerror.ErrInternalBy(err)
		}

		if u != nil {
			op, err := generateOperator(ctx, cfg, u)
			if err != nil {
				return nil, err
			}
			ctx = adapter.AttachUser(ctx, u)
			ctx = adapter.AttachOperator(ctx, op)
			ctx = adapter.AttachCurrentHost(ctx, cfg.Config.Host)
		}

		return handler(ctx, req)
	}
}

func unaryAttachUsecaseInterceptor(cfg *ServerConfig) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {

		r := cfg.Repos
		g := cfg.Gateways
		ar := cfg.AccountRepos
		ag := cfg.AccountGateways

		uc := interactor.NewContainer(r, g, ar, ag, interactor.ContainerConfig{})
		ctx = adapter.AttachUsecases(ctx, &uc)
		ctx = adapter.AttachInternal(ctx, true)
		return handler(ctx, req)
	}
}

func isReadOnlyMethod(method string) bool {
	readOnlyMethods := []string{
		"v1.ReEarthVisualizer/GetProjectList",
		"v1.ReEarthVisualizer/GetAllProjects",
		"v1.ReEarthVisualizer/GetProject",
		"v1.ReEarthVisualizer/GetProjectByAlias",
		"v1.ReEarthVisualizer/ExportProject",
	}

	for _, readOnlyMethod := range readOnlyMethods {
		if strings.Contains(method, readOnlyMethod) {
			return true
		}
	}
	return false
}

func tokenFromGrpcMetadata(md metadata.MD) string {
	// The keys within metadata.MD are normalized to lowercase.
	// See: https://godoc.org/google.golang.org/grpc/metadata#New
	if len(md["authorization"]) < 1 {
		return ""
	}
	token := md["authorization"][0]
	if !strings.HasPrefix(token, "Bearer ") {
		return ""
	}
	token = strings.TrimPrefix(md["authorization"][0], "Bearer ")
	if token == "" {
		return ""
	}
	return token
}
