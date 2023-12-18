import React from "react";

import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

export interface Props {
  className?: string;
}

const DropHolder: React.FC<Props> = ({ className }) => {
  const t = useT();

  return (
    <DraggableView className={className}>
      <DragMessage>{t("Drop here")}</DragMessage>
    </DraggableView>
  );
};

const DraggableView = styled.div`
  position: absolute;
  z-index: ${props => props.theme.zIndexes.visualizer.overlay};
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${props => props.theme.select.main};
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DragMessage = styled.p`
  color: ${props => props.theme.content.main};
  opacity: 1;
`;

export default DropHolder;
