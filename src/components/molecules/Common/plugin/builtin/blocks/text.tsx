import React, { Fragment, useState, useEffect, useRef, useCallback } from "react";
import { useIntl } from "react-intl";

import Icon from "@reearth/components/atoms/Icon";
import Markdown from "@reearth/components/atoms/Markdown";
import { styled, useTheme } from "@reearth/theme";
import { Typography, typographyStyles } from "@reearth/util/value";
import fonts from "@reearth/theme/fonts";

import { BlockComponent } from "../../PluginBlock";

type Property = {
  default?: {
    text?: string;
    title?: string;
    markdown?: boolean;
    typography?: Typography;
  };
};

type PluginProperty = {};

const TextBlock: BlockComponent<Property, PluginProperty> = ({
  property,
  infoboxProperty,
  isSelected,
  isHovered,
  isEditable,
  onChange,
  onClick,
}) => {
  const intl = useIntl();
  const theme = useTheme();
  const markdown = property?.default?.markdown;
  const typography = property?.default?.typography;
  const bg = infoboxProperty?.default?.bgcolor;

  const ref = useRef<HTMLTextAreaElement>(null);
  const isDirty = useRef(false);
  const [editingText, setEditingText] = useState<string | undefined>();
  const isEditing = typeof editingText === "string";
  const isTemplate = !property?.default?.text && !property?.default?.title && !isEditing;

  const startEditing = useCallback(() => {
    if (!isSelected || !isEditable) return;
    setEditingText(property?.default?.text ?? "");
  }, [isEditable, isSelected, property]);

  const finishEditing = useCallback(() => {
    if (onChange && isDirty.current) {
      onChange("default", "text", editingText ?? "", "string");
    }
    isDirty.current = false;
    setEditingText(undefined);
  }, [editingText, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditingText(e.currentTarget.value);
      isDirty.current = true;
    },
    [],
  );

  useEffect(() => {
    isDirty.current = false;
    setEditingText(undefined);
  }, [property, isEditable, isSelected]);

  useEffect(() => {
    if (isEditing) {
      ref.current?.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && !isSelected) {
      finishEditing();
    }
  }, [finishEditing, isSelected, isEditing]);

  return (
    <Wrapper
      onClick={onClick}
      isSelected={isSelected}
      isHovered={isHovered}
      isTemplate={isTemplate}
      isEditable={isEditable}>
      {isTemplate && isEditable ? (
        <Template onDoubleClick={startEditing}>
          <StyledIcon icon="text" isHovered={isHovered} isSelected={isSelected} size={24} />
          <Text isSelected={isSelected} isHovered={isHovered}>
            {intl.formatMessage({ defaultMessage: "Double click here to write." })}
          </Text>
        </Template>
      ) : (
        <>
          {property?.default?.title && <Title styles={typography}>{property.default.title}</Title>}
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
              {property?.default?.text}
            </Markdown>
          ) : (
            <Field styles={typography} onDoubleClick={startEditing}>
              {(property?.default?.text ?? "").split("\n").map((t, i) => (
                <Fragment key={i}>
                  {t}
                  <br />
                </Fragment>
              ))}
            </Field>
          )}
        </>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{
  isSelected?: boolean;
  isHovered?: boolean;
  isTemplate: boolean;
  isEditable?: boolean;
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

const Title = styled.div<{ styles?: Typography }>`
  ${({ styles }) => typographyStyles(styles)}
  padding: 5px;
  min-height: 15px;
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
    isHovered ? theme.infoBox.border : isSelected ? theme.infoBox.accent2 : theme.infoBox.weakText};
`;

const StyledIcon = styled(Icon)<{ isSelected?: boolean; isHovered?: boolean }>`
  color: ${props =>
    props.isHovered
      ? props.theme.infoBox.border
      : props.isSelected
      ? props.theme.infoBox.accent2
      : props.theme.infoBox.weakText};
`;

export default TextBlock;
