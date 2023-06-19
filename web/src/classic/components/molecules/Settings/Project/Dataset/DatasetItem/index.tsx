import React, { useState, useCallback } from "react";

import Button from "@reearth/classic/components/atoms/Button";
import Icon from "@reearth/classic/components/atoms/Icon";
import Modal from "@reearth/classic/components/atoms/Modal";
import { useT } from "@reearth/services/i18n";
import { styled, fonts } from "@reearth/services/theme";

export type Item = {};

export type Props = {
  className?: string;
  id: string;
  name: string;
  removeDatasetSchema?: (schemaId: string) => void;
  onDownloadFile?: (id: string, name: string, onLoad: () => void) => void;
};

const DatasetItem: React.FC<Props> = ({
  className,
  id,
  name,
  removeDatasetSchema,
  onDownloadFile,
}) => {
  const t = useT();
  const [isHover, setHover] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDownloading, setDownloading] = useState(false);

  const handleRemoveDatasetSchema = useCallback(
    () => removeDatasetSchema?.(id),
    [id, removeDatasetSchema],
  );
  const handleDownloadFile = useCallback(() => {
    setDownloading(true);
    onDownloadFile?.(id, name, () => {
      setDownloading(false);
    });
  }, [id, name, onDownloadFile]);

  const onClose = useCallback(() => {
    setIsVisible(false);
    setHover(false);
  }, []);

  return (
    <>
      <Wrapper
        className={className}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}>
        {isHover && (
          <Actions>
            <TrashIcon icon="bin" size={20} onClick={() => setIsVisible(true)} />
            {!isDownloading && (
              <DownloadIcon icon="download" size={20} onClick={handleDownloadFile} />
            )}

            {isDownloading && <SpinIcon icon="spinner" size={20} />}
          </Actions>
        )}
        <Preview>
          <StyledIcon icon="dataset" size={24} />
        </Preview>
        <Meta>
          <Name>{name}</Name>
        </Meta>
      </Wrapper>
      <Modal
        title={t("Delete this dataset")}
        isVisible={isVisible}
        size="sm"
        onClose={onClose}
        button1={
          <Button
            large
            buttonType="danger"
            text={t("Delete")}
            onClick={handleRemoveDatasetSchema}
          />
        }
        button2={<Button large buttonType="secondary" text={t("Cancel")} onClick={onClose} />}>
        {t("Are you sure you want to delete it?")}
      </Modal>
    </>
  );
};

const Wrapper = styled.div`
  width: 250px;
  height: 250px;
  background: #232226;
  position: relative;
`;

const StyledIcon = styled(Icon)`
  width: 25px;
  height: 25px;
  color: ${props => props.theme.classic.main.text};
`;

const Preview = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90%;
`;

const Actions = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: rgba(34, 34, 34, 0.9);
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 10px;
  box-sizing: border-box;
`;

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: -20px;
  margin-left: 22px;
`;

const Name = styled.div`
  font-size: ${fonts.sizes["body"]}px;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const TrashIcon = styled(Icon)`
  color: #ff3c53;
  cursor: pointer;
  padding: 20px;
  position: absolute;
  top: 0;
  right: 0;
`;

const DownloadIcon = styled(Icon)`
  cursor: pointer;
  color: ${props => props.theme.classic.main.text};
  padding: 10px;
  bottom: 0;
  right: 0;
`;

const SpinIcon = styled(Icon)`
  display: inline-block;
  padding: 10px;
  color: ${props => props.theme.classic.main.text};
  bottom: 0;
  right: 0;
  animation: spin 1s linear infinite;
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export default DatasetItem;
