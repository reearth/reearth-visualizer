import React, { forwardRef, useMemo } from "react";

import Flex from "@reearth/classic/components/atoms/Flex";
import HelpButton from "@reearth/classic/components/atoms/HelpButton";
import Icon from "@reearth/classic/components/atoms/Icon";
import Text from "@reearth/classic/components/atoms/Text";
import ToggleButton from "@reearth/classic/components/atoms/ToggleButton";
import { metricsSizes } from "@reearth/classic/theme";
import fonts from "@reearth/classic/theme/reearthTheme/common/fonts";
import useDoubleClick from "@reearth/classic/util/use-double-click";
import { styled, useTheme } from "@reearth/services/theme";

import LayerActions, { Format } from "../LayerActions";
import LayerActionsList from "../LayerActionsList";

import useHooks from "./hooks";
import useEditable from "./use-editable";
import nl2br from "react-nl2br";
import { Typography, typographyStyles } from "@reearth/classic/util/value";

export type { Format } from "../LayerActions";

export type DropType = "top" | "bottom" | "bottomOfChildren";

export type Layer<T = unknown> = {
  id?: string;
  title?: string;
  description?: string;
  icon?: string;
  type?: string;
  group?: boolean;
  childrenCount?: number;
  linked?: boolean;
  deactivated?: boolean;
  disabled?: boolean;
  visible?: boolean;
  renamable?: boolean;
  visibilityChangeable?: boolean;
  showChildrenCount?: boolean;
  showLayerActions?: boolean;
  actionItems?: Layer<T>[];
  underlined?: boolean;
  property?: any;
} & T;

export type Props = {
  className?: string;
  rootLayerId?: string;
  selectedLayerId?: string;
  layer: Layer;
  disabled?: boolean;
  expanded?: boolean;
  selected?: boolean;
  childSelected?: boolean;
  dropType?: DropType;
  allSiblingsDoesNotHaveChildren?: boolean;
  visibilityShown?: boolean;
  onClick: () => void;
  onExpand?: () => void;
  onWarning?: (show: boolean) => void;
  onVisibilityChange?: (isVisible: boolean) => void;
  onActivationChange?: (isActive: boolean) => void;
  onRename?: (name: string) => void;
  onRemove?: (selectedLayerId: string) => void;
  onAdd?: (id?: string) => void;
  onGroupCreate?: () => void;
  onImport?: (file: File, format: Format) => void;
  onZoomToLayer?: (selectedLayerId: string) => void;
};

export type Template = {
  template?: "template1" | "template2" | "template3" | "template4";
  templateImage?: string;
  templateTitle1?: string;
  templateTitle2?: string;
  templateTitle3?: string;
  templateType?: string;
  boxBackgroundColor1?: string;
  boxBackgroundColor2?: string;
};

const Layer: React.ForwardRefRenderFunction<HTMLDivElement, Props> = (
  {
    className,
    rootLayerId,
    selectedLayerId,
    layer,
    expanded,
    selected,
    childSelected,
    dropType,
    allSiblingsDoesNotHaveChildren,
    visibilityShown,
    onVisibilityChange,
    onActivationChange,
    onWarning,
    onClick,
    onExpand,
    onRename,
    onRemove,
    onAdd,
    onGroupCreate,
    onImport,
    onZoomToLayer,
  },
  ref
) => {
  const {
    title,
    description,
    icon,
    type,
    group,
    linked,
    childrenCount,
    visible,
    renamable,
    visibilityChangeable,
    deactivated,
    showChildrenCount,
    showLayerActions,
    actionItems,
    underlined,
    property,
  } = layer;
  const {
    isHover,
    showHelp,
    handleExpand,
    handleVisibilityChange,
    handleActivationChange,
    toggleHover,
  } = useHooks({
    group,
    visibilityChangeable,
    visible,
    deactivated,
    onExpand,
    onVisibilityChange,
    onActivationChange,
  });

  const { editing, editingName, startEditing, inputProps } = useEditable({
    name: title,
    renamable,
    onRename,
  });
  const [handleClick, handleDoubleClick] = useDoubleClick(
    onClick,
    startEditing
  );

  const theme = useTheme();

  const defaultLayerItem = useMemo(
    () => (
      <>
        <ArrowIconWrapper
          allSiblingsDoesNotHaveChildren={allSiblingsDoesNotHaveChildren}
          onClick={handleExpand}
        >
          {group && <ArrowIcon open={expanded} icon="arrowToggle" size={10} />}
        </ArrowIconWrapper>
        <Flex>
          <LayerIcon
            selected={selected}
            disabled={deactivated}
            type={type}
            icon={
              icon ?? (group ? (linked ? "dataset" : "folder") : "layerItem")
            }
            size={16}
            color={
              selected
                ? theme.classic.layers.selectedTextColor
                : deactivated
                ? isHover
                  ? theme.classic.layers.highlight
                  : theme.classic.layers.disableTextColor
                : theme.classic.layers.textColor
            }
          />
        </Flex>
        {editing ? (
          <Input type="text" {...inputProps} onClick={stopPropagation} />
        ) : (
          <>
            <LayerName
              size="xs"
              selected={selected}
              disabled={deactivated}
              color={
                selected
                  ? theme.classic.layers.selectedTextColor
                  : deactivated
                  ? isHover
                    ? theme.classic.layers.highlight
                    : theme.classic.layers.disableTextColor
                  : theme.classic.layers.textColor
              }
            >
              {editingName}
            </LayerName>
            {group &&
              typeof childrenCount === "number" &&
              showChildrenCount && (
                <LayerCount
                  size="xs"
                  selected={selected}
                  color={
                    selected
                      ? theme.classic.layers.selectedTextColor
                      : deactivated
                      ? theme.classic.layers.disableTextColor
                      : theme.classic.layers.textColor
                  }
                >
                  {childrenCount}
                </LayerCount>
              )}
            {visibilityShown && visible !== undefined && (
              <HideableDiv
                isVisible={!visible || isHover || selected}
                onClick={handleVisibilityChange}
              >
                <LayerIcon
                  icon={!visible ? "hidden" : "visible"}
                  size={16}
                  selected={selected}
                  disabled={deactivated}
                  type={type}
                />
              </HideableDiv>
            )}
            {deactivated !== undefined && (
              <HideableDiv
                isVisible={isHover || selected}
                onClick={handleActivationChange}
              >
                <ToggleButton
                  size="sm"
                  checked={!deactivated}
                  parentSelected={selected}
                />
              </HideableDiv>
            )}
            {showHelp && description && (
              <HelpButton
                balloonDirection="right"
                gap={16}
                descriptionTitle={title}
                description={description}
              >
                <StyledIcon icon="question" size={"15px"} />
              </HelpButton>
            )}
            {showLayerActions && (
              <LayerActionsWrapper>
                {actionItems ? (
                  <LayerActionsList
                    selectedLayerId={selectedLayerId}
                    items={actionItems}
                    onAdd={onAdd}
                    onRemove={onRemove}
                    onWarning={onWarning}
                  />
                ) : (
                  <LayerActions
                    rootLayerId={rootLayerId}
                    selectedLayerId={selectedLayerId}
                    onLayerImport={onImport}
                    onLayerRemove={onRemove}
                    onLayerGroupCreate={onGroupCreate}
                    onZoomToLayer={onZoomToLayer}
                  />
                )}
              </LayerActionsWrapper>
            )}
          </>
        )}
      </>
    ),
    [
      group,
      expanded,
      icon,
      type,
      title,
      editing,
      editingName,
      inputProps,
      selected,
      deactivated,
      isHover,
      handleExpand,
      handleVisibilityChange,
      handleActivationChange,
      visibilityShown,
      childrenCount,
      showChildrenCount,
      showLayerActions,
      actionItems,
      rootLayerId,
      selectedLayerId,
      onAdd,
      onRemove,
      onImport,
      onGroupCreate,
      onZoomToLayer,
    ]
  );

  const isRenderMarkerTemplate = useMemo(
    () =>
      type === "layer" &&
      icon === "marker" &&
      !!property?.template?.templateEnabled === true,
    [property]
  );

  type Template1Props = {
    title1: string;
    title2: string;
    templateTitleTypography1: Typography;
    templateTitleTypography2: Typography;
    boxBackgroundColor1?: string;
    selected?: boolean;
  };

  const Template1: React.FC<Template1Props> = ({
    title1,
    title2,
    templateTitleTypography1,
    templateTitleTypography2,
    boxBackgroundColor1,
  }) => (
    <TemplateBox backgroundColor={boxBackgroundColor1}>
      <TextField typography={templateTitleTypography1}>
        {nl2br(title1 ?? "Text 1")}
      </TextField>
      <TextField typography={templateTitleTypography2}>
        {nl2br(title2 ?? "Text 2")}
      </TextField>
    </TemplateBox>
  );

  type Template2Props = {
    image: string;
    title1: string;
    title2: string;
    templateTitleTypography1?: Typography;
    templateTitleTypography2?: Typography;
    boxBackgroundColor1?: string;
    boxBackgroundColor2?: string;
    selected?: boolean;
  };

  const ImageTemplate = ({ src, alt }: { src?: string; alt?: string }) => {
    return src ? (
      <Image src={src} alt={alt} />
    ) : (
      <Flex justify="center" align="center">
        <StyledIcon icon="image" size={40} />
      </Flex>
    );
  };

  const Template2: React.FC<Template2Props> = ({
    image,
    title1,
    title2,
    templateTitleTypography1,
    templateTitleTypography2,
    boxBackgroundColor1,
  }) => (
    <TemplateBox
      style={{ display: "flex", width: "100%", gap: "8px" }}
      backgroundColor={boxBackgroundColor1}
      //selected={selected}
    >
      <ImageTemplate src={image} alt={title1} />
      <Column>
        <TextField typography={templateTitleTypography1}>
          {nl2br(title1 ?? "Text 1")}
        </TextField>
        <TextField typography={templateTitleTypography2}>
          {nl2br(title2 ?? "Text 2")}
        </TextField>
      </Column>
    </TemplateBox>
  );

  const Template3: React.FC<Template2Props> = ({
    image,
    title1,
    title2,
    templateTitleTypography1,
    templateTitleTypography2,
    boxBackgroundColor1,
  }) => (
    <TemplateBox
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "8px",
      }}
      backgroundColor={boxBackgroundColor1}
    >
      <ImageTemplate src={image} alt={title1} />
      <Column>
        <TextField typography={templateTitleTypography1}>
          {nl2br(title1 ?? "Text 1")}
        </TextField>
        <TextField typography={templateTitleTypography2}>
          {nl2br(title2 ?? "Text 2")}
        </TextField>
      </Column>
    </TemplateBox>
  );

  type Template4Props = {
    title1: string;
    title2: string;
    title3: string;
    templateTitleTypography1?: Typography;
    templateTitleTypography2?: Typography;
    templateTitleTypography3?: Typography;
    boxBackgroundColor1?: string;
    boxBackgroundColor2?: string;
    selected?: boolean;
  };

  const Template4: React.FC<Template4Props> = ({
    title1,
    title2,
    title3,
    templateTitleTypography1,
    templateTitleTypography2,
    templateTitleTypography3,
    boxBackgroundColor1,
    boxBackgroundColor2,
  }) => (
    <TemplateBox
      style={{ display: "flex", width: "100%", gap: "8px" }}
      backgroundColor={boxBackgroundColor1}
    >
      <TextField
        typography={templateTitleTypography1}
        backgroundColor={boxBackgroundColor2}
        margin="0"
        padding="4px"
        width="30%"
      >
        {nl2br(title1 ?? "Text 1")}
      </TextField>
      <Column>
        <TextField typography={templateTitleTypography2}>
          {nl2br(title2 ?? "Text 2")}
        </TextField>
        <TextField typography={templateTitleTypography3}>
          {nl2br(title3 ?? "Text 3")}
        </TextField>
      </Column>
    </TemplateBox>
  );

  const templateMap = {
    template1: (props: Template1Props) => <Template1 {...props} />,
    template2: (props: Template2Props) => <Template2 {...props} />,
    template3: (props: Template2Props) => <Template3 {...props} />,
    template4: (props: Template4Props) => <Template4 {...props} />,
  } as const;

  const renderMarkerTemplate = useMemo(() => {
    const tpl = property?.template;
    if (!tpl) return null;

    const Component =
      templateMap[
        (tpl?.templateType as keyof typeof templateMap) ?? "template1"
      ];
    return Component
      ? Component({
          image: tpl?.templateImage,
          title1: tpl?.templateTitle1,
          title2: tpl?.templateTitle2,
          title3: tpl?.templateTitle3,
          templateTitleTypography1: tpl?.templateTitleTypography1,
          templateTitleTypography2: tpl?.templateTitleTypography2,
          templateTitleTypography3: tpl?.templateTitleTypography3,
          boxBackgroundColor1: tpl?.boxBackgroundColor1,
          boxBackgroundColor2: tpl?.boxBackgroundColor2,
          selected,
        })
      : null;
  }, [property, selected]);

  return (
    <Wrapper
      ref={ref}
      className={className}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      dropType={dropType}
      selected={selected}
      childSelected={childSelected}
      disabled={deactivated}
      underlined={underlined}
      type={type}
      onMouseOver={() => toggleHover(true)}
      onMouseLeave={() => toggleHover(false)}
      hover={isHover}
      isTemplateWrapper={!!isRenderMarkerTemplate}
    >
      {!isRenderMarkerTemplate ? defaultLayerItem : renderMarkerTemplate}
    </Wrapper>
  );
};

const Wrapper = styled.div<{
  selected?: boolean;
  childSelected?: boolean;
  dropType?: DropType;
  hover?: boolean;
  disabled?: boolean;
  type?: string;
  underlined?: boolean;
  isTemplateWrapper?: boolean;
}>`
  user-select: none;
  width: 100%;
  height: ${({ isTemplateWrapper }) =>
    isTemplateWrapper ? "fit-content" : "35px"};
  display: flex;
  justify-content: start;
  align-items: center;
  cursor: pointer;
  color: ${({ selected, disabled, type, theme }) =>
    type === "widget" && disabled !== undefined
      ? disabled && !selected
        ? theme.classic.main.weak
        : selected || !disabled
        ? theme.classic.main.strongText
        : theme.classic.main.text
      : selected
      ? theme.classic.main.strongText
      : theme.classic.main.text};
  box-sizing: border-box;
  background-color: ${({ selected, theme, hover }) =>
    selected
      ? theme.classic.layers.selectedLayer
      : hover
      ? theme.classic.main.bg
      : "transparent"};
  border: 2px solid transparent;
  border-color: ${({ dropType, selected, theme }) =>
    dropType === "bottomOfChildren" ||
    dropType === "top" ||
    dropType === "bottom"
      ? dropType === "top"
        ? `${theme.classic.main.danger} transparent transparent transparent`
        : dropType === "bottom"
        ? `transparent transparent ${theme.classic.main.danger} transparent`
        : theme.classic.main.danger
      : selected
      ? theme.classic.layers.selectedLayer
      : "transparent"};
  border-bottom-color: ${({ underlined, theme }) =>
    underlined && theme.classic.layers.bottomBorder};
  font-size: ${fonts.sizes.xs}px;
  border-right: ${({ childSelected, theme }) =>
    childSelected ? `2px solid ${theme.classic.main.select}` : undefined};
`;

const ArrowIconWrapper = styled.div<{
  allSiblingsDoesNotHaveChildren?: boolean;
}>`
  flex: 0 0
    ${({ allSiblingsDoesNotHaveChildren }) =>
      allSiblingsDoesNotHaveChildren ? "2px" : "14px"};
  display: flex;
  align-items: center;
  align-self: stretch;
  text-align: center;
`;

const StyledIcon = styled(Icon)`
  color: ${(props) => props.theme.classic.main.strongText};
`;

const ArrowIcon = styled(Icon)<{ open?: boolean }>`
  transition: transform 0.15s ease;
  transform: ${({ open }) => open && "translateY(10%) rotate(90deg)"};
`;

const Input = styled.input`
  border: none;
  background: ${(props) => props.theme.classic.properties.deepBg};
  outline: none;
  color: ${(props) => props.theme.classic.leftMenu.text};
  padding: 3px;
  flex: auto;
  overflow: hidden;
`;

const LayerIcon = styled(Icon)<{
  disabled?: boolean;
  selected?: boolean;
  type?: string;
}>`
  margin: 0 5px;
  flex: 0 0 auto;
`;

const LayerName = styled(Text)<{ disabled?: boolean; selected?: boolean }>`
  user-select: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: auto;
  margin-left: ${metricsSizes.xs}px;
  overflow: hidden;
`;

const LayerCount = styled(Text)<{ selected?: boolean }>`
  margin-right: 10px;
  &::before {
    content: "(";
  }
  &::after {
    content: ")";
  }
`;

const HideableDiv = styled.div<{ isVisible?: boolean }>`
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
`;

const LayerActionsWrapper = styled.div``;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  word-break: break-all;
`;

const Image = styled.img<{
  width?: string;
  height?: string;
}>`
  width: ${({ width }) => width || "100%"};
  max-height: ${({ height }) => height || "100px"};
  object-fit: cover;
`;

const TemplateBox = styled.div<{
  selected?: boolean;
  backgroundColor?: string;
}>`
  border: 1px solid ${({ theme }) => theme.classic.main.border || "#3f3d45"};
  //padding: 2px;
  width: 100%;
  background-color: ${({ selected, theme, backgroundColor }) =>
    selected
      ? theme.classic.layers.selectedLayer
      : backgroundColor
      ? backgroundColor
      : "transparent"};
`;

const TextField = styled.div<{
  typography?: Typography;
  selected?: boolean;
  backgroundColor?: string;
  margin?: string;
  padding?: string;
  width?: string;
}>`
  //width: 100%;
  ${({ width }) => (width ? `width: ${width};` : "")}
  margin: ${({ margin }) => margin || "4px"};
  padding: ${({ padding }) => padding || "0"};
  ${({ typography }) => typographyStyles({ ...typography })}
  background-color: ${({ selected, theme, backgroundColor }) =>
    selected
      ? theme.classic.layers.selectedLayer
      : backgroundColor
      ? backgroundColor
      : "transparent"};
  word-break: auto-phrase;
`;

const stopPropagation = (event: React.MouseEvent<HTMLInputElement>) =>
  event.stopPropagation();

export default forwardRef(Layer);
