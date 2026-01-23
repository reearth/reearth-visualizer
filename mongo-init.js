// MongoDB Replica Set Initialization Script
// Initialize with localhost for reliability
// Services will connect using directConnection=true

rs.initiate({
  _id: "rs0",
  members: [{ _id: 0, host: "localhost:27017" }],
});

print("✓ Replica set initiated with localhost:27017");
print("Services should connect with ?directConnection=true parameter");

rs.status();
