import React from "react";
import useFileInput from "use-file-input";

import HelpButton from "@reearth/components/atoms/HelpButton";
import Icon from "@reearth/components/atoms/Icon";
import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";

export type Format = "kml" | "czml" | "geojson" | "shape" | "reearth";

export type Props = {
  rootLayerId?: string;
  selectedLayerId?: string;
  onLayerRemove?: (id: string) => void;
  onLayerGroupCreate?: () => void;
  onLayerImport?: (file: File, format: Format) => void;
  onZoomToLayer?: (layerId: string) => void;
};

const LayerActions: React.FC<Props> = ({
  rootLayerId,
  selectedLayerId,
  onLayerRemove,
  onLayerImport,
  onLayerGroupCreate,
  onZoomToLayer,
}) => {
  const t = useT();
  const importLayer = useFileInput(
    (files: FileList) => {
      const file = files[0];
      if (!file) return;

      const extension = file.name.slice(file.name.lastIndexOf(".") + 1);
      const format: Format | undefined = ["kml", "czml", "geojson"].includes(extension)
        ? (extension as Format)
        : extension == "json"
        ? "reearth"
        : ["zip", "shp"].includes(extension)
        ? "shape"
        : undefined;
      if (!format) return;

      onLayerImport?.(file, format);
    },
    { accept: ".kml,.czml,.geojson,.shp,.zip,.json" },
  );

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
        <HelpButton descriptionTitle={t("Delete Selected Layer")} balloonDirection="bottom">
          <StyledIcon icon="bin" size={16} disabled={!selectedLayerId} />
        </HelpButton>
      </Action>
      <Action disabled={!rootLayerId} onClick={onLayerGroupCreate}>
        <HelpButton descriptionTitle={t("Create New Folder")} balloonDirection="bottom">
          <StyledIcon icon="folderAdd" size={16} />
        </HelpButton>
      </Action>
      <Action disabled={!rootLayerId} onClick={importLayer}>
        <HelpButton descriptionTitle={t("Add Layer")} balloonDirection="bottom">
          <StyledIcon icon="layerAdd" size={16} />
        </HelpButton>
      </Action>
      <Action
        disabled={!selectedLayerId}
        onClick={() => {
          if (selectedLayerId) {
            onZoomToLayer?.(selectedLayerId);
          }
        }}>
        <HelpButton descriptionTitle={t("Zoom To Layer")} balloonDirection="bottom">
          <StyledIcon icon="zoomToLayer" size={16} disabled={!selectedLayerId} />
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
