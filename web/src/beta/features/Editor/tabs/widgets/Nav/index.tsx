import Icon from "@reearth/beta/components/Icon";
import { styled } from "@reearth/services/theme";

import { Layout } from "../../../types";
import VisualizerNav from "../../../VisualizerNav";

type Props = {
  showWidgetEditor?: boolean;
  layout?: Layout;
  onShowWidgetEditor: () => void;
  onLayoutChange: (layout: Layout) => void;
};

const Nav: React.FC<Props> = ({
  showWidgetEditor,
  layout = "desktop",
  onShowWidgetEditor,
  onLayoutChange,
}) => {
  return (
    <VisualizerNav>
      <WidgetSystemIcon
        toggled={showWidgetEditor}
        icon="widgetSystem"
        onClick={onShowWidgetEditor}
      />
      <DeviceWrapper>
        <DeviceIcon
          icon="desktop"
          toggled={layout === "desktop"}
          onClick={() => onLayoutChange("desktop")}
        />
        <Separator />
        <DeviceIcon
          icon="mobile"
          toggled={layout === "mobile"}
          onClick={() => onLayoutChange("mobile")}
        />
      </DeviceWrapper>
    </VisualizerNav>
  );
};

export default Nav;

const StyledIcon = styled(Icon)<{ toggled?: boolean }>`
  padding: 12px;
  border-radius: 4px;
  ${({ theme, toggled }) =>
    toggled
      ? `
  color: ${theme.general.content.strong};
  background: ${theme.general.select}80;
  `
      : `color: ${theme.general.content.weak};`}

  :hover {
    color: ${({ theme }) => theme.general.content.strong};
    background: ${({ theme }) => theme.general.select}80;
    cursor: pointer;
  }
`;

const WidgetSystemIcon = styled(StyledIcon)`
  border: 1px solid ${({ theme }) => theme.general.border};
`;

const DeviceIcon = styled(StyledIcon)`
  padding: 12px;
`;

const Separator = styled.div`
  border-right: 1px solid ${({ theme }) => theme.general.border};
  height: 100%;
`;

const DeviceWrapper = styled.div`
  display: flex;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.general.border};
`;
