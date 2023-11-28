import { useEffect, useMemo, useRef } from "react";

export type Visible = "always" | "desktop" | "mobile";

export const useVisible = ({
  visible: defaultVisible,
  isMobile,
  onVisibilityChange,
}: {
  visible: Visible | undefined;
  isMobile: boolean | undefined;
  onVisibilityChange: (() => void) | undefined;
}) => {
  const visible = useMemo(
    () =>
      !defaultVisible ||
      defaultVisible === "always" ||
      (defaultVisible === "desktop" && !isMobile) ||
      (defaultVisible === "mobile" && !!isMobile),
    [defaultVisible, isMobile],
  );

  const onVisibilityChangeRef = useRef(onVisibilityChange);
  onVisibilityChangeRef.current = onVisibilityChange;

  useEffect(() => {
    onVisibilityChangeRef.current?.();
  }, [defaultVisible]);

  return visible;
};
