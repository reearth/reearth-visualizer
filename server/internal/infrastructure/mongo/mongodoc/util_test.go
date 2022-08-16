package mongodoc

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestConvertDToM(t *testing.T) {
	assert.Equal(t, bson.M{"a": "b"}, convertDToM(bson.M{"a": "b"}))
	assert.Equal(t, bson.M{"a": "b"}, convertDToM(bson.D{{Key: "a", Value: "b"}}))
	assert.Equal(t, []interface{}{bson.M{"a": "b"}}, convertDToM([]bson.D{{{Key: "a", Value: "b"}}}))
	assert.Equal(t, []interface{}{bson.M{"a": "b"}}, convertDToM([]bson.M{{"a": "b"}}))
	assert.Equal(t, []interface{}{bson.M{"a": "b"}}, convertDToM(bson.A{bson.D{{Key: "a", Value: "b"}}}))
	assert.Equal(t, []interface{}{bson.M{"a": "b"}}, convertDToM([]interface{}{bson.D{{Key: "a", Value: "b"}}}))
}

func TestAppendI(t *testing.T) {
	assert.Equal(t, []interface{}{bson.M{"a": "b"}, "x"}, appendI([]bson.M{{"a": "b"}}, "x"))
	assert.Equal(t, []interface{}{bson.D{{Key: "a", Value: "b"}}, "x"}, appendI([]bson.D{{{Key: "a", Value: "b"}}}, "x"))
	assert.Equal(t, []interface{}{bson.D{{Key: "a", Value: "b"}}, "x"}, appendI(bson.A{bson.D{{Key: "a", Value: "b"}}}, "x"))
	assert.Equal(t, []interface{}{bson.D{{Key: "a", Value: "b"}}, "x"}, appendI([]interface{}{bson.D{{Key: "a", Value: "b"}}}, "x"))
}

func TestAppendE(t *testing.T) {
	assert.Equal(t, bson.M{"a": "b", "c": "d"}, appendE(bson.M{"a": "b"}, bson.E{Key: "c", Value: "d"}))
	assert.Equal(t, bson.D{{Key: "a", Value: "b"}, {Key: "c", Value: "d"}}, appendE(bson.D{{Key: "a", Value: "b"}}, bson.E{Key: "c", Value: "d"}))
	assert.Equal(t, []bson.M{}, appendE([]bson.M{}, bson.E{Key: "c", Value: "d"}))
}

func TestGetE(t *testing.T) {
	assert.Equal(t, "b", getE(bson.M{"a": "b"}, "a"))
	assert.Nil(t, getE(bson.M{"a": "b"}, "b"))
	assert.Equal(t, "b", getE(bson.D{{Key: "a", Value: "b"}}, "a"))
	assert.Nil(t, getE(bson.D{{Key: "a", Value: "b"}}, "b"))
	assert.Nil(t, getE(bson.A{}, "b"))
}

func TestAnd(t *testing.T) {
	assert.Equal(t, bson.M{"x": "y"}, And(bson.M{}, "x", "y"))
	assert.Equal(t, bson.M{"x": "z"}, And(bson.M{"x": "z"}, "x", "y"))
	assert.Equal(t, bson.M{"x": "z"}, And(bson.M{"x": "z"}, "", nil))
	assert.Equal(t, bson.M{"x": "z"}, And(bson.M{"x": "z"}, "", bson.M(nil)))
	assert.Equal(t, bson.M{"x": "z"}, And(bson.M{"x": "z"}, "", bson.D(nil)))
	assert.Equal(t, bson.M{"x": "z"}, And(bson.M{"x": "z"}, "", bson.A(nil)))
	assert.Equal(t, bson.M{"x": "z"}, And(bson.M{"x": "z"}, "", []bson.M(nil)))
	assert.Equal(t, bson.M{"x": "z"}, And(bson.M{"x": "z"}, "", []bson.D(nil)))
	assert.Equal(t, bson.M{"x": "z"}, And(bson.M{"x": "z"}, "", []bson.A(nil)))
	assert.Equal(t, bson.M{"x": "z"}, And(bson.M{"x": "z"}, "", []interface{}(nil)))
	assert.Equal(t, bson.M{
		"$and": []interface{}{
			bson.M{"$or": []bson.M{{"a": "b"}}},
			bson.M{"x": "y"},
		},
	}, And(bson.M{"$or": []bson.M{{"a": "b"}}}, "x", "y"))
	assert.Equal(t, bson.M{
		"$and": []interface{}{
			bson.M{"a": "b"},
			bson.M{"x": "y"},
		},
	}, And(bson.M{"$and": []bson.M{{"a": "b"}}}, "x", "y"))
	assert.Equal(t, bson.M{
		"$and": []interface{}{
			bson.M{"a": "b"},
			bson.M{"x": "y"},
		},
	}, And(bson.M{"$and": []interface{}{bson.M{"a": "b"}}}, "x", "y"))

	assert.Equal(t, bson.D{{Key: "x", Value: "y"}}, And(bson.D{}, "x", "y"))
	assert.Equal(t, bson.D{{Key: "x", Value: "z"}}, And(bson.D{{Key: "x", Value: "z"}}, "x", "y"))
	assert.Equal(t, bson.M{
		"$and": []interface{}{
			bson.D{{Key: "$or", Value: []bson.M{{"a": "b"}}}},
			bson.M{"x": "y"},
		},
	}, And(bson.D{{Key: "$or", Value: []bson.M{{"a": "b"}}}}, "x", "y"))
	assert.Equal(t, bson.M{
		"$and": []interface{}{
			bson.M{"a": "b"},
			bson.M{"x": "y"},
		},
	}, And(bson.D{{Key: "$and", Value: []bson.M{{"a": "b"}}}}, "x", "y"))

	assert.Equal(t, bson.M{"$and": []interface{}{bson.M{}, "y"}}, And(bson.M{}, "", "y"))
	assert.Equal(t, bson.M{"$and": []interface{}{bson.D{}, "y"}}, And(bson.D{}, "", "y"))
	assert.Equal(t, bson.M{
		"$and": []interface{}{
			bson.D{{Key: "$or", Value: []bson.M{{"a": "b"}}}},
			"y",
		},
	}, And(bson.D{{Key: "$or", Value: []bson.M{{"a": "b"}}}}, "", "y"))
	assert.Equal(t, bson.M{
		"$and": []interface{}{
			bson.M{"a": "b"},
			"y",
		},
	}, And(bson.D{{Key: "$and", Value: []bson.M{{"a": "b"}}}}, "", "y"))
}
