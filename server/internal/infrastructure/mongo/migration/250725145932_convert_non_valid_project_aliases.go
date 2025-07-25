package migration

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/gommon/random"
	"github.com/reearth/reearthx/log"
	"go.mongodb.org/mongo-driver/bson"
)

type TempProjectAlias struct {
	Alias string `validate:"required,printascii"`
}

func ConvertNonValidProjectAliases(ctx context.Context, c DBClient) error {
	col := c.WithCollection("project").Client()
	nameRegex := regexp.MustCompile(`^[a-z0-9](?:[a-z0-9-_@.]{0,61}[a-z0-9])?$`)

	cursor, err := col.Find(ctx, bson.M{})
	if err != nil {
		return fmt.Errorf("failed to find documents in project: %w", err)
	}
	defer func() {
		if err := cursor.Close(ctx); err != nil {
			log.Printf("failed to close cursor for project: %v", err)
		}
	}()

	var updateCount int64
	for cursor.Next(ctx) {
		var doc bson.M
		if err := cursor.Decode(&doc); err != nil {
			log.Printf("failed to decode document: %v", err)
			continue
		}

		_, ok := doc["id"].(string)
		if !ok {
			log.Printf("document missing id field or id is not string: %v", doc["_id"])
			continue
		}

		projectAlias, _ := doc["projectalias"].(string)
		projectAlias = strings.ReplaceAll(projectAlias, " ", "-")
		projectAlias = strings.ToLower(projectAlias)

		// multiple consecutive characters check
		chars := []string{"-", "_", ".", "@"}
		for _, char := range chars {
			if strings.Contains(projectAlias, char+char) {
				projectAlias = strings.ReplaceAll(projectAlias, char+char, char)
			}
		}

		// email address check
		if strings.Contains(projectAlias, "@") && strings.Contains(projectAlias, ".") {
			projectAlias = random.String(10, random.Lowercase)
		}

		// validate alias against regex
		if !nameRegex.MatchString(projectAlias) {
			projectAlias = random.String(10, random.Lowercase)
		}

		var tempAlias TempProjectAlias
		tempAlias.Alias = projectAlias

		validate := validator.New()
		if err := validate.Struct(&tempAlias); err != nil {
			var invalidValidationError *validator.InvalidValidationError
			if errors.As(err, &invalidValidationError) {
				return err
			}

			projectAlias = random.String(10, random.Lowercase)
		}

		filter := bson.M{"_id": doc["_id"]}
		update := bson.M{"$set": bson.M{"projectalias": projectAlias}}

		result, err := col.UpdateOne(ctx, filter, update)
		if err != nil {
			log.Printf("failed to update document %v: %v", doc["_id"], err)
			continue
		}

		if result.ModifiedCount > 0 {
			updateCount++
			log.Printf("added projectalias '%s' to document %v", projectAlias, doc["_id"])
		}
	}

	if err := cursor.Err(); err != nil {
		return fmt.Errorf("cursor error: %w", err)
	}

	log.Printf("migration completed: updated %d documents", updateCount)
	return nil
}
