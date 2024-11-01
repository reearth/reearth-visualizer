import { useCallback, useEffect, useRef } from "react";

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  onLoadMore: () => void;
};

const BOTTOM_ALLOWANCE = 50; // when there are 50px left to scroll, load more
const SHORTER_LIMIT = 20; // when the content minuse this is smaller than wrapper we load more

export default ({ data, onLoadMore }: Props) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  const checkForLoadMore = useCallback(() => {
    const wrapperElement = wrapperRef.current;
    const contentElement = contentRef.current;

    if (wrapperElement && contentElement) {
      if (
        contentElement.offsetHeight - SHORTER_LIMIT <
          wrapperElement.offsetHeight ||
        contentElement.scrollHeight -
          wrapperElement.scrollTop -
          wrapperElement.clientHeight <
          BOTTOM_ALLOWANCE
      ) {
        onLoadMoreRef.current?.();
      }
    }
  }, []);

  // Check on data change
  useEffect(() => {
    // This is useful to projects, since current query doesn't take visualizer project only
    if (data?.length === 0) {
      onLoadMoreRef.current?.();
      return;
    }
    checkForLoadMore();
  }, [data, checkForLoadMore]);

  // Check on scroll
  useEffect(() => {
    const wrapperElement = wrapperRef.current;
    if (!wrapperElement) return;

    wrapperElement.addEventListener("scroll", checkForLoadMore);

    return () => {
      wrapperElement.removeEventListener("scroll", checkForLoadMore);
    };
  }, [data, checkForLoadMore]);

  // Check on resize
  useEffect(() => {
    const wrapperElement = wrapperRef.current;
    const contentElement = contentRef.current;

    if (!wrapperElement || !contentElement) return;

    const wrapperObserver = new ResizeObserver(checkForLoadMore);
    const contentObserver = new ResizeObserver(checkForLoadMore);

    wrapperObserver.observe(wrapperElement);
    contentObserver.observe(contentElement);

    checkForLoadMore();

    return () => {
      wrapperObserver.disconnect();
      contentObserver.disconnect();
    };
  }, [data, checkForLoadMore]);

  return {
    wrapperRef,
    contentRef
  };
};
