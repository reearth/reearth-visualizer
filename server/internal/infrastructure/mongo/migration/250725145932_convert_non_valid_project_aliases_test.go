package migration

import (
	"context"
	"regexp"
	"strings"
	"testing"

	"github.com/go-playground/validator/v10"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// go test -v -run TestConvertNonValidProjectAliases ./internal/infrastructure/mongo/migration/...

func TestConvertNonValidProjectAliases(t *testing.T) {
	db := mongotest.Connect(t)(t)
	c := mongox.NewClientWithDatabase(db)
	ctx := context.Background()
	projectCollection := c.WithCollection("project").Client()

	t.Run("success: convert various invalid aliases to valid ones", func(t *testing.T) {
		// Cleanup
		err := projectCollection.Drop(ctx)
		require.NoError(t, err)

		// Setup test data with various invalid aliases
		setupTestDataWithInvalidAliases(t, ctx, db)

		// Execute migration
		err = ConvertNonValidProjectAliases(ctx, c)
		assert.NoError(t, err)

		// Verify all aliases are now valid
		verifyAllAliasesValid(t, ctx, db)
	})

	t.Run("success: handle projects with spaces in aliases", func(t *testing.T) {
		// Cleanup
		err := projectCollection.Drop(ctx)
		require.NoError(t, err)

		// Setup test data
		testProjects := []interface{}{
			bson.M{
				"_id":          "id1",
				"id":           "project1",
				"projectalias": "My Project Name",
				"name":         "Test Project 1",
			},
			bson.M{
				"_id":          "id2",
				"id":           "project2",
				"projectalias": "Another Test Project",
				"name":         "Test Project 2",
			},
		}
		_, err = db.Collection("project").InsertMany(ctx, testProjects)
		require.NoError(t, err)

		// Execute migration
		err = ConvertNonValidProjectAliases(ctx, c)
		assert.NoError(t, err)

		// Verify spaces are replaced with dashes and converted to lowercase
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		assert.Equal(t, "my-project-name", project1["projectalias"])

		var project2 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project2"}).Decode(&project2)
		require.NoError(t, err)
		assert.Equal(t, "another-test-project", project2["projectalias"])
	})

	t.Run("success: handle consecutive special characters", func(t *testing.T) {
		// Cleanup
		err := projectCollection.Drop(ctx)
		require.NoError(t, err)

		// Setup test data with consecutive special characters
		testProjects := []interface{}{
			bson.M{
				"_id":          "id1",
				"id":           "project1",
				"projectalias": "test--alias",
				"name":         "Test Project 1",
			},
			bson.M{
				"_id":          "id2",
				"id":           "project2",
				"projectalias": "test__alias",
				"name":         "Test Project 2",
			},
			bson.M{
				"_id":          "id3",
				"id":           "project3",
				"projectalias": "test..alias",
				"name":         "Test Project 3",
			},
			bson.M{
				"_id":          "id4",
				"id":           "project4",
				"projectalias": "test@@alias",
				"name":         "Test Project 4",
			},
		}
		_, err = db.Collection("project").InsertMany(ctx, testProjects)
		require.NoError(t, err)

		// Execute migration
		err = ConvertNonValidProjectAliases(ctx, c)
		assert.NoError(t, err)

		// Verify consecutive characters are reduced to single characters
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		assert.Equal(t, "test-alias", project1["projectalias"])

		var project2 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project2"}).Decode(&project2)
		require.NoError(t, err)
		assert.Equal(t, "test_alias", project2["projectalias"])

		var project3 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project3"}).Decode(&project3)
		require.NoError(t, err)
		assert.Equal(t, "test.alias", project3["projectalias"])
	})

	t.Run("success: handle email addresses", func(t *testing.T) {
		// Cleanup
		err := projectCollection.Drop(ctx)
		require.NoError(t, err)

		// Setup test data with email addresses
		testProjects := []interface{}{
			bson.M{
				"_id":          "id1",
				"id":           "project1",
				"projectalias": "user@example.com",
				"name":         "Test Project 1",
			},
			bson.M{
				"_id":          "id2",
				"id":           "project2",
				"projectalias": "test.user@domain.org",
				"name":         "Test Project 2",
			},
		}
		_, err = db.Collection("project").InsertMany(ctx, testProjects)
		require.NoError(t, err)

		// Execute migration
		err = ConvertNonValidProjectAliases(ctx, c)
		assert.NoError(t, err)

		// Verify email addresses are replaced with random strings
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		alias1 := project1["projectalias"].(string)
		assert.Len(t, alias1, 10)
		assert.Regexp(t, "^[a-z]{10}$", alias1)

		var project2 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project2"}).Decode(&project2)
		require.NoError(t, err)
		alias2 := project2["projectalias"].(string)
		assert.Len(t, alias2, 10)
		assert.Regexp(t, "^[a-z]{10}$", alias2)
	})

	t.Run("success: handle regex non-matching aliases", func(t *testing.T) {
		// Cleanup
		err := projectCollection.Drop(ctx)
		require.NoError(t, err)

		// Setup test data with regex non-matching aliases
		testProjects := []interface{}{
			bson.M{
				"_id":          "id1",
				"id":           "project1",
				"projectalias": "UPPERCASE",
				"name":         "Test Project 1",
			},
			bson.M{
				"_id":          "id2",
				"id":           "project2",
				"projectalias": "special$chars!",
				"name":         "Test Project 2",
			},
			bson.M{
				"_id":          "id3",
				"id":           "project3",
				"projectalias": "-starts-with-dash",
				"name":         "Test Project 3",
			},
			bson.M{
				"_id":          "id4",
				"id":           "project4",
				"projectalias": "ends-with-dash-",
				"name":         "Test Project 4",
			},
		}
		_, err = db.Collection("project").InsertMany(ctx, testProjects)
		require.NoError(t, err)

		// Execute migration
		err = ConvertNonValidProjectAliases(ctx, c)
		assert.NoError(t, err)

		// Verify all aliases are replaced with random strings
		cursor, err := projectCollection.Find(ctx, bson.M{})
		require.NoError(t, err)
		defer cursor.Close(ctx)

		nameRegex := regexp.MustCompile(`^[a-z0-9](?:[a-z0-9-_@.]{0,61}[a-z0-9])?$`)
		for cursor.Next(ctx) {
			var project bson.M
			err := cursor.Decode(&project)
			require.NoError(t, err)
			alias := project["projectalias"].(string)
			assert.True(t, nameRegex.MatchString(alias), "alias %s should match regex", alias)
		}
	})

	t.Run("success: handle validation failures", func(t *testing.T) {
		// Cleanup
		err := projectCollection.Drop(ctx)
		require.NoError(t, err)

		// Setup test data with non-printable ASCII characters
		testProjects := []interface{}{
			bson.M{
				"_id":          "id1",
				"id":           "project1",
				"projectalias": "test\x00alias", // Contains null character
				"name":         "Test Project 1",
			},
		}
		_, err = db.Collection("project").InsertMany(ctx, testProjects)
		require.NoError(t, err)

		// Execute migration
		err = ConvertNonValidProjectAliases(ctx, c)
		assert.NoError(t, err)

		// Verify alias is replaced with random string
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		alias1 := project1["projectalias"].(string)
		assert.Len(t, alias1, 10)
		assert.Regexp(t, "^[a-z]{10}$", alias1)

		// Verify the alias passes validation
		var tempAlias TempProjectAlias
		tempAlias.Alias = alias1
		validate := validator.New()
		err = validate.Struct(&tempAlias)
		assert.NoError(t, err)
	})

	t.Run("success: handle missing projectalias field", func(t *testing.T) {
		// Cleanup
		err := projectCollection.Drop(ctx)
		require.NoError(t, err)

		// Setup test data without projectalias field
		testProjects := []interface{}{
			bson.M{
				"_id":  "id1",
				"id":   "project1",
				"name": "Test Project 1",
			},
		}
		_, err = db.Collection("project").InsertMany(ctx, testProjects)
		require.NoError(t, err)

		// Execute migration
		err = ConvertNonValidProjectAliases(ctx, c)
		assert.NoError(t, err)

		// Verify a valid alias is generated
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		alias1 := project1["projectalias"].(string)
		assert.Len(t, alias1, 10)
		assert.Regexp(t, "^[a-z]{10}$", alias1)
	})

	t.Run("success: handle empty projectalias field", func(t *testing.T) {
		// Cleanup
		err := projectCollection.Drop(ctx)
		require.NoError(t, err)

		// Setup test data with empty projectalias
		testProjects := []interface{}{
			bson.M{
				"_id":          "id1",
				"id":           "project1",
				"projectalias": "",
				"name":         "Test Project 1",
			},
		}
		_, err = db.Collection("project").InsertMany(ctx, testProjects)
		require.NoError(t, err)

		// Execute migration
		err = ConvertNonValidProjectAliases(ctx, c)
		assert.NoError(t, err)

		// Verify a valid alias is generated
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		alias1 := project1["projectalias"].(string)
		assert.Len(t, alias1, 10)
		assert.Regexp(t, "^[a-z]{10}$", alias1)
	})

	t.Run("success: handle mixed case and special characters", func(t *testing.T) {
		// Cleanup
		err := projectCollection.Drop(ctx)
		require.NoError(t, err)

		// Setup test data
		testProjects := []interface{}{
			bson.M{
				"_id":          "id1",
				"id":           "project1",
				"projectalias": "MyProject_123",
				"name":         "Test Project 1",
			},
		}
		_, err = db.Collection("project").InsertMany(ctx, testProjects)
		require.NoError(t, err)

		// Execute migration
		err = ConvertNonValidProjectAliases(ctx, c)
		assert.NoError(t, err)

		// Verify mixed case is converted to lowercase
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		assert.Equal(t, "myproject_123", project1["projectalias"])
	})

	t.Run("success: handle document without id field", func(t *testing.T) {
		// Recreate database and collection
		db = mongotest.Connect(t)(t)
		c = mongox.NewClientWithDatabase(db)
		projectCollection = c.WithCollection("project").Client()

		// Setup test data without id field
		testProjects := []interface{}{
			bson.M{
				"_id":          "id1",
				"projectalias": "test-alias",
				"name":         "Test Project 1",
			},
			bson.M{
				"_id":          "id2",
				"id":           "project2",
				"projectalias": "valid-alias",
				"name":         "Test Project 2",
			},
		}
		_, err := db.Collection("project").InsertMany(ctx, testProjects)
		require.NoError(t, err)

		// Execute migration (should skip document without id and continue)
		err = ConvertNonValidProjectAliases(ctx, c)
		assert.NoError(t, err)

		// Verify valid project was processed
		var project2 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project2"}).Decode(&project2)
		require.NoError(t, err)
		assert.Equal(t, "valid-alias", project2["projectalias"])
	})

	t.Run("success: handle document with non-string id field", func(t *testing.T) {
		// Cleanup
		err := projectCollection.Drop(ctx)
		require.NoError(t, err)

		// Setup test data with non-string id field
		testProjects := []interface{}{
			bson.M{
				"_id":          "id1",
				"id":           123, // Non-string id
				"projectalias": "test-alias",
				"name":         "Test Project 1",
			},
			bson.M{
				"_id":          "id2",
				"id":           "project2",
				"projectalias": "valid-alias",
				"name":         "Test Project 2",
			},
		}
		_, err = db.Collection("project").InsertMany(ctx, testProjects)
		require.NoError(t, err)

		// Execute migration (should skip document with non-string id and continue)
		err = ConvertNonValidProjectAliases(ctx, c)
		assert.NoError(t, err)

		// Verify valid project was processed
		var project2 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project2"}).Decode(&project2)
		require.NoError(t, err)
		assert.Equal(t, "valid-alias", project2["projectalias"])
	})

	t.Run("success: handle japanese characters", func(t *testing.T) {
		// Cleanup
		err := projectCollection.Drop(ctx)
		require.NoError(t, err)

		// Setup test data with Japanese characters
		testProjects := []interface{}{
			bson.M{
				"_id":          "id1",
				"id":           "project1",
				"projectalias": "プロジェクト",
				"name":         "Test Project 1",
			},
			bson.M{
				"_id":          "id2",
				"id":           "project2",
				"projectalias": "テスト-プロジェクト",
				"name":         "Test Project 2",
			},
			bson.M{
				"_id":          "id3",
				"id":           "project3",
				"projectalias": "マイ・プロジェクト",
				"name":         "Test Project 3",
			},
		}
		_, err = db.Collection("project").InsertMany(ctx, testProjects)
		require.NoError(t, err)

		// Execute migration
		err = ConvertNonValidProjectAliases(ctx, c)
		assert.NoError(t, err)

		// Verify all Japanese characters are replaced with random strings
		cursor, err := projectCollection.Find(ctx, bson.M{})
		require.NoError(t, err)
		defer cursor.Close(ctx)

		for cursor.Next(ctx) {
			var project bson.M
			err := cursor.Decode(&project)
			require.NoError(t, err)
			alias := project["projectalias"].(string)

			// Should be random generated string (10 lowercase letters)
			assert.Len(t, alias, 10)
			assert.Regexp(t, "^[a-z]{10}$", alias)

			// Should not contain any Japanese characters
			assert.NotContains(t, alias, "プロジェクト")
			assert.NotContains(t, alias, "テスト")
			assert.NotContains(t, alias, "マイ")
		}
	})

	t.Run("success: handle already valid aliases", func(t *testing.T) {
		// Cleanup
		err := projectCollection.Drop(ctx)
		require.NoError(t, err)

		// Setup test data with already valid aliases
		testProjects := []interface{}{
			bson.M{
				"_id":          "id1",
				"id":           "project1",
				"projectalias": "valid-alias",
				"name":         "Test Project 1",
			},
			bson.M{
				"_id":          "id2",
				"id":           "project2",
				"projectalias": "another-valid-alias123",
				"name":         "Test Project 2",
			},
		}
		_, err = db.Collection("project").InsertMany(ctx, testProjects)
		require.NoError(t, err)

		// Execute migration
		err = ConvertNonValidProjectAliases(ctx, c)
		assert.NoError(t, err)

		// Verify aliases remain unchanged
		var project1 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project1"}).Decode(&project1)
		require.NoError(t, err)
		assert.Equal(t, "valid-alias", project1["projectalias"])

		var project2 bson.M
		err = projectCollection.FindOne(ctx, bson.M{"id": "project2"}).Decode(&project2)
		require.NoError(t, err)
		assert.Equal(t, "another-valid-alias123", project2["projectalias"])
	})
}

func setupTestDataWithInvalidAliases(t *testing.T, ctx context.Context, db *mongo.Database) {
	testProjects := []interface{}{
		bson.M{
			"_id":          "id1",
			"id":           "project1",
			"projectalias": "My Project Name",
			"name":         "Test Project 1",
		},
		bson.M{
			"_id":          "id2",
			"id":           "project2",
			"projectalias": "test--alias",
			"name":         "Test Project 2",
		},
		bson.M{
			"_id":          "id3",
			"id":           "project3",
			"projectalias": "user@example.com",
			"name":         "Test Project 3",
		},
		bson.M{
			"_id":          "id4",
			"id":           "project4",
			"projectalias": "UPPERCASE",
			"name":         "Test Project 4",
		},
		bson.M{
			"_id":          "id5",
			"id":           "project5",
			"projectalias": "special$chars!",
			"name":         "Test Project 5",
		},
	}
	_, err := db.Collection("project").InsertMany(ctx, testProjects)
	require.NoError(t, err)
}

func verifyAllAliasesValid(t *testing.T, ctx context.Context, db *mongo.Database) {
	cursor, err := db.Collection("project").Find(ctx, bson.M{})
	require.NoError(t, err)
	defer cursor.Close(ctx)

	nameRegex := regexp.MustCompile(`^[a-z0-9](?:[a-z0-9-_@.]{0,61}[a-z0-9])?$`)
	validate := validator.New()

	for cursor.Next(ctx) {
		var project bson.M
		err := cursor.Decode(&project)
		require.NoError(t, err)

		alias := project["projectalias"].(string)

		// Test regex validation
		assert.True(t, nameRegex.MatchString(alias), "alias %s should match regex", alias)

		// Test validator validation
		var tempAlias TempProjectAlias
		tempAlias.Alias = alias
		err = validate.Struct(&tempAlias)
		assert.NoError(t, err, "alias %s should pass validation", alias)

		// Test that alias is printable ASCII
		assert.True(t, isPrintableASCII(alias), "alias %s should be printable ASCII", alias)
	}
}

func isPrintableASCII(s string) bool {
	for _, r := range s {
		if r < 32 || r > 126 {
			return false
		}
	}
	return true
}

func TestTempProjectAlias(t *testing.T) {
	validate := validator.New()

	t.Run("valid aliases", func(t *testing.T) {
		validAliases := []string{
			"a",
			"ab",
			"test-alias",
			"test_alias",
			"test.alias",
			"test@alias",
			"a1b2c3",
			"test-alias-123",
			strings.Repeat("a", 63), // Max length
		}

		for _, alias := range validAliases {
			tempAlias := TempProjectAlias{Alias: alias}
			err := validate.Struct(&tempAlias)
			assert.NoError(t, err, "alias %s should be valid", alias)
		}
	})

	t.Run("invalid aliases", func(t *testing.T) {
		invalidAliases := []string{
			"",              // Empty
			"\x00test",      // Contains null character
			"test\x01alias", // Contains control character
			"test\x7falias", // Contains DEL character
			"tëst",          // Contains non-ASCII character
		}

		for _, alias := range invalidAliases {
			tempAlias := TempProjectAlias{Alias: alias}
			err := validate.Struct(&tempAlias)
			assert.Error(t, err, "alias %s should be invalid", alias)
		}
	})

	t.Run("long aliases are valid for validator but handled by regex", func(t *testing.T) {
		// The validator only checks printascii, not length
		// Length is handled by the regex in the migration function
		longAlias := strings.Repeat("a", 64)
		tempAlias := TempProjectAlias{Alias: longAlias}
		validate := validator.New()
		err := validate.Struct(&tempAlias)
		assert.NoError(t, err, "long alias should pass validator (length handled by regex)")
	})
}
