package mailer

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_message_encodeContent(t *testing.T) {
	// subject and receiver email are not needed for encoding the content
	tests := []struct {
		name             string
		plainContent     string
		htmlContent      string
		wantContentTypes []string
		wantPlain        bool
		wantHtml         bool
		wantErr          bool
	}{
		{
			name:         "should return encoded message content",
			plainContent: "plain content",
			htmlContent:  `<h1>html content</h1>`,
			wantContentTypes: []string{
				"Content-Type: multipart/alternative",
				"Content-Type: text/plain",
				"Content-Type: text/html",
			},
			wantPlain: true,
			wantHtml:  true,
			wantErr:   false,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			m := &message{
				plainContent: tc.plainContent,
				htmlContent:  tc.htmlContent,
			}
			got, err := m.encodeContent()
			gotTypes := true
			for _, ct := range tc.wantContentTypes {
				gotTypes = strings.Contains(got, ct) && gotTypes
			}
			assert.Equal(tt, tc.wantErr, err != nil)
			assert.True(tt, gotTypes)
			assert.Equal(tt, tc.wantPlain, strings.Contains(got, tc.plainContent))
			assert.Equal(tt, tc.wantHtml, strings.Contains(got, tc.htmlContent))
		})
	}
}

func Test_message_encodeMessage(t *testing.T) {
	tests := []struct {
		name         string
		to           []string
		subject      string
		plainContent string
		htmlContent  string
		wantTo       bool
		wantSubject  bool
		wantPlain    bool
		wantHtml     bool
		wantErr      bool
	}{
		{
			name:         "should return encoded message",
			to:           []string{"someone@email.com"},
			subject:      "test",
			plainContent: "plain content",
			htmlContent:  `<h1>html content</h1>`,
			wantTo:       true,
			wantSubject:  true,
			wantPlain:    true,
			wantHtml:     true,
			wantErr:      false,
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			m := &message{
				to:           []string{"someone@email.com"},
				subject:      "test",
				plainContent: tc.plainContent,
				htmlContent:  tc.htmlContent,
			}
			got, err := m.encodeMessage()
			str := string(got)
			assert.Equal(tt, tc.wantErr, err != nil)
			assert.Equal(tt, tc.wantSubject, strings.Contains(str, tc.subject))
			assert.Equal(tt, tc.wantTo, strings.Contains(str, tc.to[0]))
			assert.Equal(tt, tc.wantPlain, strings.Contains(str, tc.plainContent))
			assert.Equal(tt, tc.wantHtml, strings.Contains(str, tc.htmlContent))
		})
	}
}
