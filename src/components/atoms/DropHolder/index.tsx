import React from "react";
import { useIntl } from "react-intl";

import { styled } from "@reearth/theme";

export interface Props {
  className?: string;
}

const DropHolder: React.FC<Props> = ({ className }) => {
  const intl = useIntl();

  return (
    <DraggableView className={className}>
      <DragMessage>{intl.formatMessage({ defaultMessage: "Drop here" })}</DragMessage>
    </DraggableView>
  );
};

const DraggableView = styled.div`
  position: absolute;
  z-index: ${props => props.theme.zIndexes.dropDown};
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${props => props.theme.main.accent};
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DragMessage = styled.p`
  color: ${props => props.theme.main.text};
  opacity: 1;
`;

export default DropHolder;
