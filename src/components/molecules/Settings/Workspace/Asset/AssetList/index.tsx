import React from "react";
import { styled } from "@reearth/theme";
import AssetItem from "@reearth/components/molecules/Settings/Workspace/Asset/AssetItem";

export type Item = {
  id: string;
  teamId: string;
  name: string;
  size: number;
  url: string;
  contentType: string;
  createdAt?: Date;
};

export type Props = {
  items: Item[];
  onRemove?: (id: string) => void;
};

const AssetList: React.FC<Props> = ({ items, onRemove }) => {
  return (
    <Wrapper>
      {items.map(item => (
        <AssetItem key={item.id} {...item} onRemove={onRemove} />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 250px 250px 250px;
  grid-gap: 20px;
`;

export default AssetList;
