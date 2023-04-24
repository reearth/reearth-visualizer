const { readFileSync, writeFileSync } = require("fs");

module.exports = async ({ github }) => {
  const newTag = removeVFromTag(process.env.TAG);
  const release = await github.rest.repos.getReleaseByTag({
    owner: "reearth",
    repo: "reearth",
    tag: `v${newTag}`,
  });
  const webChangelogLatest = "### Web\n\n" + release.data.body;

  const changelogLatest = readFileSync("CHANGELOG_latest.md", "utf8");
  const newChangelogLatest = webChangelogLatest + "\n\n" + changelogLatest;
  writeFileSync("CHANGELOG_latest.md", newChangelogLatest);

  const changelog = readFileSync("CHANGELOG.md", "utf8");
  const newChangelog = insert(webChangelogLatest + "\n\n", changelog, changelog.indexOf("### "));
  writeFileSync("CHANGELOG.md", newChangelog);
};

function removeVFromTag(t) {
  return t.replace("v", "");
}

function insert(insert, source, pos) {
  if (pos < 0) pos = 0;
  return source.slice(0, pos) + insert + source.slice(pos);
}
