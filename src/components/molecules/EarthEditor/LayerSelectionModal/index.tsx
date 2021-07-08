import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { styled } from "@reearth/theme";
import Modal from "@reearth/components/atoms/Modal";
import Button from "@reearth/components/atoms/Button";
import TreeView, { Item, Props as TreeViewProps } from "@reearth/components/atoms/TreeView";
import LayerTreeViewItem, { Layer as LayerType } from "../LayerTreeViewItem";

export type Layer = LayerType<{
  id: string;
  children?: Layer[];
}>;

export type Props = {
  active?: boolean;
  layers?: Layer[];
  selected?: string;
  multipleSelectable?: boolean;
  groupSelectable?: boolean;
  onSelect?: (selected: string) => void;
  onClose?: () => void;
};

const LayerSelectionModal: React.FC<Props> = ({
  active,
  layers = [],
  selected,
  groupSelectable,
  multipleSelectable,
  onSelect,
  onClose,
}) => {
  const item = useMemo<Item<LayerType>>(
    () => ({ id: "", content: {}, children: convert(layers, groupSelectable) }),
    [layers, groupSelectable],
  );

  const [selectedLayer, selectLayer] = useState<string[]>(selected ? [selected] : []);

  const ok = useCallback(
    () => (selectedLayer?.length ? onSelect?.(selectedLayer[0]) : undefined),
    [onSelect, selectedLayer],
  );

  const select = useCallback((s: Item<LayerType>[]) => {
    if (s.length) {
      selectLayer([s[0].id]);
    }
  }, []);

  useEffect(() => selectLayer(selected ? [selected] : []), [selected]);

  useEffect(() => {
    if (!active) {
      selectLayer(selected ? [selected] : []);
    }
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  const intl = useIntl();

  return (
    <Modal
      title={intl.formatMessage({ defaultMessage: "Layer selection" })}
      size="md"
      isVisible={active}
      onClose={onClose}
      button1={
        <Button
          text={intl.formatMessage({ defaultMessage: "Save" })}
          onClick={ok}
          buttonType="primary"
        />
      }
      button2={
        <Button
          text={intl.formatMessage({ defaultMessage: "Cancel" })}
          onClick={onClose}
          buttonType="secondary"
        />
      }>
      <Main>
        <StyledTreeView
          item={item}
          selected={selectedLayer}
          onSelect={select}
          renderItem={LayerTreeViewItem}
          selectable
          expandable
          multiple={multipleSelectable}
        />
      </Main>
    </Modal>
  );
};

const Main = styled.main`
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  color: ${props => props.theme.main.strongText};
`;

const InnerTreeView = (props: TreeViewProps<LayerType, HTMLDivElement>) => (
  <TreeView<LayerType, HTMLDivElement> {...props} />
);

const StyledTreeView = styled(InnerTreeView)`
  border: 1px solid ${props => props.theme.main.border};
  height: 250px;
  box-sizing: border-box;
  width: 80%;
  margin: 0 auto;
`;

export default LayerSelectionModal;

const convert = (layers: Layer[], groupSelectable?: boolean): Item<LayerType>[] =>
  layers.map<Item<LayerType>>(l => ({
    id: l.id,
    content: l,
    children: l.children ? convert(l.children) : undefined,
    selectable: !l.children?.length || groupSelectable,
    expandable: !!l.children?.length,
  }));
