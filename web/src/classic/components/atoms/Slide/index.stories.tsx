import { Meta } from "@storybook/react";
import { useState } from "react";

import { styled } from "@reearth/theme";

import Slide from ".";

const Wrapper = styled.div`
  width: 200px;
  height: 200px;
`;

const Page = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ color }) => color};
`;

export default {
  title: "atoms/Slide",
  component: Slide,
} as Meta;

export const Default = () => {
  const [pos, setPos] = useState(0);
  return (
    <Wrapper>
      <Slide pos={pos}>
        <Page key="1" color="red" onClick={() => setPos(1)} />
        <Page key="2" color="yellow" onClick={() => setPos(2)} />
        <Page key="3" color="green" onClick={() => setPos(0)} />
      </Slide>
    </Wrapper>
  );
};
