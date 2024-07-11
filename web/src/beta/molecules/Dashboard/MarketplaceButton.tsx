import DashboardBlock from "@reearth/classic/components/atoms/DashboardBlock";
import Flex from "@reearth/classic/components/atoms/Flex";
import Icon from "@reearth/classic/components/atoms/Icon";
import Text from "@reearth/classic/components/atoms/Text";
import { metrics, metricsSizes } from "@reearth/classic/theme";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

const MarketplaceButton: React.FC = () => {
  const t = useT();
  const marketplaceUrl = window.REEARTH_CONFIG?.marketplaceUrl;

  return (
    <StyledDashboardBlock grow={0}>
      <Wrapper
        justify="center"
        align="center"
        onClick={() => window.open(marketplaceUrl, "_blank", "noopener")}>
        <Content direction="column" justify="center" align="center">
          <Icon icon="marketplace" size="91px" />
          <StyledText size="l" customColor>
            {t("Plugin Marketplace")}
          </StyledText>
        </Content>
      </Wrapper>
    </StyledDashboardBlock>
  );
};

export default MarketplaceButton;

const StyledDashboardBlock = styled(DashboardBlock)`
  @media only screen and (max-width: 1024px) {
    grow: 1;
    order: 2;
  }
`;

const Wrapper = styled(Flex)`
  margin: 0px;
  border-radius: ${metricsSizes["s"]}px;
  cursor: pointer;
  position: relative;
  z-index: ${({ theme }) => theme.classic.zIndexes.base};
  overflow: hidden;

  max-width: 278px;
  min-width: 200px;
  height: ${metrics.dashboardContentHeight}px;
  padding: ${metricsSizes.xl}px;
  color: ${({ theme }) => theme.classic.main.text};
  transition: color 0.4s;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 100%;
    background: ${({ theme }) =>
      `linear-gradient(46.66deg, ${theme.classic.dashboard.itemBg} 22.94%, ${theme.classic.main.brandBlue} 72.25%)`};
    background-size: cover;
    background-position: top;
    transition: transform 0.4s;
    z-index: ${({ theme }) => theme.classic.zIndexes.hidden};
  }

  &:hover: :before {
    transform: translateX(-25%);
  }

  &:hover {
    color: ${({ theme }) => theme.classic.main.strongText};
  }

  @media only screen and (max-width: 1024px) {
    height: ${metrics.dashboardContentSmallHeight}px;
    width: auto;
    padding: ${metricsSizes.m}px;
  }
`;

const Content = styled(Flex)`
  height: 100%;
  width: 120px;
  text-align: center;
`;

const StyledText = styled(Text)`
  margin-top: 16px;
`;
