rs.initiate({
  _id: "rs0",
  members: [{ _id: 0, host: "reearth-mongo:27017" }],
});

rs.status();
