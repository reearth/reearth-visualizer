FROM golang:1.18-alpine AS build
ARG TAG=release
ARG REV
ARG VERSION

RUN apk add --update --no-cache git ca-certificates build-base

COPY server/go.mod server/go.sum server/main.go /reearth/
WORKDIR /reearth
RUN go mod download

COPY server/cmd/ /reearth/cmd/
COPY server/pkg/ /reearth/pkg/
COPY server/internal/ /reearth/internal/

RUN CGO_ENABLED=0 go build -tags "${TAG}" "-ldflags=-X main.version=${VERSION} -s -w -buildid=" -trimpath ./cmd/reearth

FROM scratch

COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build /reearth/reearth /reearth/reearth
COPY reearth-web* /reearth/web/

WORKDIR /reearth

CMD [ "./reearth" ]
