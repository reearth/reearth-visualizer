const { exec } = require("child_process");
const { promisify } = require("util");

const axios = require("axios");

const { GITHUB_TOKEN, GITHUB_PR_COMMENTS_URL, GITHUB_PR_NUMBER, GITHUB_BRANCH_NAME } = process.env;
const REMOTE = "origin";
const STORYBOOK_BASE_URL = `https://reearth-pr-${GITHUB_PR_NUMBER}.herokuapp.com/storybook/`;

const execAsync = promisify(exec);

const getPathFromFilepath = filepath => {
  const match = filepath.match(/components\/(.*?.stories.tsx)$/);
  return match ? match[1] : null;
};

const getStory = path => {
  const storyPath = `/story/${path.split("/").slice(0, -1).join("-").toLowerCase()}`;
  return { url: `${STORYBOOK_BASE_URL}?path=${storyPath}`, path };
};

const generateComment = stories => `
### :book: Storybook

| Modified components | Link |
|--|--|
${stories.map(({ url, path }) => `| ${path} | [open](${url}) |`).join("\n")}
`;

const postCommentToPullRequest = async comment => {
  try {
    await axios.post(
      GITHUB_PR_COMMENTS_URL,
      { body: comment },
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3.html+json",
        },
      },
    );
  } catch (error) {
    console.error(error);
  }
};

const getDiff = async () => {
  if (!GITHUB_BRANCH_NAME) {
    return [];
  }
  const { stdout } = await execAsync(`git diff ${REMOTE}/${GITHUB_BRANCH_NAME}...HEAD --name-only`);
  return stdout.split("\n");
};

(async () => {
  await execAsync(`git fetch ${REMOTE}`);
  const lines = await getDiff();
  const paths = lines.map(getPathFromFilepath).filter(Boolean);

  if (paths.length) {
    const uniquePaths = [...new Set(paths)];
    const stories = uniquePaths.map(getStory);
    const comment = generateComment(stories);
    await postCommentToPullRequest(comment);
  }
})();
