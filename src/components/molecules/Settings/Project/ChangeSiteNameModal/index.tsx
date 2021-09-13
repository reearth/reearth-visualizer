import React from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Divider from "@reearth/components/atoms/Divider";
import Modal from "@reearth/components/atoms/Modal";
import Text from "@reearth/components/atoms/Text";
import TextBox from "@reearth/components/atoms/TextBox";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

export type Props = {
  show?: boolean;
  onClose?: () => void;
  url?: string[];
  alias?: string;
  onAliasChange?: (value?: string | undefined) => void;
  handlePublish?: () => Promise<void>;
  disabled?: boolean;
};

const ChangeSiteNameModal: React.FC<Props> = ({
  show,
  onClose,
  url,
  alias,
  onAliasChange,
  handlePublish,
  disabled,
}) => {
  const intl = useIntl();
  return (
    <Modal
      title={intl.formatMessage({ defaultMessage: "Change site name" })}
      isVisible={show}
      onClose={onClose}
      size="sm"
      button1={
        <Button
          large
          text={intl.formatMessage({ defaultMessage: "Save" })}
          buttonType="primary"
          onClick={handlePublish}
          disabled={disabled}
        />
      }
      button2={
        <Button
          large
          text={intl.formatMessage({ defaultMessage: "Cancel" })}
          buttonType="secondary"
          onClick={onClose}
        />
      }>
      <Divider margin="5px" />
      <Content>
        <Text size="m">
          {intl.formatMessage({
            defaultMessage:
              "You are about to change the site name for your project. Only alphanumeric characters and hyphens are allows.",
          })}
        </Text>
        <TextBox prefix={url?.[0]} suffix={url?.[1]} value={alias ?? ""} onChange={onAliasChange} />
      </Content>
    </Modal>
  );
};

const Content = styled.div`
  * {
    margin: ${metricsSizes["m"]}px 0;
  }
`;

export default ChangeSiteNameModal;
