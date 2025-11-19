import { IconButton } from "@reearth/app/lib/reearth-ui";
import { Meta, StoryObj } from "@storybook/react-vite";

import { EntryItem } from ".";

const meta: Meta<typeof EntryItem> = {
  component: EntryItem,
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    )
  ]
};

export default meta;

type Story = StoryObj<typeof EntryItem>;

export const Default: Story = {
  args: {
    title: "Item"
  }
};

export const Highlighted: Story = {
  args: {
    title: "Item",
    highlighted: true
  }
};

export const Icon: Story = {
  args: {
    title: "Item",
    icon: "file"
  }
};

export const LongText: Story = {
  args: {
    title: "Item With A Long Long Long Long Long Long Long Long Name",
    icon: "file"
  }
};

export const OptionsMenu: Story = {
  args: {
    title: "Item",
    optionsMenu: [
      {
        id: "1",
        title: "Option 1",
        onClick: () => console.log("Option 1 clicked")
      },
      {
        id: "2",
        title: "Option 2 with icon",
        icon: "setting",
        onClick: () => console.log("Option 2 clicked")
      }
    ]
  }
};

export const Actions: Story = {
  args: {
    title: "Item",
    actions: [
      {
        comp: (
          <IconButton
            key="1"
            icon="setting"
            size="small"
            appearance="simple"
            onClick={() => console.log("Action 1 clicked")}
          />
        )
      },
      {
        comp: (
          <IconButton
            key="2"
            icon="pencilSimple"
            size="small"
            appearance="simple"
            onClick={() => console.log("Action 2 clicked")}
          />
        ),
        keepVisible: true
      }
    ]
  }
};

export const DisableHover: Story = {
  args: {
    title: "Item",
    disableHover: true,
    actions: [
      {
        comp: (
          <IconButton
            key="1"
            icon="setting"
            size="small"
            appearance="simple"
            onClick={() => console.log("Action 1 clicked")}
          />
        )
      },
      {
        comp: (
          <IconButton
            key="2"
            icon="pencilSimple"
            size="small"
            appearance="simple"
            onClick={() => console.log("Action 2 clicked")}
          />
        ),
        keepVisible: true
      }
    ]
  }
};
