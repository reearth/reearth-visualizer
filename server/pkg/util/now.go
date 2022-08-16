package util

import "time"

var Now = time.Now

func MockNow(t time.Time) func() {
	Now = func() time.Time { return t }
	return func() { Now = time.Now }
}
