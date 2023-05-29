import React, { useMemo } from "react";

import SidePanelCard from "@reearth/beta/features/SidePanelCard";
import { Tab } from "@reearth/beta/hooks";
import { styled } from "@reearth/services/theme";

type PanelcContent = {
  maxHeight?: string;
  children: React.ReactNode;
};

type Props = {
  tab: Tab;
};

const LeftPanel: React.FC<Props> = ({ tab }) => {
  const contents = useMemo<PanelcContent[]>(() => {
    switch (tab) {
      case "scene":
        return [
          {
            children: (
              <SidePanelCard title={"Outline"}>
                {[...Array(100)].map((_, i) => (
                  <div key={i}>scrollable / {i}</div>
                ))}
              </SidePanelCard>
            ),
          },
        ];
      case "story":
        return [
          {
            children: (
              <SidePanelCard title={"Pages"}>
                {[...Array(100)].map((_, i) => (
                  <div key={i}>scrollable / {i}</div>
                ))}
              </SidePanelCard>
            ),
          },
        ];
      case "widgets":
      case "publish":
      default:
        return [];
    }
  }, [tab]);

  return (
    <S.Wrapper>
      {contents.map((content, i) => (
        <S.Item maxHeight={content.maxHeight} key={i}>
          {content.children}
        </S.Item>
      ))}
    </S.Wrapper>
  );
};

export default LeftPanel;

const S = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 4px;
    gap: 4px;
    background: #171618;
  `,
  Item: styled.div<{ maxHeight?: string }>`
    flex-grow: 1;
    height: 100%;
    ${({ maxHeight }) => maxHeight && `max-height: ${maxHeight};`}
  `,
};
