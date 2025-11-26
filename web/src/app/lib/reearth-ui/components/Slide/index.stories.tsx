import { styled } from "@reearth/services/theme";
import { Meta } from "@storybook/react-vite";
import { useState } from "react";

import { Slide } from ".";

const Wrapper = styled.div`
  width: 200px;
  height: 200px;
`;

const Page = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ color }) => color};
`;

interface DefaultProps {
  pos: number;
  setPos: React.Dispatch<React.SetStateAction<number>>;
}

export default {
  component: Slide,
  decorators: [
    (Story) => {
      const [pos, setPos] = useState(0);
      return <Story pos={pos} setPos={setPos} />;
    }
  ]
} as Meta;

export const Default = ({ pos, setPos }: DefaultProps) => {
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
