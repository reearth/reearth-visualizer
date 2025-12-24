import { IconButton, IconName, PopupMenu } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

import { appearanceNodes } from "../appearanceNodes";
import {
  StyleCondition,
  StyleNode,
  StyleSimpleValue,
  StyleValueType
} from "../types";

import ConditionsTab from "./ConditionsTab";
import ExpressionTab from "./ExpressionTab";
import ValueTab from "./ValueTab";

type Props = {
  node: StyleNode;
  editMode?: boolean;
  onUpdate: (node: StyleNode) => void;
  onDelete: (nodeId: string) => void;
};

const actions: {
  id: StyleValueType;
  icon: IconName;
  match: StyleValueType[];
}[] = [
  { id: "value", icon: "textAa", match: ["value"] },
  {
    id: "expression",
    icon: "bracketsCurly",
    match: ["expression", "deepExpression"]
  },
  { id: "conditions", icon: "if", match: ["conditions", "deepConditions"] }
];

const StyleNodeComp: FC<Props> = ({ node, editMode, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState<StyleValueType>(node.valueType);

  const valueOptions = useMemo(
    () =>
      appearanceNodes[node.type]
        .find((n) => n.id === node.id)
        ?.valueOptions?.map((v) => ({
          value: v,
          label: v
        })),
    [node.type, node.id]
  );

  const theme = useTheme();

  const t = useT();

  const optionsMenu = useMemo(() => {
    return [
      {
        id: "delete",
        title: t("Delete"),
        icon: "trash" as const,
        onClick: () => onDelete(node.id)
      }
    ];
  }, [node.id, onDelete, t]);

  const handleValueUpdate = useCallback(
    (value: StyleSimpleValue) => {
      onUpdate({ ...node, valueType: "value", value });
    },
    [node, onUpdate]
  );

  const handleExpressionUpdate = useCallback(
    (expression: string) => {
      onUpdate({ ...node, valueType: "expression", expression });
    },
    [node, onUpdate]
  );

  const handleConditionsUpdate = useCallback(
    (conditions: StyleCondition[]) => {
      onUpdate({ ...node, valueType: "conditions", conditions });
    },
    [node, onUpdate]
  );

  return (
    <Wrapper
      data-testid={`style-node-wrapper-${node.id}`}
      id={`style-node-wrapper-${node.id}`}
    >
      <HeaderWrapper data-testid={`style-node-header-${node.id}`}>
        <TitleWrapper data-testid={`style-node-title-${node.id}`}>
          {node.title}
        </TitleWrapper>
        <Actions data-testid={`style-node-actions-${node.id}`}>
          {actions.map((action) => (
            <IconButton
              key={action.id}
              icon={action.icon}
              size="small"
              iconColor={
                action.match.includes(activeTab)
                  ? theme.content.main
                  : theme.content.weaker
              }
              appearance="simple"
              onClick={() => setActiveTab(action.id)}
              data-testid={`style-node-action-${action.id}-${node.id}`}
            />
          ))}
          {!!optionsMenu && (
            <OptionsWrapper
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              data-testid={`style-node-options-wrapper-${node.id}`}
            >
              <PopupMenu
                label={
                  <IconButton
                    icon="dotsThreeVertical"
                    size="small"
                    appearance="simple"
                    disabled={!editMode}
                    data-testid={`style-node-options-button-${node.id}`}
                  />
                }
                placement="bottom-start"
                menu={optionsMenu}
                data-testid={`style-node-options-menu-${node.id}`}
              />
            </OptionsWrapper>
          )}
        </Actions>
      </HeaderWrapper>
      <ContentWrapper data-testid={`style-node-content-${node.id}`}>
        {activeTab === "value" && (
          <ValueTab
            field={node.field}
            value={node.value as StyleSimpleValue}
            valueOptions={valueOptions}
            editMode={editMode}
            onUpdate={handleValueUpdate}
            data-testid={`style-node-value-tab-${node.id}`}
          />
        )}
        {activeTab === "expression" && (
          <ExpressionTab
            expression={node.expression ?? ""}
            onUpdate={handleExpressionUpdate}
            disabled={node.disableExpression}
            editMode={editMode}
            data-testid={`style-node-expression-tab-${node.id}`}
          />
        )}
        {activeTab === "deepExpression" && (
          <ExpressionTab
            disabled
            data-testid="style-node-deep-expression-tab"
          />
        )}
        {activeTab === "conditions" && (
          <ConditionsTab
            conditions={node.conditions}
            field={node.field}
            valueOptions={valueOptions}
            editMode={editMode}
            onUpdate={handleConditionsUpdate}
            disabled={node.disableConditions}
            data-testid={`style-node-conditions-tab-${node.id}`}
          />
        )}
        {activeTab === "deepConditions" && (
          <ConditionsTab
            disabled
            data-testid="style-node-deep-conditions-tab"
          />
        )}
      </ContentWrapper>
    </Wrapper>
  );
};

export default StyleNodeComp;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.radius.small,
  width: "100%",
  background: "#ffffff08",
  gap: theme.spacing.micro,
  alignItems: "flex-start",
  minHeight: 62,
  paddingLeft: theme.spacing.smallest,
  overflow: "hidden"
}));

const HeaderWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${theme.spacing.smallest}px ${theme.spacing.smallest}px 0 ${theme.spacing.smallest}px`,
  width: "100%"
}));

const TitleWrapper = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  flex: 1
}));

const Actions = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.smallest
}));

const OptionsWrapper = styled("div")(() => ({
  flexShrink: 0
}));

const ContentWrapper = styled("div")<{ active?: string }>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing.smallest,
  width: "100%"
}));
