export const insertToBody = (html: string | undefined, insertStr: string) => {
  if (html === undefined) return "";
  let lastBodyIndex = html.lastIndexOf("</body>");
  if (lastBodyIndex < 0) lastBodyIndex = html.lastIndexOf("</BODY>");
  return lastBodyIndex < 0
    ? `${html}${insertStr}`
    : `${html.substring(0, lastBodyIndex)}${insertStr}${html.substring(lastBodyIndex)}`;
};
