import React from "react";
import { useIntl } from "react-intl";

// Components
import { styled, useTheme } from "@reearth/theme";
import { Team as TeamType } from "../WorkspaceList";
import Text from "@reearth/components/atoms/Text";
import { metricsSizes } from "@reearth/theme/metrics";
import Flex from "@reearth/components/atoms/Flex";

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
    <Wrapper
      className={className}
      direction="column"
      justify="space-between"
      onClick={() => onSelect?.(team)}>
      <Text size="xl" color={theme.main.text} otherProperties={{ userSelect: "none" }}>
        {team.name ? team.name : intl.formatMessage({ defaultMessage: "No Title Workspace" })}
      </Text>
      {personal ? (
        <Text size="m" color={theme.colors.text.weak}>
          {intl.formatMessage({
            defaultMessage:
              "This is your personal workspace, your projects and resource will be managed in this workspace.",
          })}
        </Text>
      ) : (
        <Flex>
          <Text
            size="m"
            color={theme.main.text}
            otherProperties={{ margin: `${metricsSizes["s"]}px 0` }}>
            {intl.formatMessage({ defaultMessage: "Members:" })}
          </Text>
          <Flex wrap="wrap">
            {teamMembers.map(member => (
              <StyledItem key={member.userId}>
                <Text size="m" color={theme.main.text}>
                  {member?.user?.name}
                </Text>
              </StyledItem>
            ))}
          </Flex>
        </Flex>
      )}
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  background: ${props => props.theme.colors.bg[3]};
  box-sizing: border-box;
  box-shadow: 0 0 5px ${props => props.theme.projectCell.shadow};
  padding: ${metricsSizes["l"]}px ${metricsSizes["2xl"]}px;
  height: 240px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.bg[4]};
  }
`;

const StyledItem = styled.div`
  margin: ${metricsSizes["s"]}px;
`;

export default WorkspaceCell;
