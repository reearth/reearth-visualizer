import React from "react";

import { styled } from "@reearth/theme";
import useHooks from "./hooks";
import HelpButton from "@reearth/components/atoms/HelpButton";
import Icon from "@reearth/components/atoms/Icon";
import { useIntl } from "react-intl";
import { Format } from "../Layer";

export type Props = {
  rootLayerId?: string;
  selectedLayerId?: string;
  onLayerRemove?: (id: string) => void;
  onLayerGroupCreate?: () => void;
  onLayerImport?: (file: File, format: Format) => void;
};

const LayerActions: React.FC<Props> = ({
  rootLayerId,
  selectedLayerId,
  onLayerRemove,
  onLayerImport,
  onLayerGroupCreate,
}) => {
  const intl = useIntl();
  const { importLayer } = useHooks({
    onLayerImport,
  });

  return (
    <ActionWrapper
      onClick={e => {
        e.stopPropagation();
      }}>
      <Action
        disabled={!selectedLayerId}
        onClick={() => {
          if (selectedLayerId) {
            onLayerRemove?.(selectedLayerId);
          }
        }}>
        <HelpButton
          descriptionTitle={intl.formatMessage({ defaultMessage: "Delete selected layer." })}
          balloonDirection="bottom">
          <StyledIcon icon="bin" size={16} disabled={!selectedLayerId} />
        </HelpButton>
      </Action>
      <Action disabled={!rootLayerId} onClick={onLayerGroupCreate}>
        <HelpButton
          descriptionTitle={intl.formatMessage({ defaultMessage: "Create new folder." })}
          balloonDirection="bottom">
          <StyledIcon icon="folderAdd" size={16} />
        </HelpButton>
      </Action>
      <Action disabled={!rootLayerId} onClick={importLayer}>
        <HelpButton
          descriptionTitle={intl.formatMessage({ defaultMessage: "Add Layer." })}
          balloonDirection="bottom">
          <StyledIcon icon="layerAdd" size={16} />
        </HelpButton>
      </Action>
    </ActionWrapper>
  );
};

const ActionWrapper = styled.div`
  flex: 1;
`;

const Action = styled.span<{ disabled?: boolean }>`
  float: right;
  margin-right: 10px;
  user-select: none;
`;

const StyledIcon = styled(Icon)<{ disabled?: boolean }>`
  padding: 3px;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  color: ${({ disabled, theme }) => (disabled ? theme.main.weak : theme.main.text)};
  border-radius: 5px;
  &:hover {
    background-color: ${({ disabled, theme }) => (disabled ? null : theme.main.bg)};
  }
`;

export default LayerActions;
