import { ForwardRefRenderFunction, ReactNode, forwardRef } from "react";

import { Spacing } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";

export type Props = {
  children?: ReactNode;
  id?: string;
  isEditable?: boolean;
  minPaddingInEditor?: Spacing;
  minGapInEditor?: number;
  padding?: Spacing;
  gap?: number;
};

const ContentWrapper: ForwardRefRenderFunction<HTMLDivElement, Props> = (
  { id, isEditable, minPaddingInEditor, minGapInEditor, padding, gap, children },
  ref,
) => (
  <Wrapper
    id={id}
    ref={ref}
    isEditable={isEditable}
    minPaddingInEditor={minPaddingInEditor ?? { top: 0, left: 0, right: 0, bottom: 0 }}
    padding={padding ?? { top: 0, left: 0, right: 0, bottom: 0 }}
    minGapInEditor={minGapInEditor ?? 0}
    gap={gap}>
    {children}
  </Wrapper>
);

export default forwardRef(ContentWrapper);

const Wrapper = styled.div<{
  padding: Spacing;
  gap?: number;
  isEditable?: boolean;
  minPaddingInEditor: Spacing;
  minGapInEditor: number;
}>`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.content.weaker};
  ${({ gap, isEditable, minGapInEditor }) =>
    gap && `gap: ${isEditable && gap < minGapInEditor ? minGapInEditor : gap}px;`}

  ${({ padding, isEditable, minPaddingInEditor }) =>
    `padding-top: ${
      isEditable && padding.top < minPaddingInEditor.top ? minPaddingInEditor.top : padding.top
    }px;`}
    ${({ padding, isEditable, minPaddingInEditor }) =>
    `padding-bottom: ${
      isEditable && padding.bottom < minPaddingInEditor.bottom
        ? minPaddingInEditor.bottom
        : padding.bottom
    }px;`}
    ${({ padding, isEditable, minPaddingInEditor }) =>
    `padding-left: ${
      isEditable && padding.left < minPaddingInEditor.left ? minPaddingInEditor.left : padding.left
    }px;`}
    ${({ padding, isEditable, minPaddingInEditor }) =>
    `padding-right: ${
      isEditable && padding.right < minPaddingInEditor.right
        ? minPaddingInEditor.right
        : padding.right
    }px;`}
    box-sizing: border-box;
`;
