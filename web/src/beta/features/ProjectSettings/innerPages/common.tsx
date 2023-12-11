import Collapse from "@reearth/beta/components/Collapse";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { MenuList } from "../MenuList";

export const InnerPage = styled.div<{ wide?: boolean; transparent?: boolean }>`
  display: flex;
  width: 100%;
  max-width: ${({ wide }) => (wide ? "950px" : "750px")};
  background-color: ${({ transparent, theme }) => (transparent ? "none" : theme.bg[1])};
`;

export const SettingsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;

  > div:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.outline.weaker};
  }
`;

export const InnerMenu = styled(MenuList)`
  flex-shrink: 0;
  border-right: 1px solid ${({ theme }) => theme.outline.weak};
`;

export const SettingsFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const ArchivedSettingNotice: React.FC = () => {
  const t = useT();
  return (
    <Collapse title={t("Notice")} alwaysOpen>
      <Text size="body">
        {t(
          "Most project settings are hidden when the project is archived. Please unarchive the project to view and edit these settings.",
        )}
      </Text>
    </Collapse>
  );
};
