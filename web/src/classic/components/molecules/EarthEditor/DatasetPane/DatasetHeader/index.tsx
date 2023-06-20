import React from "react";

import { styled } from "@reearth/services/theme";

export interface Props {
  host: string;
}

const DatasetHeader: React.FC<Props> = ({ host }) => {
  return (
    <Wrapper>
      <HostName>{host}</HostName>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: ${props => props.theme.classic.layers.bg};
  height: 26px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
`;

const HostName = styled.h3`
  color: ${({ theme }) => theme.classic.leftMenu.text};
  font-size: 0.8rem;
  margin: 0;
`;

export default DatasetHeader;
