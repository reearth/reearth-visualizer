import Icon, { Icons } from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

export type Props = {
  className?: string;
  icon: Icons;
  buttonText: string;
  loading?: boolean;
  url: string;
};

const MarketplacePublish: React.FC<Props> = ({ className, icon, buttonText, url }) => {
  return (
    <StyledButton className={className} onClick={() => window.open(url, "_blank", "noopener")}>
      <StyledIcon icon={icon} size={91} />
      <Text size="h4">{buttonText}</Text>
    </StyledButton>
  );
};

const StyledButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  min-width: 375px;
  flex: 0 0 auto;
  box-sizing: border-box;
  width: 100%;
  color: ${({ theme }) => theme.content.main};
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: ${({ theme }) => theme.metrics.l}px;
  padding: ${({ theme }) => theme.metrics.m}px;
  cursor: pointer;
  transition: color 0.3s;
  z-index: 1;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 150%;
    height: 100%;
    background: linear-gradient(10.66deg, ${({ theme }) => theme.bg[1]} 30%, #1e2086 70%);
    transition: transform 0.3s;
    z-index: -1;
  }

  &:hover {
    :before {
      transform: translateX(-15%);
    }
  }
`;

const StyledIcon = styled(Icon)`
  margin-right: ${({ theme }) => theme.metrics.l}px;
`;

export default MarketplacePublish;
