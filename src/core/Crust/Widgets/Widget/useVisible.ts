import { useEffect, useMemo } from "react";

export type Visible = "always" | "desktop" | "mobile";

export const useVisible = ({
  widgetId,
  visible: defaultVisible,
  isMobile,
  onVisibilityChange,
}: {
  widgetId: string | undefined;
  visible: Visible | undefined;
  isMobile: boolean | undefined;
  onVisibilityChange: ((id: string, v: boolean) => void) | undefined;
}) => {
  const visible = useMemo(
    () =>
      !defaultVisible ||
      defaultVisible === "always" ||
      (defaultVisible === "desktop" && !isMobile) ||
      (defaultVisible === "mobile" && !!isMobile),
    [defaultVisible, isMobile],
  );

  useEffect(() => {
    if (widgetId) {
      onVisibilityChange?.(widgetId, visible);
    }
  }, [widgetId, visible, onVisibilityChange]);

  return visible;
};
