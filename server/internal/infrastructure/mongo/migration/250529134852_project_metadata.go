package migration

import "context"

func ProjectMetadata(ctx context.Context, c DBClient) error {
	// TODO: Write your migration code here

	// WARNING:
	// If the migration takes too long, the deployment may fail in a serverless environment.
	// Set the batch size to as large a value as possible without using up the RAM of the deployment destination.

	return nil
}
