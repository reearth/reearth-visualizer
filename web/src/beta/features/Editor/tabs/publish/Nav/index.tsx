import { useCallback, useMemo, useState } from "react";

import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import TabButton from "@reearth/beta/components/TabButton";
import Text from "@reearth/beta/components/Text";
import SecondaryNav from "@reearth/beta/features/Editor/SecondaryNav";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

export { navbarHeight } from "@reearth/beta/features/Editor/SecondaryNav";

export type ProjectType = "default" | "story";

export type PublishStatus = "published" | "limited" | "unpublished";

type Props = {
  publishStatus?: PublishStatus;
  selectedProjectType?: ProjectType;
  onProjectTypeChange: (type: ProjectType) => void;
};

const Nav: React.FC<Props> = ({
  publishStatus = "unpublished",
  selectedProjectType,
  onProjectTypeChange,
}) => {
  const t = useT();

  const [dropdownOpen, setDropdown] = useState(false);

  const text = useMemo(
    () =>
      publishStatus === "published" || publishStatus === "limited"
        ? t("Published")
        : t("Unpublished"),
    [publishStatus, t],
  );

  const handleProjectUnpublish = useCallback(() => {
    console.log("unpublish");
    setDropdown(false);
  }, []);

  const handleProjectPublish = useCallback(() => {
    console.log("publish");
    setDropdown(false);
  }, []);

  const handleOpenProjectSettings = useCallback(() => {
    console.log("open settings");
    setDropdown(false);
  }, []);

  return (
    <StyledSecondaryNav>
      <LeftSection>
        <TabButton
          selected={selectedProjectType === "default"}
          label={t("Scene")}
          onClick={() => onProjectTypeChange("default")}
        />
        <TabButton
          selected={selectedProjectType === "story"}
          label={t("Story")}
          onClick={() => onProjectTypeChange("story")}
        />
      </LeftSection>
      <Popover.Provider open={dropdownOpen} placement="bottom-end">
        <Popover.Trigger asChild>
          <Publishing onClick={() => setDropdown(!dropdownOpen)}>
            <Status status={publishStatus} />
            <Text size="body" customColor>
              {text}
            </Text>
            <Icon icon="arrowDown" size={16} />
          </Publishing>
        </Popover.Trigger>
        <Popover.Content style={{ zIndex: 999 }}>
          <PopoverMenuContent
            size="sm"
            width="142px"
            items={[
              {
                name: t("Unpublish"),
                onClick: () => handleProjectUnpublish(),
              },
              {
                name: t("Publish"),
                onClick: () => handleProjectPublish(),
              },
              {
                name: t("Publishing Settings"),
                onClick: () => handleOpenProjectSettings(),
              },
            ]}
          />
        </Popover.Content>
      </Popover.Provider>
    </StyledSecondaryNav>
  );
};

export default Nav;

const StyledSecondaryNav = styled(SecondaryNav)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 8px;
  padding-left: 8px;
`;

const LeftSection = styled.div`
  display: flex;
  gap: 4px;
`;

const Publishing = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.content.weak};
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.4s;

  :hover {
    background: ${({ theme }) => theme.bg[2]};
    p {
      transition: all 0.4s;
      color: ${({ theme }) => theme.content.main};
    }
    * {
      opacity: 1;
    }
  }
`;

const Status = styled.div<{ status?: PublishStatus }>`
  opacity: 0.5;
  background: ${({ theme, status }) =>
    status === "published" || status === "limited" ? theme.select.strong : theme.bg[4]};
  width: 8px;
  height: 8px;
  border-radius: 50%;
`;
