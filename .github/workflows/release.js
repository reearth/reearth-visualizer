const { readFileSync, writeFileSync } = require("fs");

const repos = ["web", "backend"];
const header = "# Changelog\nAll notable changes to this project will be documented in this file.";

module.exports = async ({ github, tag }) => {
  const newTag = removeVFromTag(tag);
  const releases = await Promise.all(repos.map(r => github.rest.repos.getReleaseByTag({
    owner: "reearth",
    repo: "reearth-" + r,
    tag: `v${newTag}`,
  })));

  // generate CHANGELOG_latest.md
  const changelogLatest = repos.flatMap((r, i) =>
    [`## reearth-${r}`, releases[i].data.body]
  ).join("\n");
  writeFileSync("CHANGELOG_latest.md", changelogLatest);

  // insert new changelog to CHANGELOG.md
  let changelog = "";
  try {
    changelog = readFileSync("CHANGELOG.md", "utf-8");
  } catch {
    // ignore
  }
  const pos = changelog.indexOf("## "); // first version section
  const newChangelog = `${formatHeader(tag)}\n\n${changelogLatest.replace(/^#/gm, "##")}`;
  if (pos >= 0) {
    changelog = changelog.slice(0, pos) + newChangelog + "\n\n" + changelog.slice(pos);
  } else {
    changelog = [header, newChangelog].join("\n\n")
  }
  writeFileSync("CHANGELOG.md", changelog);
};

function formatHeader(version, date) {
  return `## ${removeVFromTag(version)} - ${formatDate(date)}`;
}

function formatDate(d = new Date()) {
  return `${d.getUTCFullYear()}-${("0" + (d.getUTCMonth() + 1)).slice(-2)}-${("0" + d.getUTCDate()).slice(-2)}`;
}

function removeVFromTag(t) {
  return t.replace("v", "");
}
