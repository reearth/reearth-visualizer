import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";

import Icon from "@reearth/components/atoms/Icon";
import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";

import { Props as BlockProps } from "..";
import { Border } from "../common";

export type Props = BlockProps<Property>;

export type Property = {
  default: {
    html?: string;
    title?: string;
  };
};

const HTMLBlock: React.FC<Props> = ({
  block,
  isSelected,
  isEditable,
  theme,
  infoboxProperty,
  onChange,
  onClick,
}) => {
  const t = useT();
  const { html, title } = block?.property?.default ?? {};

  const ref = useRef<HTMLTextAreaElement>(null);
  const isDirty = useRef(false);
  const [editingText, setEditingText] = useState<string | undefined>();
  const isEditing = typeof editingText === "string";
  const isTemplate = !html && !title && !isEditing;

  const startEditing = useCallback(() => {
    if (!isEditable) return;
    setEditingText(html ?? "");
  }, [isEditable, html]);

  const finishEditing = useCallback(() => {
    if (!isEditing) return;
    if (onChange && isDirty.current) {
      onChange("default", "html", editingText ?? "", "string");
    }
    isDirty.current = false;
    setEditingText(undefined);
  }, [editingText, onChange, isEditing]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditingText(e.currentTarget.value);
      isDirty.current = true;
    },
    [],
  );

  useEffect(() => {
    if (isEditing) {
      ref.current?.focus();
    }
  }, [isEditing]);

  const isSelectedPrev = useRef(false);
  useEffect(() => {
    if (isEditing && !isSelected && isSelectedPrev.current) {
      finishEditing();
    }
  }, [finishEditing, isSelected, isEditing]);
  useEffect(() => {
    isSelectedPrev.current = !!isSelected;
  }, [isSelected]);

  const [isHovered, setHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);
  const handleClick = useCallback(
    (e?: React.MouseEvent<HTMLDivElement>) => {
      e?.stopPropagation();
      if (isEditing) return;
      onClick?.();
    },
    [isEditing, onClick],
  );

  // iframe
  const themeColor = infoboxProperty?.default?.typography?.color ?? theme?.themeTextColor;
  const [frameRef, setFrameRef] = useState<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState(15);
  const initializeIframe = useCallback(() => {
    const frameDocument = frameRef?.contentDocument;
    const frameWindow = frameRef?.contentWindow;
    if (!frameWindow || !frameDocument) {
      return;
    }

    if (!frameDocument.body.innerHTML.length) {
      // `document.write()` is not recommended API by HTML spec,
      // but we need to use this API to make it work correctly on Safari.
      // If Safari supports `onLoad` event with `srcDoc`, we can remove this line.
      frameDocument.write(html || "");
    }

    // Initialize styles
    frameWindow.document.documentElement.style.margin = "0";
    frameWindow.document.body.style.color = themeColor ?? getComputedStyle(frameRef).color;
    frameWindow.document.body.style.margin = "0";

    const handleFrameClick = () => handleClick();

    if (isEditable) {
      frameWindow.document.body.style.cursor = "pointer";
      frameWindow.document.addEventListener("dblclick", startEditing);
      frameWindow.document.addEventListener("click", handleFrameClick);
    }

    const resize = () => {
      setHeight(frameWindow.document.documentElement.scrollHeight);
    };

    // Resize
    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(frameWindow.document.body);

    return () => {
      frameWindow.document.removeEventListener("dblclick", startEditing);
      frameWindow.document.removeEventListener("click", handleFrameClick);
      resizeObserver.disconnect();
    };
  }, [frameRef, startEditing, isEditable, handleClick, html, themeColor]);

  useLayoutEffect(() => initializeIframe(), [initializeIframe]);

  return (
    <Wrapper
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      isSelected={isSelected}
      isHovered={isHovered}
      isEditable={isEditable}
      isTemplate={isTemplate}>
      {isTemplate && isEditable && !isEditing ? (
        <Template onDoubleClick={startEditing}>
          <StyledIcon icon="html" isSelected={isSelected} isHovered={isHovered} size={24} />
          <Text isSelected={isSelected} isHovered={isHovered}>
            {t("Double click here to write.")}
          </Text>
        </Template>
      ) : (
        <>
          {title && <Title>{title}</Title>}
          {isEditing ? (
            <InputField
              ref={ref}
              value={editingText ?? ""}
              onChange={handleChange}
              onBlur={finishEditing}
              rows={10}
              minHeight={height}
            />
          ) : (
            <IFrame
              key={html}
              ref={setFrameRef}
              frameBorder="0"
              scrolling="no"
              $height={height}
              allowFullScreen
              sandbox="allow-same-origin allow-popups allow-forms"
            />
          )}
        </>
      )}
    </Wrapper>
  );
};

const Wrapper = styled(Border)<{
  isTemplate: boolean;
}>`
  margin: 0 8px;
  border: 1px solid
    ${({ isSelected, isHovered, isTemplate, isEditable, theme }) =>
      (!isTemplate && !isHovered && !isSelected) || !isEditable
        ? "transparent"
        : isHovered
        ? theme.infoBox.border
        : isSelected
        ? theme.infoBox.accent2
        : theme.infoBox.weakText};
  border-radius: 6px;
`;

const Title = styled.div`
  font-size: 12px;
`;

const IFrame = styled.iframe<{ $height: number }>`
  display: block;
  border: none;
  padding: 5px;
  height: ${({ $height }) => $height}px;
  width: 100%;
  min-width: 100%;
  box-sizing: border-box;
`;

const InputField = styled.textarea<{ minHeight: number }>`
  display: block;
  width: 100%;
  min-height: ${({ minHeight }) => minHeight}px;
  height: 185px;
  resize: none;
  box-sizing: border-box;
  background-color: transparent;
  color: ${props => props.theme.infoBox.mainText};
  font-size: ${fonts.sizes.s}px;
  outline: none;
  border: none;
  padding: 4px;
`;

const Template = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 185px;
  margin: 0 auto;
  user-select: none;
`;

const Text = styled.p<{ isSelected?: boolean; isHovered?: boolean }>`
  color: ${({ isSelected, isHovered, theme }) =>
    isHovered ? theme.infoBox.border : isSelected ? theme.main.select : theme.infoBox.weakText};
`;

const StyledIcon = styled(Icon)<{ isSelected?: boolean; isHovered?: boolean }>`
  color: ${({ isSelected, isHovered, theme }) =>
    isHovered ? theme.infoBox.border : isSelected ? theme.main.select : theme.infoBox.weakText};
`;

export default HTMLBlock;
