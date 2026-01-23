import { Meta, StoryObj } from "@storybook/react-vite";

import { Area, AreaProps } from ".";

const meta: Meta<AreaProps> = {
  component: Area
};
export default meta;

const colors: string[] = [];
for (let i = 0; i < 20; i++) {
  colors.push(`hsl(${Math.random() * 360}, 100%, 80%)`);
}

const resizeHandleColor = "rgba(0, 0, 0, 0.5)";

export const Default: StoryObj<typeof Area> = {
  render: () => (
    <div style={{ width: "100%", height: "800px" }}>
      <Area extend asWrapper>
        <Area
          direction="column"
          resizableEdge="right"
          backgroundColor={colors[0]}
          resizeHandleColor={resizeHandleColor}
        >
          Left
        </Area>
        <Area direction="column" extend asWrapper>
          <Area initialHeight={50} backgroundColor={colors[1]}>
            Center-Top
          </Area>
          <Area extend backgroundColor={colors[2]}>
            Center
          </Area>
          <Area
            resizableEdge="top"
            resizeHandleColor={resizeHandleColor}
            backgroundColor={colors[0]}
          >
            Center-Bottom
          </Area>
        </Area>
        <Area
          direction="column"
          resizableEdge="left"
          resizeHandleColor={resizeHandleColor}
          backgroundColor={colors[3]}
        >
          Right
        </Area>
      </Area>
    </div>
  )
};

export const Complicated: StoryObj<typeof Area> = {
  render: () => (
    <div style={{ width: "100%", height: "800px" }}>
      <Area extend direction="column" asWrapper>
        <Area initialHeight={40} backgroundColor={colors[0]}>
          Header
        </Area>
        <Area extend asWrapper>
          <Area
            direction="column"
            resizableEdge="right"
            resizeHandleColor={resizeHandleColor}
            initialWidth={200}
            backgroundColor={colors[1]}
          >
            Left
          </Area>
          <Area direction="column" extend asWrapper>
            <Area initialHeight={50} asWrapper>
              <Area
                initialWidth={50}
                direction="column"
                resizableEdge="right"
                resizeHandleColor={resizeHandleColor}
                backgroundColor={colors[2]}
              />
              <Area extend backgroundColor={colors[3]} />
            </Area>
            <Area extend backgroundColor={colors[4]}>
              Center
            </Area>
            <Area
              resizableEdge="top"
              resizeHandleColor={resizeHandleColor}
              initialHeight={50}
              backgroundColor={colors[5]}
            >
              Center-Bottom
            </Area>
          </Area>
          <Area
            direction="column"
            resizableEdge="left"
            initialWidth={200}
            resizeHandleColor={resizeHandleColor}
            backgroundColor={colors[6]}
          >
            Right
          </Area>
          <Area
            direction="column"
            resizableEdge="left"
            initialWidth={50}
            resizeHandleColor={resizeHandleColor}
            backgroundColor={colors[7]}
          />
        </Area>
        <Area initialHeight={40} backgroundColor={colors[8]}>
          Footer
        </Area>
      </Area>
    </div>
  )
};
