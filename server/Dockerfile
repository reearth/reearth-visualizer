FROM golang:1.21-alpine AS build
ARG TAG=release
ARG VERSION

RUN apk add --update --no-cache git ca-certificates build-base

COPY go.mod go.sum main.go /reearth/
WORKDIR /reearth
RUN go mod download

COPY cmd/ /reearth/cmd/
COPY pkg/ /reearth/pkg/
COPY internal/ /reearth/internal/

RUN CGO_ENABLED=0 go build -tags "${TAG}" "-ldflags=-X main.version=${VERSION} -s -w -buildid=" -trimpath ./cmd/reearth

FROM scratch

COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build /reearth/reearth /reearth/reearth
COPY web* /reearth/web/

WORKDIR /reearth

CMD [ "./reearth" ]
