import { ButtonWrapper } from "@reearth/beta/features/ProjectSettings/innerPages/common";
import { Collapse, Button } from "@reearth/beta/lib/reearth-ui";
import { SelectField } from "@reearth/beta/ui/fields";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

const Members = () => {
  const t = useT();
  return (
    <Collapse title={t("Members")} size="large">
      <SettingsFields>
        <SelectField
          title={""}
          value={""}
          options={[{ value: "", label: "" }]}
          onChange={() => {}}
        />
        <ButtonWrapper>
          <Button
            title={t("New member")}
            appearance="primary"
            onClick={() => {}}
          />
        </ButtonWrapper>
      </SettingsFields>
    </Collapse>
  );
};

const SettingsFields = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.largest
}));

export default Members;
