import TabButton from "@reearth/beta/components/TabButton";
import SecondaryNav from "@reearth/beta/features/Editor/SecondaryNav";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

export { navbarHeight } from "@reearth/beta/features/Editor/SecondaryNav";

export type ProjectType = "default" | "story";

type Props = {
  selectedProjectType?: ProjectType;
  onProjectTypeChange: (type: ProjectType) => void;
};

const Nav: React.FC<Props> = ({ selectedProjectType, onProjectTypeChange }) => {
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
      <p>Publishing</p>
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
