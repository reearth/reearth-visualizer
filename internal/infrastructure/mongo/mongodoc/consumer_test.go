package mongodoc

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

var _ Consumer = FuncConsumer(nil)

func TestBatchConsumer(t *testing.T) {
	c := &BatchConsumer{
		Size: 10,
		Callback: func(r []bson.Raw) error {
			assert.Equal(t, []bson.Raw{[]byte{0}, []byte{1}, []byte{2}, []byte{3}, []byte{4}}, r)
			return nil
		},
	}

	for i := 0; i < 5; i++ {
		r := bson.Raw([]byte{byte(i)})
		assert.Nil(t, c.Consume(r))
	}
	assert.Nil(t, c.Consume(nil))
}

func TestBatchConsumerWithManyRows(t *testing.T) {
	counter := 0
	c := &BatchConsumer{
		Size: 1,
		Callback: func(r []bson.Raw) error {
			if counter >= 5 {
				assert.Equal(t, []bson.Raw{}, r)
				return nil
			}
			assert.Equal(t, []bson.Raw{[]byte{byte(counter)}}, r)
			counter++
			return nil
		},
	}

	for i := 0; i < 5; i++ {
		r := bson.Raw([]byte{byte(i)})
		assert.Nil(t, c.Consume(r))
	}
	assert.Nil(t, c.Consume(nil))
}

func TestBatchConsumerWithError(t *testing.T) {
	c := &BatchConsumer{
		Size: 1,
		Callback: func(r []bson.Raw) error {
			return errors.New("hoge")
		},
	}

	assert.EqualError(t, c.Consume(nil), "hoge")
}
