package gqlerror

import (
	"errors"
	"strings"
)

type AccountsError error

var ErrUnauthorized AccountsError = errors.New("unauthorized")

func ReturnAccountsError(err error) AccountsError {
	if strings.Contains(err.Error(), "401") {
		return ErrUnauthorized
	}
	return nil
}
