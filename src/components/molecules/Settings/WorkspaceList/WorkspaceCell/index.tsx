import React from "react";
import { useIntl } from "react-intl";

// Components
import { styled, useTheme } from "@reearth/theme";
import { Team as TeamType } from "../WorkspaceList";
import Text from "@reearth/components/atoms/Text";

export type Team = TeamType;

export type Props = {
  className?: string;
  team: Team;
  personal: boolean;
  onSelect?: (t: Team) => void;
};

const WorkspaceCell: React.FC<Props> = ({ className, team, personal, onSelect }) => {
  const intl = useIntl();
  const teamMembers = team.members;
  const theme = useTheme();

  return (
    <Wrapper className={className} team={team} onClick={() => onSelect?.(team)}>
      <Text
        size="xl"
        color={theme.main.text}
        otherProperties={{ marginBottom: "30px", userSelect: "none" }}>
        {team.name ? team.name : intl.formatMessage({ defaultMessage: "No Title Project" })}
      </Text>
      {personal ? (
        <Text size="m" color={theme.main.strongText}>
          {intl.formatMessage({ defaultMessage: "This is your personal account" })}
        </Text>
      ) : (
        <>
          <Text size="m" color={theme.main.strongText}>
            {intl.formatMessage({ defaultMessage: "Team Members:" })}
          </Text>
          <StyledList>
            {teamMembers.map(member => (
              <StyledListItem key={member.userId}>{member?.user?.name}</StyledListItem>
            ))}
          </StyledList>
        </>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ team: Team }>`
  background: ${props => props.theme.colors.bg[2]};
  color: ${props => props.theme.colors.text.strong};
  padding: 10px;
  box-shadow: 0 0 5px ${props => props.theme.projectCell.shadow};
  margin: 10px 0;
  padding: 28px;
  width: 100%;
  height: 223px;
  cursor: pointer;
`;

const StyledList = styled.ul`
  padding: 0;
  margin: 10px 50px;
`;

const StyledListItem = styled.li`
  list-style-type: none;
  font-weight: 700;
`;

export default WorkspaceCell;
