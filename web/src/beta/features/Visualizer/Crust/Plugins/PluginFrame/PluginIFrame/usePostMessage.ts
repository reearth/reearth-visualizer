import { RefObject, useCallback, useEffect, useRef } from "react";

import type { Ref } from "../IFrame";

export function usePostMessage(iFrameRef: RefObject<Ref>, pending?: boolean) {
  const messageQueue = useRef<any[]>([]);
  const available = typeof pending !== "boolean" || !pending;
  const availableRef = useRef(available);
  const postMessage = useCallback(
    (msg: any) => {
      try {
        const message = JSON.parse(JSON.stringify(msg));
        if (iFrameRef.current && availableRef.current) {
          iFrameRef.current.postMessage(message);
        } else {
          messageQueue.current.push(message);
        }
      } catch (err) {
        console.error("plugin error: failed to post message", err);
      }
    },
    [iFrameRef],
  );

  useEffect(() => {
    if (available && iFrameRef.current) {
      if (messageQueue.current.length) {
        for (const message of messageQueue.current) {
          iFrameRef.current.postMessage(message);
        }
        messageQueue.current = [];
      }
    }
    availableRef.current = available;
  }, [iFrameRef, available]);

  return postMessage;
}
