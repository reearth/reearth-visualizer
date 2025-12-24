import { Spacing } from "@reearth/app/utils/value";
import { styled } from "@reearth/services/theme";
import { ForwardRefRenderFunction, ReactNode, forwardRef } from "react";

export type Props = {
  children?: ReactNode;
  id?: string;
  isEditable?: boolean;
  minPaddingInEditor?: Spacing;
  minGapInEditor?: number;
  minHeight: string;
  padding?: Spacing;
  gap?: number;
};

const ContentWrapper: ForwardRefRenderFunction<HTMLDivElement, Props> = (
  {
    id,
    isEditable,
    minPaddingInEditor,
    minGapInEditor,
    padding,
    gap,
    minHeight,
    children
  },
  ref
) => (
  <Wrapper
    id={id}
    ref={ref}
    isEditable={isEditable}
    minPaddingInEditor={
      minPaddingInEditor ?? { top: 0, left: 0, right: 0, bottom: 0 }
    }
    padding={padding ?? { top: 0, left: 0, right: 0, bottom: 0 }}
    minGapInEditor={minGapInEditor ?? 0}
    minHeight={minHeight}
    gap={gap}
  >
    {children}
  </Wrapper>
);

export default forwardRef(ContentWrapper);

const Wrapper = styled("div")<{
  padding: Spacing;
  gap?: number;
  isEditable?: boolean;
  minPaddingInEditor: Spacing;
  minGapInEditor: number;
  minHeight: string;
}>(
  ({
    padding,
    gap,
    isEditable,
    minGapInEditor,
    minPaddingInEditor,
    minHeight,
    theme
  }) => ({
    display: "flex",
    flexDirection: "column",
    color: theme.content.weaker,
    gap:
      gap !== undefined && isEditable && gap < minGapInEditor
        ? `${minGapInEditor}px`
        : `${gap}px`,
    paddingTop:
      isEditable && padding.top < minPaddingInEditor.top
        ? `${minPaddingInEditor.top}px`
        : `${padding.top}px`,
    paddingBottom:
      isEditable && padding.bottom < minPaddingInEditor.bottom
        ? `${minPaddingInEditor.bottom}px`
        : `${padding.bottom}px`,
    paddingLeft:
      isEditable && padding.left < minPaddingInEditor.left
        ? `${minPaddingInEditor.left}px`
        : `${padding.left}px`,
    paddingRight:
      isEditable && padding.right < minPaddingInEditor.right
        ? `${minPaddingInEditor.right}px`
        : `${padding.right}px`,
    boxSizing: "border-box",
    minHeight: minHeight
  })
);
