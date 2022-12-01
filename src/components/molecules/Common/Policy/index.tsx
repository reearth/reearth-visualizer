import { useMemo } from "react";

import Button from "@reearth/components/atoms/Button";
import Modal from "@reearth/components/atoms/Modal";
import Text from "@reearth/components/atoms/Text";
import { useLang, useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";

export type Props = {
  policy: {
    id: string;
    name: string;
  };
  modalOpen?: boolean;
  onModalOpen?: () => void;
  onModalClose?: () => void;
};

const Policy: React.FC<Props> = ({ policy, modalOpen, onModalOpen, onModalClose }) => {
  const t = useT();
  const currentLanguage = useLang();
  const policyModalConfig = window.REEARTH_CONFIG?.policy;

  const policyUrl = useMemo(
    () =>
      typeof policyModalConfig?.url === "string"
        ? policyModalConfig?.url
        : policyModalConfig?.url?.[currentLanguage],
    [currentLanguage, policyModalConfig],
  );
  const policyTitle = useMemo(
    () =>
      typeof policyModalConfig?.modalTitle === "string"
        ? policyModalConfig?.modalTitle
        : policyModalConfig?.modalTitle?.[currentLanguage],
    [currentLanguage, policyModalConfig],
  );
  const policyDescription = useMemo(
    () =>
      typeof policyModalConfig?.modalDescription === "string"
        ? policyModalConfig?.modalDescription
        : policyModalConfig?.modalDescription?.[currentLanguage],
    [currentLanguage, policyModalConfig],
  );

  return policy ? (
    <>
      <PolicyText
        size="m"
        weight="bold"
        clickable={!!policyModalConfig}
        onClick={policyModalConfig && onModalOpen}>
        {policy.name}
      </PolicyText>
      {policyModalConfig && (
        <Modal
          title={policyTitle}
          size="sm"
          isVisible={modalOpen}
          button1={
            <Button large onClick={onModalClose}>
              {t("OK")}
            </Button>
          }
          onClose={onModalClose}>
          <Text size="m">{policyDescription}</Text>
          <br />
          {policyUrl && (
            <Text size="m">
              <PolicyLink href={policyUrl} target="_blank">
                {t("Click here for more details.")}
              </PolicyLink>
            </Text>
          )}
        </Modal>
      )}
    </>
  ) : null;
};

export default Policy;

const PolicyText = styled(Text)<{ clickable?: boolean }>`
  background: #2b2a2f;
  padding: 4px 20px;
  border-radius: 12px;
  user-select: none;
  transition: background 0.2s;
  ${({ clickable }) =>
    clickable &&
    `
  cursor: pointer;
  
  :hover {
    background: #3f3d45;
  }
  `}
`;

const PolicyLink = styled.a`
  text-decoration: none;
  color: ${({ theme }) => theme.main.accent};

  :hover {
    color: ${({ theme }) => theme.main.select};
  }
`;
