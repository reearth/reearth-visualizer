package writer

import (
	"errors"
	"io"
)

// reference: https://stackoverflow.com/questions/45836767/using-an-io-writeseeker-without-a-file-in-go
type WriterSeeker struct {
	buffer   []byte
	position int
}

func (sc *WriterSeeker) Write(p []byte) (int, error) {
	minCap := sc.position + len(p)
	if minCap > cap(sc.buffer) {
		b2 := make([]byte, len(sc.buffer), minCap+len(p))
		copy(b2, sc.buffer)
		sc.buffer = b2
	}
	if minCap > len(sc.buffer) {
		sc.buffer = sc.buffer[:minCap]
	}
	copy(sc.buffer[sc.position:], p)
	sc.position += len(p)
	return len(p), nil
}

func (sc *WriterSeeker) Seek(offset int64, whence int) (int64, error) {
	newPos, offs := 0, int(offset)
	switch whence {
	case io.SeekStart:
		newPos = offs
	case io.SeekCurrent:
		newPos = sc.position + offs
	case io.SeekEnd:
		newPos = len(sc.buffer) + offs
	}
	if newPos < 0 {
		return 0, errors.New("negative result pos")
	}
	sc.position = newPos
	return int64(newPos), nil
}

func (sc *WriterSeeker) WriteTo(w io.Writer) (int64, error) {
	i, err := w.Write(sc.buffer)
	return int64(i), err
}

func (sc *WriterSeeker) Buffer() []byte {
	b := make([]byte, len(sc.buffer))
	copy(b, sc.buffer)
	return b
}
