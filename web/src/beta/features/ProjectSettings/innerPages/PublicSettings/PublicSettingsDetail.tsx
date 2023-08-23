import Button from "@reearth/beta/components/Button";
import Collapse from "@reearth/beta/components/Collapse";
import TextInput from "@reearth/beta/components/properties/TextInput";
import { useT } from "@reearth/services/i18n";

import { SettingsFields, ButtonWrapper } from "../common";

type Props = {
  settingsItem: {
    id: string;
    publicTitle?: string;
    publicDescription?: string;
    publicImage?: string;
    isBasicAuthActive?: boolean;
    basicAuthUsername?: string;
    basicAuthPassword?: string;
    alias?: string;
    publishmentStatus?: string;
  };
};

const PublicSettingsDetail: React.FC<Props> = ({ settingsItem }) => {
  const t = useT();

  return (
    <Collapse title={t("Public Info")} type="settings">
      <SettingsFields>
        <TextInput
          name={t("Title")}
          value={settingsItem.publicTitle}
          onChange={() => {}}
          timeout={0}
        />
        <div>Description - TextArea Field</div>
        <div>Thumbnail - Image Upload Field</div>
        <ButtonWrapper>
          <Button
            text={t("Submit")}
            size="medium"
            margin="0"
            buttonType="primary"
            onClick={() => {}}
          />
        </ButtonWrapper>
      </SettingsFields>
    </Collapse>
  );
};

export default PublicSettingsDetail;
