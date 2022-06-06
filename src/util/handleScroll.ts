export function handleScroll(
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
