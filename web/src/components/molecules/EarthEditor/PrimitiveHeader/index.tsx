import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import { metrics, styled } from "@reearth/theme";

import PrimitiveCell from "./PrimitiveCell";

export type Props = {
  className?: string;
  loading?: boolean;
  primitives?:
    | {
        id: string;
        name: string;
        description: string;
        icon: string;
        onDrop?: (
          layerId?: string | undefined,
          index?: number | undefined,
          location?:
            | {
                lat: number;
                lng: number;
              }
            | undefined,
        ) => Promise<void>;
      }[]
    | undefined;
};

const PrimitiveHeader: React.FC<Props> = ({ className, primitives, loading }) => {
  return (
    <Wrapper className={className}>
      {primitives?.map(p => (
        <PrimitiveCell
          key={p.id}
          name={p.name}
          description={p.description}
          icon={p.icon}
          onDrop={p.onDrop}
        />
      ))}
      {loading && <Loading />}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: ${metrics.primitiveHeaderHeight}px;
  background: ${props => props.theme.primitiveHeader.bg};
`;

export default PrimitiveHeader;
