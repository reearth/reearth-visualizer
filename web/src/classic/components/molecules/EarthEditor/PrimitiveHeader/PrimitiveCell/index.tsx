import React from "react";

import { styled } from "@reearth/beta/services/theme";
import HelpButton from "@reearth/classic/components/atoms/HelpButton";
import Icon from "@reearth/classic/components/atoms/Icon";

import useHooks from "./hooks";

interface Props {
  className?: string;
  name: string;
  description: string;
  icon?: string;
  onDrop?: (
    layerId?: string,
    index?: number,
    location?: {
      lat: number;
      lng: number;
      height: number;
    },
  ) => void;
}

const PrimitiveCell: React.FC<Props> = ({ className, icon, name, description, onDrop }) => {
  const { ref } = useHooks(onDrop);

  return (
    <HelpButton
      descriptionTitle={name}
      description={description}
      balloonDirection="bottom"
      gap={15}>
      <Wrapper ref={ref} className={className}>
        <StyledIcon icon={icon} alt={name} size={20} />
      </Wrapper>
    </HelpButton>
  );
};

const Wrapper = styled.div`
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 3px 30px;
  border-radius: 3px;
  user-select: none;
`;

const StyledIcon = styled(Icon)`
  padding: 8px;
  width: 20px;
  height: 20px;
  border-radius: 3px;
  cursor: pointer;
  color: ${({ theme }) => theme.main.text};
  &:hover {
    background: ${({ theme }) => theme.main.lighterBg};
    color: ${({ theme }) => theme.main.strongText};
  }
`;

export default PrimitiveCell;
