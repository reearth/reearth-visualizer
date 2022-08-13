<<<<<<< HEAD
ARG REEARTH_BACKEND_IMAGE=reearth/reearth-backend:latest
FROM $REEARTH_BACKEND_IMAGE

COPY web /reearth/web

WORKDIR /reearth
CMD [ "./reearth" ]
||||||| empty tree
=======
FROM golang:1.18-alpine AS build
ARG TAG=release
ARG REV
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

WORKDIR /reearth

CMD [ "./reearth" ]
>>>>>>> 276ef5f50090391639efeed7cb93d0da9979f39d
