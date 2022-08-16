package repourl

import (
	"fmt"
	"net/url"
	"strings"
)

var repos = map[string]func(s string) *URL{
	"github.com": github,
}

var reposArchive = map[string]func(u *URL) *url.URL{
	"github.com": githubArchive,
}

func github(p string) *URL {
	s := strings.SplitN(p, "/", 3)
	if len(s) < 2 {
		return nil
	}

	ref := ""
	if len(s) == 3 {
		s2 := strings.Split(s[2], "/")
		if len(s2) == 1 {
			ref = "heads/" + s2[0]
		}
		// tree/*
		if len(s2) >= 2 && s2[0] == "tree" {
			// unknown whether it is a branch name or a tag name
			ref = "heads/" + s2[1]
		}
		// releases/tag/*
		if len(s2) >= 3 && s2[0] == "release" && s2[1] == "tag" {
			ref = "tags/" + s2[2]
		}
		// archive/*.zip
		if len(s2) == 2 && s2[0] == "archive" {
			ref = fileNameWithoutExtension(s2[1])
		}
		// archive/refs/*/*.zip
		if len(s2) == 4 && s2[0] == "archive" && s2[1] == "refs" {
			ref = s2[2] + "/" + fileNameWithoutExtension(s2[3])
		}
	}

	return &URL{
		Host:  "github.com",
		Owner: s[0],
		Repo:  strings.TrimSuffix(s[1], ".git"),
		Ref:   ref,
	}
}

func githubArchive(u *URL) *url.URL {
	r := u.Ref
	if r == "" {
		r = "refs/heads/main"
	} else if c := u.Commit(); c == "" {
		r = "refs/" + r
	}

	return &url.URL{
		Scheme: "https",
		Host:   "github.com",
		Path:   fmt.Sprintf("%s/%s/archive/%s.zip", u.Owner, u.Repo, r),
	}
}

func fileNameWithoutExtension(fileName string) string {
	if pos := strings.LastIndexByte(fileName, '.'); pos != -1 {
		return fileName[:pos]
	}
	return fileName
}
