package user

import "github.com/oklog/ulid/v2"

type ID = string

func NewID() string {
	return ulid.Make().String()
}

type IDList []ID
