package migration

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
)

func UpdatePolicyEnforcement(ctx context.Context, c DBClient) error {
	col := c.Collection("policy")

	// Update the "free" policy
	err := col.SetOne(ctx, "free", bson.M{
		"nlslayerscount": 50,
		"pagecount":      10,
		"blockscount":    20,
	})
	if err != nil {
		return err
	}

	// Update the "team" policy
	err = col.SetOne(ctx, "team", bson.M{
		"nlslayerscount": 1000,
		"pagecount":      50,
		"blockscount":    50,
	})
	return err
}
