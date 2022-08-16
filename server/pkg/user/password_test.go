package user

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

func TestBcryptPasswordEncoder(t *testing.T) {
	got, err := (&BcryptPasswordEncoder{}).Encode("abc")
	assert.NoError(t, err)
	err = bcrypt.CompareHashAndPassword(got, []byte("abc"))
	assert.NoError(t, err)

	ok, err := (&BcryptPasswordEncoder{}).Verify("abc", got)
	assert.NoError(t, err)
	assert.True(t, ok)
	ok, err = (&BcryptPasswordEncoder{}).Verify("abcd", got)
	assert.NoError(t, err)
	assert.False(t, ok)
}

func TestMockPasswordEncoder(t *testing.T) {
	got, err := (&MockPasswordEncoder{Mock: []byte("ABC")}).Encode("ABC")
	assert.NoError(t, err)
	assert.Equal(t, got, []byte("ABC"))
	got, err = (&MockPasswordEncoder{Mock: []byte("ABC")}).Encode("abc")
	assert.NoError(t, err)
	assert.Equal(t, got, []byte("ABC"))

	ok, err := (&MockPasswordEncoder{Mock: []byte("ABC")}).Verify("ABC", got)
	assert.NoError(t, err)
	assert.True(t, ok)
	ok, err = (&MockPasswordEncoder{Mock: []byte("ABC")}).Verify("abc", got)
	assert.NoError(t, err)
	assert.False(t, ok)
}

func TestNoopPasswordEncoder(t *testing.T) {
	got, err := (&NoopPasswordEncoder{}).Encode("abc")
	assert.NoError(t, err)
	assert.Equal(t, got, []byte("abc"))

	ok, err := (&NoopPasswordEncoder{}).Verify("abc", got)
	assert.NoError(t, err)
	assert.True(t, ok)
	ok, err = (&NoopPasswordEncoder{}).Verify("abcd", got)
	assert.NoError(t, err)
	assert.False(t, ok)
}
