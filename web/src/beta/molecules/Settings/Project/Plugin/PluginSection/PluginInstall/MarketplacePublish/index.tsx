import Flex from "@reearth/classic/components/atoms/Flex";
import Icon, { Icons } from "@reearth/classic/components/atoms/Icon";
import Text from "@reearth/classic/components/atoms/Text";
import { metricsSizes } from "@reearth/classic/theme";
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
    <StyledFlex
      className={className}
      onClick={() => window.open(url, "_blank", "noopener")}
      justify="center"
      align="center">
      <StyledIcon icon={icon} size={91} />
      <Text size="l" customColor>
        {buttonText}
      </Text>
    </StyledFlex>
  );
};

const StyledFlex = styled(Flex)`
  position: relative;
  z-index: ${({ theme }) => theme.classic.zIndexes.base};
  overflow: hidden;
  flex: 0 0 auto;
  box-sizing: border-box;
  width: 100%;
  color: ${({ theme }) => theme.classic.main.text};
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: ${({ theme }) => theme.classic.metrics.l}px;
  padding: ${metricsSizes["m"]}px;
  cursor: pointer;
  transition: color 0.3s;
  &:hover {
    color: ${({ theme }) => theme.classic.main.strongText};
  }

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 150%;
    height: 100%;
    background: linear-gradient(10.66deg, #232226 30%, #1e2086 70%);
    transition: transform 0.3s;
    z-index: ${({ theme }) => theme.classic.zIndexes.hidden};
  }

  &:hover: :before {
    transform: translateX(-15%);
  }
`;

const StyledIcon = styled(Icon)`
  margin-right: ${metricsSizes["l"]}px;
`;

export default MarketplacePublish;
