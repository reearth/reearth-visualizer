import React, { useState, useEffect, useRef, useCallback } from "react";
import nl2br from "react-nl2br";

import Icon from "@reearth/components/atoms/Icon";
import Markdown from "@reearth/components/atoms/Markdown";
import { useT } from "@reearth/i18n";
import { styled, useTheme } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";

import { CommonProps as BlockProps, Typography } from "..";
import { Border, typographyStyles } from "../utils";

export type Props = BlockProps<Property>;

export type Property = {
  text?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  title?: string;
  markdown?: boolean;
  typography?: Typography;
};

const TextBlock: React.FC<Props> = ({
  block,
  infoboxProperty,
  isSelected,
  isEditable,
  onChange,
  onClick,
}) => {
  const t = useT();
  const theme = useTheme();
  const {
    text,
    title,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    markdown,
    typography,
  } = block?.property ?? {};
  const { bgcolor: bg } = infoboxProperty ?? {};

  const ref = useRef<HTMLTextAreaElement>(null);
  const isDirty = useRef(false);
  const [editingText, setEditingText] = useState<string | undefined>();
  const isEditing = typeof editingText === "string";
  const isTemplate = !text && !title && !isEditing;

  const startEditing = useCallback(() => {
    if (!isEditable) return;
    setEditingText(text ?? "");
  }, [isEditable, text]);

  const finishEditing = useCallback(() => {
    if (!isEditing) return;
    if (onChange && isDirty.current) {
      onChange("default", "text", editingText ?? "", "string");
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
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (isEditing) return;
      onClick?.();
    },
    [isEditing, onClick],
  );

  return (
    <Wrapper
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      paddingLeft={paddingLeft}
      paddingRight={paddingRight}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      isSelected={isSelected}
      isHovered={isHovered}
      isEditable={isEditable}
      isTemplate={isTemplate}>
      {isTemplate && isEditable && !isEditing ? (
        <Template onDoubleClick={startEditing}>
          <StyledIcon icon="text" isSelected={isSelected} isHovered={isHovered} size={24} />
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
            />
          ) : markdown ? (
            <Markdown
              styles={typography}
              backgroundColor={bg || theme.infoBox.bg}
              onDoubleClick={startEditing}>
              {text}
            </Markdown>
          ) : (
            <Field styles={typography} onDoubleClick={startEditing}>
              {nl2br(text ?? "")}
            </Field>
          )}
        </>
      )}
    </Wrapper>
  );
};

const Wrapper = styled(Border)<{
  isTemplate: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
}>`
  padding-top: ${({ paddingTop }) => (paddingTop ? paddingTop + "px" : "0")};
  padding-bottom: ${({ paddingBottom }) => (paddingBottom ? paddingBottom + "px" : "0")};
  padding-left: ${({ paddingLeft }) => (paddingLeft ? paddingLeft + "px" : "0")};
  padding-right: ${({ paddingRight }) => (paddingRight ? paddingRight + "px" : "0")};
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

const Field = styled.div<{ styles?: Typography }>`
  ${({ styles }) => typographyStyles(styles)}
  padding: 5px;
  min-height: 15px;
`;

const InputField = styled.textarea`
  display: block;
  width: 100%;
  min-height: 15px;
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

export default TextBlock;
