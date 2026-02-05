import { Button, PopupMenu } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useMemo } from "react";

import StyleNodeComp from "./StyleNode";
import { AppearanceNode, AppearanceType, StyleNode } from "./types";

type Props = {
  type: AppearanceType;
  appearanceNodes: AppearanceNode[];
  styleNodes: StyleNode[];
  editMode?: boolean;
  onStyleNodesUpdate: (type: AppearanceType, nodes: StyleNode[]) => void;
};

const StylePanel: FC<Props> = ({
  type,
  appearanceNodes,
  styleNodes,
  editMode,
  onStyleNodesUpdate
}) => {
  const t = useT();

  const createNode = useCallback(
    (nodeId: string) => {
      const nodeRef = appearanceNodes.find((node) => node.id === nodeId);
      if (!nodeRef) return;
      if (styleNodes.some((node) => node.id === nodeId)) return;
      const newStyleNodes = [...styleNodes];
      newStyleNodes.push({
        id: nodeId,
        title: nodeRef.title,
        field: nodeRef.field,
        type,
        valueType: "value",
        value: nodeRef.defaultValue,
        disableExpression: nodeRef.disableExpression,
        disableConditions: nodeRef.disableConditions
      });
      onStyleNodesUpdate(type, newStyleNodes);
    },
    [appearanceNodes, onStyleNodesUpdate, styleNodes, type]
  );

  const updateNode = useCallback(
    (node: StyleNode) => {
      const newStyleNodes = styleNodes.map((n) =>
        n && n.id === node.id ? node : n
      );
      onStyleNodesUpdate(type, newStyleNodes);
    },
    [styleNodes, type, onStyleNodesUpdate]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      const newStyleNodes = styleNodes.filter(
        (node) => node && node.id !== nodeId
      );
      onStyleNodesUpdate(type, newStyleNodes);
    },
    [styleNodes, type, onStyleNodesUpdate]
  );

  const menuItems = useMemo(
    () =>
      appearanceNodes.map((node) => ({
        id: node.id,
        title: node.title,
        disabled: styleNodes.some((n) => n.id === node.id),
        onClick: () => createNode(node.id)
      })),
    [appearanceNodes, styleNodes, createNode]
  );

  return (
    <Wrapper data-testid="style-panel-wrapper">
      <ButtonWrapper data-testid="button-wrapper">
        <PopupMenu
          extendTriggerWidth
          extendContentWidth
          menu={menuItems}
          label={
            <Button
              title={t("New node")}
              extendWidth
              size="small"
              icon="plus"
              appearance="primary"
              disabled={!editMode}
              data-testid="new-node-button"
            />
          }
        />
      </ButtonWrapper>
      <NodeListScrollArea data-testid="node-list-scroll-area">
        <NodeList data-testid="node-list">
          {styleNodes?.map((node) =>
            !node.notSupported ? (
              <StyleNodeComp
                key={node.id}
                node={node}
                onUpdate={updateNode}
                onDelete={deleteNode}
                editMode={editMode}
                data-testid={`style-node-${node.id}`}
              />
            ) : null
          )}
        </NodeList>
      </NodeListScrollArea>
    </Wrapper>
  );
};

export { StylePanel };

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  padding: `${theme.spacing.small}px 0`,
  minHeight: 0,
  flex: 1
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  padding: `0 ${theme.spacing.small}px`
}));

const NodeListScrollArea = styled("div")(() => ({
  minHeight: 0,
  flex: 1,
  overflowY: "auto"
}));

const NodeList = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  padding: `0 ${theme.spacing.small}px`
}));
