package util

func Must[T any](v T, err error) T {
	if err != nil {
		panic(err)
	}
	return v
}

func IsZero[T comparable](v T) bool {
	var z T
	return v == z
}

func IsNotZero[T comparable](v T) bool {
	return !IsZero(v)
}

func Deref[T any](r *T) T {
	if r == nil {
		var z T
		return z
	}
	return *r
}
