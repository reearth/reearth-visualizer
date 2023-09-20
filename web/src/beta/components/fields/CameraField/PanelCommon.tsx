import { ReactNode } from "react";

import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

type Props = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

const PanelCommon: React.FC<Props> = ({ title, children, onClose }) => {
  const theme = useTheme();
  return (
    <Wrapper>
      <HeaderWrapper>
        <PickerTitle size="footnote" weight="regular" color={theme.content.main}>
          {title}
        </PickerTitle>
        <CloseIcon icon="cancel" size={12} onClick={onClose} />
      </HeaderWrapper>
      <Content>{children}</Content>
    </Wrapper>
  );
};

export default PanelCommon;

const Wrapper = styled.div`
  width: 286px;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
  background: ${({ theme }) => theme.bg[1]};
  box-shadow: 4px 4px 4px 0px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 4px 8px;
  border-bottom: 1px solid ${({ theme }) => theme.outline.weak};
`;

const PickerTitle = styled(Text)`
  text-align: center;
  margin-right: auto;
`;

const CloseIcon = styled(Icon)`
  margin-left: auto;
  cursor: pointer;
`;

const Content = styled.div``;
