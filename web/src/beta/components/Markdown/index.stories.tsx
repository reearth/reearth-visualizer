import { Meta, StoryObj } from "@storybook/react";

import { styled } from "@reearth/services/theme";

import Markdown, { Props } from ".";

const markdown = `
> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

* Lists
* [ ] todo
* [x] done


[Link](https://reactjs.org)

### Image 
![Alt text](https://images.pexels.com/photos/5656637/pexels-photo-5656637.jpeg?auto=compress&cs=tinysrgb&w=200)

A table:

| a | b |
| - | - |
`;

const meta: Meta<typeof Markdown> = {
  component: Markdown,
};

export default meta;

type Story = StoryObj<typeof Markdown>;

export const Default: Story = (args: Props) => {
  return (
    <Wrapper>
      <div>
        <Markdown {...args} />
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10%;
  margin-left: 2rem;
  margin-top: 2rem;
  height: 300px;
`;

Default.args = {
  children: markdown,
  onClick: () => console.log("clicked"),
  onDoubleClick: () => console.log("double clicked clicked"),
};
