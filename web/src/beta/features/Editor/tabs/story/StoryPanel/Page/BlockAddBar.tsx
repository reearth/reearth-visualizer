import { useMemo } from "react";

import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import { styled } from "@reearth/services/theme";

type Props = {
  installableBlocks?: any[];
  openBlocks: boolean;
  onBlockOpen: () => void;
  onBlockClick: (id: string) => void;
};

const BlockAddBar: React.FC<Props> = ({
  installableBlocks,
  openBlocks,
  onBlockOpen,
  onBlockClick,
}) => {
  const blocks = useMemo(() => {
    const blockSelection = [
      {
        name: "something",
        onClick: () => {
          onBlockClick("ID1234");
          console.log("ASDFL:KJSDFLK:", installableBlocks);
        },
      },
      {
        name: "something",
        onClick: () => {
          onBlockClick("ID5678");
          console.log("ASDFL:KJSDFLK:", installableBlocks);
        },
      },
      {
        name: "something",
        onClick: () => {
          onBlockClick("ID9101112");
          console.log("ASDFL:KJSDFLK:", installableBlocks);
        },
      },
    ];
    return blockSelection;
  }, [installableBlocks, onBlockClick]);

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
          <PopoverMenuContent size="md" width="200px" items={blocks} />
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
