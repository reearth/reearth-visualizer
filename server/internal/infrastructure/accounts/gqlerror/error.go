package gqlerror

import (
	"errors"
	"strings"
)

type AccountsError error

var ErrUnauthorized AccountsError = errors.New("unauthorized")

func ReturnAccountsError(err error) error {
	if err == nil {
		return nil
	}
	if strings.Contains(err.Error(), "401") {
		return ErrUnauthorized
	}
	// Return the original error instead of nil
	return err
}
