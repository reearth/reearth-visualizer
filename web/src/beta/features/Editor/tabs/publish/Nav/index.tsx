import Icon from "@reearth/beta/components/Icon";
import TabButton from "@reearth/beta/components/TabButton";
import Text from "@reearth/beta/components/Text";
import SecondaryNav from "@reearth/beta/features/Editor/SecondaryNav";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

export { navbarHeight } from "@reearth/beta/features/Editor/SecondaryNav";

export type ProjectType = "default" | "story";

export type PublishStatus = "unpublished" | "published";

type Props = {
  publishStatus?: PublishStatus;
  selectedProjectType?: ProjectType;
  onProjectTypeChange: (type: ProjectType) => void;
};

const Nav: React.FC<Props> = ({
  publishStatus = "published",
  selectedProjectType,
  onProjectTypeChange,
}) => {
  const t = useT();
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
      <Publishing>
        <Status status={publishStatus} />
        <Text size="body" customColor>
          Published
        </Text>
        <Icon icon="arrowDown" size={16} />
      </Publishing>
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
    status === "published" ? theme.select.strong : theme.bg[4]};
  width: 8px;
  height: 8px;
  border-radius: 50%;
`;
