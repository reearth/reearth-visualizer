import { useMemo } from "react";

import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import PopoverMenuContent, { MenuItem } from "@reearth/beta/components/PopoverMenuContent";
import { InstallableStoryBlock } from "@reearth/services/api/storytellingApi/blocks";
import { styled } from "@reearth/services/theme";

type Props = {
  openBlocks: boolean;
  installableStoryBlocks?: InstallableStoryBlock[];
  onBlockOpen: () => void;
  onBlockAdd: (extensionId: string, pluginId: string) => void;
};

const BlockAddBar: React.FC<Props> = ({
  installableStoryBlocks,
  openBlocks,
  onBlockOpen,
  onBlockAdd,
}) => {
  const items = useMemo(() => {
    const blockSelection: MenuItem[] =
      installableStoryBlocks?.map?.(sb => {
        return {
          name: sb.name,
          icon: "plugin",
          onClick: () => {
            onBlockAdd(sb.extensionId, sb.pluginId);
            onBlockOpen();
            console.log("SB: ", sb);
          },
        };
      }) ?? [];
    return blockSelection;
  }, [installableStoryBlocks, onBlockAdd, onBlockOpen]);

  return (
    <Wrapper>
      <Popover.Provider
        open={openBlocks}
        placement="bottom-start"
        offset={-10}
        onOpenChange={onBlockOpen}>
        <Popover.Trigger asChild>
          <Bar persist={openBlocks}>
            <StyledIcon icon="plus" size={16} onClick={onBlockOpen} />
            <Line />
          </Bar>
        </Popover.Trigger>
        <Popover.Content>
          <PopoverMenuContent size="md" width="200px" items={items} />
        </Popover.Content>
      </Popover.Provider>
    </Wrapper>
  );
};

export default BlockAddBar;

const Wrapper = styled.div`
  height: 0;
  position: relative;
`;

const Bar = styled.div<{ persist?: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  top: -14px;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 28px;

  * {
    opacity: ${({ persist }) => (persist ? "100%" : 0)};
  }

  :hover {
    * {
      opacity: 100%;
    }
  }
`;

const StyledIcon = styled(Icon)`
  color: ${({ theme }) => theme.content.main};
  background: ${({ theme }) => theme.select.main};
  border-radius: 4px;
  padding: 2px;
  cursor: pointer;
  transition: opacity 0.4s;
`;

const Line = styled.div`
  height: 1px;
  width: 100%;
  background: ${({ theme }) => theme.select.main};
  transition: opacity 0.4s;
`;
