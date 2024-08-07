import { FC } from "react";

import { Button, Modal, ModalPanel } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import CustomedProperties from "../CustomedProperties";
import { CustomPropertyProps } from "../type";

import useHooks from "./hooks";

export type SourceType = "url" | "local" | "value";

export type CustomPropertyModalProp = {
  onClose?: () => void;
};

const CustomPropertySchemaModal: FC<CustomPropertyModalProp & CustomPropertyProps> = ({
  propertiesList,
  customProperties,
  setCustomProperties,
  setPropertiesList,
  onClose,
}) => {
  const t = useT();

  const { handleClose, handleSubmit } = useHooks({
    customProperties,
    setPropertiesList,
    onClose,
  });

  return (
    <Modal size="medium" visible={true}>
      <ModalPanel
        title={t("Custom properties Schema Setting")}
        onCancel={handleClose}
        actions={
          <>
            <Button onClick={handleClose} size="normal" title="Cancel" />
            <Button size="normal" title="Apply" appearance="primary" onClick={handleSubmit} />
          </>
        }>
        <Wrapper>
          <CustomedProperties
            customProperties={customProperties}
            setCustomProperties={setCustomProperties}
            propertiesList={propertiesList}
            setPropertiesList={setPropertiesList}
          />
        </Wrapper>
      </ModalPanel>
    </Modal>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  height: "400px",
  background: theme.bg[0],
  padding: theme.spacing.normal,
}));

export default CustomPropertySchemaModal;
