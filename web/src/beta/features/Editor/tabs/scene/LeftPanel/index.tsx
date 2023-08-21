import React from "react";

import * as Popover from "@reearth/beta/components/Popover";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import Accordion from "@reearth/classic/components/atoms/Accordion";
import { styled } from "@reearth/services/theme";

export default function LeftPanel() {
  const scenes = ["scene1", "scene2", "scene3"];
  const layers = ["layer1", "layer2", "layer3"];

  return (
    <div style={{ maxWidth: "262px" }}>
      <Title>Outline</Title>
      <Accordion
        allowMultipleExpanded
        items={[
          {
            id: "scene",
            content: <Scene scenes={scenes} />,
            heading: <div>Scene</div>,
          },
          {
            id: "layers",
            content: <Layers layers={layers} />,
            heading: <div>Layers</div>,
          },
        ]}
      />
    </div>
  );
}

const Title = styled.div`
  font-size: 14px;
  font-weight: 500;
  background: ${({ theme }) => theme.bg[2]};
  padding: 8px 16px;
`;

function Scene({ scenes }: { scenes: string[] }) {
  return (
    <div style={{ padding: "16px" }}>
      {scenes.map(s => (
        <ListItem key={s} item={s} />
      ))}
    </div>
  );
}

function Layers({ layers }: { layers: string[] }) {
  const [addMenuOpen, setAddMenuOpen] = React.useState(false);

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column" }}>
      <Popover.Provider
        open={addMenuOpen}
        onOpenChange={() => setAddMenuOpen(s => !s)}
        placement="bottom-end">
        <Popover.Trigger asChild>
          <div
            onClick={() => setAddMenuOpen(true)}
            style={{
              padding: "8px",
              marginBottom: "8px",
              alignSelf: "flex-end",
            }}>
            Add New
          </div>
        </Popover.Trigger>
        <Popover.Content>
          <PopoverMenuContent
            size="md"
            items={[
              {
                name: "Add Layer from Resource",
                onClick: () => {},
              },
              {
                name: "Add Sketch Layer",
                onClick: () => {},
              },
            ]}
          />
        </Popover.Content>
      </Popover.Provider>
      {layers.map(l => (
        <ListItem key={l} item={l} menu={[{ name: "Delete", onClick: () => {} }]} />
      ))}
    </div>
  );
}

// utils
function ListItem({
  item,
  menu,
}: {
  item: string;
  menu?: { name: string; onClick: () => void }[];
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div
      style={{
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
      <div>{item}</div>
      <div>
        {menu && (
          <Popover.Provider
            open={menuOpen}
            onOpenChange={() => setMenuOpen(s => !s)}
            placement="left-start">
            <Popover.Trigger asChild>
              <div onClick={() => setMenuOpen(true)}>...</div>
            </Popover.Trigger>
            <Popover.Content>
              <PopoverMenuContent
                size="md"
                items={[...menu.map(m => ({ name: m.name, onClick: m.onClick }))]}
              />
            </Popover.Content>
          </Popover.Provider>
        )}
      </div>
    </div>
  );
}
