package writer

import (
	"bytes"
	"errors"
	"io"
	"testing"

	"github.com/stretchr/testify/assert"
)

var _ io.WriteSeeker = (*WriterSeeker)(nil)

//reference: https://github.com/orcaman/writerseeker/blob/master/writerseeker_test.go

func TestWrite(t *testing.T) {
	testCases := []struct {
		Name             string
		Input            []byte
		WS               *WriterSeeker
		ExpectedBuffer   []byte
		ExpectedPosition int
		err              error
	}{
		{
			Name:             "write a string",
			Input:            []byte("xxxx"),
			WS:               &WriterSeeker{},
			ExpectedBuffer:   []byte("xxxx"),
			ExpectedPosition: 4,
			err:              nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			n, err := tc.WS.Write(tc.Input)
			if err == nil {
				assert.Equal(tt, tc.ExpectedBuffer, tc.WS.Buffer())
				assert.Equal(tt, tc.ExpectedPosition, n)
			} else {
				assert.True(tt, errors.As(err, &tc.err))
			}
		})
	}
}

func TestSeek(t *testing.T) {
	ws := &WriterSeeker{}
	_, _ = ws.Write([]byte("xxxxxx"))

	testCases := []struct {
		Name                     string
		WS                       *WriterSeeker
		Whence                   int
		Offset, ExpectedPosition int64
		err                      error
	}{
		{
			Name:             "whence start",
			WS:               ws,
			Offset:           1,
			Whence:           0, // could use io.SeekStart as well
			ExpectedPosition: 1,
			err:              nil,
		},
		{
			Name:             "whence current position",
			WS:               ws,
			Offset:           1,
			Whence:           1,
			ExpectedPosition: 2,
			err:              nil,
		},
		{
			Name:             "end position",
			WS:               ws,
			Offset:           1,
			Whence:           2,
			ExpectedPosition: 7,
			err:              nil,
		},
		{
			Name:             "fail negative position",
			WS:               ws,
			Offset:           -100,
			Whence:           0,
			ExpectedPosition: 0,
			err:              errors.New("negative result pos"),
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			// this test is sequential
			//tt.Parallel()
			n, err := tc.WS.Seek(tc.Offset, tc.Whence)
			if err == nil {
				assert.Equal(tt, tc.ExpectedPosition, n)
			} else {
				assert.True(tt, errors.As(err, &tc.err))
			}
		})
	}
}

func TestWriterSeeker_WriteTo(t *testing.T) {
	ws := &WriterSeeker{}
	buf := bytes.NewBufferString("")
	_, _ = ws.Write([]byte("xxxx"))
	n, err := ws.WriteTo(buf)
	assert.NoError(t, err)
	assert.Equal(t, int64(4), n)
	assert.Equal(t, "xxxx", buf.String())
}

func TestWriterSeeker_Buffer(t *testing.T) {
	ws := &WriterSeeker{}
	_, _ = ws.Write([]byte("xxxx"))
	assert.Equal(t, []byte("xxxx"), ws.Buffer())
}
