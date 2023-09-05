import { useReactiveVar } from "@apollo/client";
import React from "react";

import Icon, { Icons } from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import Text from "@reearth/beta/components/Text";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { showDataSourceManagerVar, showPopOverLayerButtonVar } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";

type LayersProps = {
  layers: NLSLayer[];
  onLayerDelete: (id: string) => void;
  onLayerSelect: (id: string) => void; // Todo
};

const Layers: React.FC<LayersProps> = ({ layers, onLayerDelete }) => {
  const [addMenuOpen, setAddMenuOpen] = React.useState(false);

  const showPopOverLayerButton = useReactiveVar(showPopOverLayerButtonVar);

  return (
    <StyledLayerContainer>
      <Popover.Provider
        open={addMenuOpen}
        onOpenChange={() => setAddMenuOpen(s => !s)}
        placement="bottom-end">
        <Popover.Trigger asChild>
          <StyledAddLayerIcon onClick={() => setAddMenuOpen(true)}>
            <Icon icon="addLayer" />
          </StyledAddLayerIcon>
        </Popover.Trigger>
        {showPopOverLayerButton && (
          <Popover.Content>
            <PopoverMenuContent
              size="md"
              items={[
                {
                  name: "Add Layer from Resource",
                  icon: "file",
                  onClick: () => {
                    showDataSourceManagerVar(true);
                    showPopOverLayerButtonVar(false);
                  },
                },
                {
                  name: "Add Sketch Layer",
                  icon: "pencilSimple",
                  onClick: () => {},
                },
              ]}
            />
          </Popover.Content>
        )}
      </Popover.Provider>
      {layers.map(l => (
        <ListItem
          key={l.id}
          item={l.title}
          menu={[
            {
              name: "Delete",
              icon: "bin",
              onClick: () => onLayerDelete(l.id),
            },
          ]}
        />
      ))}
    </StyledLayerContainer>
  );
};

const ListItem: React.FC<{
  item: string;
  menu?: { name: string; icon: Icons; onClick: () => void }[];
}> = ({ item, menu }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <StyledListItemContainer>
      <div>
        <Text size="body">{item}</Text>
      </div>
      <div>
        {menu && (
          <Popover.Provider
            open={menuOpen}
            onOpenChange={() => setMenuOpen(s => !s)}
            placement="left-start">
            <Popover.Trigger asChild>
              <StyledMenuIcon onClick={() => setMenuOpen(true)}>
                <Icon icon="actionbutton" />
              </StyledMenuIcon>
            </Popover.Trigger>
            <Popover.Content>
              <PopoverMenuContent
                size="md"
                items={menu.map(m => ({
                  name: m.name,
                  icon: m.icon,
                  onClick: m.onClick,
                }))}
              />
            </Popover.Content>
          </Popover.Provider>
        )}
      </div>
    </StyledListItemContainer>
  );
};

const StyledLayerContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledAddLayerIcon = styled.div`
  padding: 2px;
  margin-bottom: 2px;
  align-self: flex-end;
  cursor: pointer;
`;

const StyledListItemContainer = styled.div`
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledMenuIcon = styled.div`
  cursor: pointer;
`;

export default Layers;
