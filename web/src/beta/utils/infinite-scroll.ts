import { MutableRefObject } from "react";

export function autoFillPage(
  ref: MutableRefObject<HTMLDivElement | undefined | null>,
  onLoadMore?: () => void,
) {
  if (ref.current && ref.current?.scrollHeight <= document.documentElement.clientHeight) {
    onLoadMore?.();
  }
}

export function onScrollToBottom(
  { currentTarget }: React.UIEvent<HTMLDivElement, UIEvent>,
  onLoadMore?: () => void,
  threshold = 5,
) {
  if (
    currentTarget.scrollTop + currentTarget.clientHeight >=
    currentTarget.scrollHeight - threshold
  ) {
    onLoadMore?.();
  }
}
