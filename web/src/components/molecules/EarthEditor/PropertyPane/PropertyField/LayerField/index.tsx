import React, { useCallback, useMemo, useState } from "react";

import Button from "@reearth/components/atoms/Button";
import LayerSelectionModal, {
  Layer as LayerType,
} from "@reearth/components/molecules/EarthEditor/LayerSelectionModal";
import { styled } from "@reearth/theme";
import deepFind from "@reearth/util/deepFind";

import { FieldProps } from "../types";

export type Layer = LayerType;

export type Props = FieldProps<string> & {
  className?: string;
  layers?: Layer[];
};

const LayerField: React.FC<Props> = ({
  className,
  value,
  onChange,
  disabled,
  overridden,
  linked,
  layers,
}) => {
  const [modalActive, setModalActive] = useState(false);
  const handleOpen = useCallback(() => setModalActive(true), []);
  const handleClose = useCallback(() => setModalActive(false), []);
  const handleChange = useCallback(
    (v: string) => {
      setModalActive(false);
      onChange?.(v);
    },
    [onChange],
  );
  const layerTitle = useMemo(
    () =>
      deepFind(
        layers,
        l => l.id === value,
        l => l.children,
      )[0]?.title,
    [layers, value],
  );

  return (
    <Wrapper className={className}>
      <Title selected={!!(layerTitle || value)} linked={linked} overridden={overridden}>
        {layerTitle || value || "Not selected"}
      </Title>
      <Button disabled={disabled} onClick={handleOpen}>
        Select
      </Button>
      <LayerSelectionModal
        active={modalActive}
        layers={layers}
        selected={value}
        onSelect={handleChange}
        onClose={handleClose}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

const Title = styled.div<{ selected?: boolean; linked?: boolean; overridden?: boolean }>`
  flex: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: break-word;
  padding-right: 10px;
  color: ${({ selected, overridden, linked, theme }) =>
    selected
      ? overridden
        ? theme.main.danger
        : linked
        ? theme.main.link
        : theme.main.text
      : theme.main.paleBg};
`;

export default LayerField;
