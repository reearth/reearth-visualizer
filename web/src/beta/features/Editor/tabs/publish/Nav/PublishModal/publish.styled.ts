import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled, metricsSizes } from "@reearth/services/theme";

export const Section = styled.div<{ disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: ${`${metricsSizes["m"]}px`};
  opacity: ${({ disabled }) => disabled && "0.6"};
  cursor: ${({ disabled }) => disabled && "not-allowed"};
`;

export const Subtitle = styled(Text)`
  text-align: left;
`;

export const StyledIcon = styled(Icon)`
  margin-bottom: ${`${metricsSizes["xl"]}px`};
`;

export const PublishLink = styled.a`
  text-decoration: none;
`;

export const OptionsToggle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: ${`0 0 ${metricsSizes["m"]}px 0`};
  color: ${({ theme }) => theme.classic.main.text};
  cursor: pointer;
  user-select: none;
`;

export const ArrowIcon = styled(Icon)<{ open?: boolean }>`
  transition: transform 0.15s ease;
  transform: ${({ open }) =>
    open ? "translateY(10%) rotate(90deg)" : "translateY(0) rotate(180deg)"};
`;

export const UrlText = styled(Text)`
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: ${`${metricsSizes["2xl"]}px 0`};
`;

export const HideableSection = styled(Section)<{ showOptions?: boolean }>`
  display: ${props => (props.showOptions ? null : "none")};
`;
