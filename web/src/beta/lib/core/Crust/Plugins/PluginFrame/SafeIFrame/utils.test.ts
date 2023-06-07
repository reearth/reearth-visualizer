import { expect, test } from "vitest";

import { insertToBody } from "./utils";

test("insertScriptToBody", () => {
  const script = `<script id="insert-script"></script>`;
  const html1 = `<div></div>`;
  expect(insertToBody(html1, script)).toEqual(`<div></div><script id="insert-script"></script>`);

  const html2 = `<html><body></body></html>`;
  expect(insertToBody(html2, script)).toEqual(
    `<html><body><script id="insert-script"></script></body></html>`,
  );

  const html3 = `<html><BODY></BODY></html>`;
  expect(insertToBody(html3, script)).toEqual(
    `<html><BODY><script id="insert-script"></script></BODY></html>`,
  );

  const html4 = `<html><body><script>const a = '<body></body>'</script></body></html>`;
  expect(insertToBody(html4, script)).toEqual(
    `<html><body><script>const a = '<body></body>'</script><script id="insert-script"></script></body></html>`,
  );
});
