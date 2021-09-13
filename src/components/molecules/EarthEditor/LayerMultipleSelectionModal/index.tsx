import React from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Modal from "@reearth/components/atoms/Modal";
import Text from "@reearth/components/atoms/Text";
import TreeView, { Props as TreeViewProps } from "@reearth/components/atoms/TreeView";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import useHooks, { Layer as LayerType } from "./hooks";

export type Layer = LayerType;

export type Props = {
  active?: boolean;
  layers?: Layer[];
  selected?: string[];
  onSelect?: (layers: Layer[]) => void;
  onClose?: () => void;
};

const LayerMultipleSelectionModal: React.FC<Props> = ({
  active,
  layers = [],
  selected = [],
  onSelect,
  onClose,
}) => {
  const {
    selectedLeftLayers,
    selectedRightLayers,
    selectLeftLayers,
    selectRightLayers,
    leftLayers,
    rightLayers,
    ok,
    addLayers,
    removeLayers,
    dropRightLayer,
    TreeViewItem,
  } = useHooks({ active, layers, selected, onSelect });
  const intl = useIntl();

  return (
    <Modal
      title={intl.formatMessage({ defaultMessage: "Layer selection" })}
      size="md"
      isVisible={active}
      onClose={onClose}
      button1={
        <Button
          large
          text={intl.formatMessage({ defaultMessage: "Save" })}
          onClick={ok}
          buttonType="primary"
        />
      }
      button2={
        <Button
          large
          text={intl.formatMessage({ defaultMessage: "Cancel" })}
          onClick={onClose}
          buttonType="secondary"
        />
      }>
      <Main>
        <Pane>
          <TreeViewTitle size="s">
            {intl.formatMessage({ defaultMessage: "Selectable Layers" })}
          </TreeViewTitle>
          <StyledTreeView
            item={leftLayers}
            selected={selectedLeftLayers}
            onSelect={selectLeftLayers}
            renderItem={TreeViewItem}
            selectable
            expandable
            multiple
          />
        </Pane>
        <CenterPane>
          <Button
            large
            text={intl.formatMessage({ defaultMessage: "Add" })}
            icon="arrowLongRight"
            iconRight
            buttonType="primary"
            onClick={addLayers}
          />
          <Button
            large
            text={intl.formatMessage({ defaultMessage: "Remove" })}
            icon="arrowLongLeft"
            buttonType="primary"
            onClick={removeLayers}
          />
        </CenterPane>
        <Pane>
          <TreeViewTitle size="s">
            {intl.formatMessage({ defaultMessage: "Stories" })}
          </TreeViewTitle>
          <StyledTreeView
            item={rightLayers}
            selected={selectedRightLayers}
            onSelect={selectRightLayers}
            onDrop={dropRightLayer}
            renderItem={TreeViewItem}
            selectable
            expandable
            draggable
            droppable
            multiple
            dragItemType="layerSelectionModalLayer"
          />
        </Pane>
      </Main>
    </Modal>
  );
};

const Main = styled.main`
  padding: 10px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  color: ${props => props.theme.main.strongText};
`;

const Pane = styled.div`
  flex: 1;
  box-sizing: border-box;
  min-width: 0; /* prevent overflow */
`;

const CenterPane = styled.div`
  padding: ${metricsSizes["m"]}px;
  display: flex;
  justify-content: center;
  align-content: center;
  box-sizing: border-box;
  flex-flow: column;
`;

const InnerTreeView = (props: TreeViewProps<Layer, HTMLDivElement>) => (
  <TreeView<Layer, HTMLDivElement> {...props} />
);

const TreeViewTitle = styled(Text)`
  padding-bottom: 8px;
`;

const StyledTreeView = styled(InnerTreeView)`
  border: 1px solid ${props => props.theme.main.border};
  height: 250px;
  box-sizing: border-box;
`;

export default LayerMultipleSelectionModal;
