import React from "react";

import Loading from "@reearth/classic/components/atoms/Loading";
import Resizable from "@reearth/classic/components/atoms/Resizable";
import { metrics } from "@reearth/classic/theme";
import { styled } from "@reearth/services/theme";

export interface Props {
  loading?: boolean;
  loaded?: boolean;
  header?: React.ReactNode;
  left?: React.ReactNode;
  centerTop?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

const EarthEditorPage: React.FC<Props> = ({
  loading,
  loaded,
  header,
  left,
  right,
  center,
  centerTop,
}) => {
  return (
    <>
      {loading && <Loading />}
      {loaded && (
        <Wrapper>
          {header && <div>{header}</div>}
          <Wrapper2>
            <Resizable
              direction="vertical"
              gutter="end"
              size={metrics.propertyMenuMinWidthClassic}
              minSize={metrics.propertyMenuMinWidthClassic}
              maxSize={metrics.propertyMenuMaxWidthClassic}>
              {left}
            </Resizable>
            <Center>
              <div>{centerTop}</div>
              <CenterMiddle>{center}</CenterMiddle>
            </Center>
            <Resizable
              direction="vertical"
              gutter="start"
              size={metrics.propertyMenuMinWidthClassic}
              minSize={metrics.propertyMenuMinWidthClassic}
              maxSize={metrics.propertyMenuMaxWidthClassic}>
              {right}
            </Resizable>
          </Wrapper2>
        </Wrapper>
      )}
    </>
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Wrapper2 = styled.div`
  display: flex;
  flex: auto;
  overflow: hidden;
`;

const Center = styled.div`
  display: flex;
  flex-flow: column;
  align-items: stretch;
  flex: auto;
`;

const CenterMiddle = styled.div`
  flex: 1;
  overflow: hidden;
`;

export default EarthEditorPage;
