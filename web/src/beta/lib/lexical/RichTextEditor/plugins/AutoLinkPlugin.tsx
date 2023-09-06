import { AutoLinkNode } from "@lexical/link";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

const URL_MATCHER =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const EMAIL_MATCHER =
  /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

const MATCHERS = [
  (text: string) => {
    const match = URL_MATCHER.exec(text);
    return (
      match && {
        index: match.index,
        length: match[0].length,
        text: match[0],
        url: match[0],
        attributes: {
          target: "_blank",
        },
      }
    );
  },
  (text: string) => {
    const match = EMAIL_MATCHER.exec(text);
    return (
      match && {
        index: match.index,
        length: match[0].length,
        text: match[0],
        url: `mailto:${match[0]}`,
        attributes: {
          target: "_blank",
        },
      }
    );
  },
];

export default function AutoLinkPluginWithMathers() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;
    const removeNodeListener = editor.registerNodeTransform(AutoLinkNode, node => {
      if (!node) return;
      const dom = editor.getElementByKey(node.__key);
      if (!dom) return;
      dom.setAttribute("target", "_blank");
    });
    return () => removeNodeListener();
  }, [editor]);
  return <AutoLinkPlugin matchers={MATCHERS} />;
}
