import { LinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { useEffect } from "react";

export default function LinkOnBlankPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;
    const removeNodeListener = editor.registerNodeTransform(
      LinkNode as unknown as Parameters<typeof editor.registerNodeTransform>[0],
      (node) => {
        if (!node) return;
        const dom = editor.getElementByKey(node.getKey());
        if (!dom) return;
        dom.setAttribute("target", "_blank");
      }
    );
    return () => removeNodeListener();
  }, [editor]);
  return <LinkPlugin />;
}
