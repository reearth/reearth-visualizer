ARG REEARTH_BACKEND_IMAGE=reearth/reearth-backend:latest
FROM $REEARTH_BACKEND_IMAGE

COPY web /reearth/web

WORKDIR /reearth
CMD [ "./reearth" ]
