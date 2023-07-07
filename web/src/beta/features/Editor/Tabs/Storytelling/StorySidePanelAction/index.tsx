import { FC } from "react";

import { styled } from "@reearth/services/theme";

import Icon from "../../../../../components/Icon";
import Text from "../../../../../components/Text";

type Props = {
  icon: string;
  title: string;
  onClick: () => void;
};

const StorySidePanelAction: FC<Props> = ({ icon, title, onClick }) => {
  return (
    <SWrapper onClick={onClick} type="button">
      <SIcon>
        <Icon icon={icon} size={8} />
      </SIcon>
      <Text size={"footnote"} otherProperties={{ wordBreak: "break-all" }}>
        {title}
      </Text>
    </SWrapper>
  );
};

const SWrapper = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 8px 12px;
  gap: 8px;
  border-radius: 6px;

  min-height: 28px;
  transition: all 0.15s;

  border: 1px solid #383838;

  :hover {
    background: ${props => props.theme.general.bg.weak};
  }
  user-select: none;
  cursor: pointer;
`;

const SIcon = styled.div`
  color: #4a4a4a;
`;

export default StorySidePanelAction;
