import React, { useState, useCallback } from "react";

import { useAuth } from "@reearth/auth";
import Button from "@reearth/components/atoms/Button";
import Icon from "@reearth/components/atoms/Icon";
import Modal from "@reearth/components/atoms/Modal";
import { useT } from "@reearth/i18n";
import { styled, fonts } from "@reearth/theme";

export type Item = {};

export type Props = {
  className?: string;
  id: string;
  name: string;
  removeDatasetSchema?: (schemaId: string) => void;
};

const DatasetItem: React.FC<Props> = ({ className, id, name, removeDatasetSchema }) => {
  const t = useT();
  const { getAccessToken } = useAuth();
  const [isHover, setHover] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDownloading, setDownloading] = useState(false);

  const handleRemoveDatasetSchema = useCallback(
    () => removeDatasetSchema?.(id),
    [id, removeDatasetSchema],
  );

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    if (!id || !window.REEARTH_CONFIG?.api) {
      setDownloading(false);
      return;
    }
    const accessToken = await getAccessToken();
    if (!accessToken) {
      setDownloading(false);
      return;
    }
    const res = await fetch(`${window.REEARTH_CONFIG.api}/dataset/${id}`, {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
    const download = document.createElement("a");
    download.download = name;
    download.href = URL.createObjectURL(await res.blob());
    download.dataset.downloadurl = [
      "data:text/csv;charset=utf-8,",
      download.download,
      download.href,
    ].join(":");
    download.click();
    setDownloading(false);
  }, [getAccessToken, id, name]);

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
            {!isDownloading && <DownloadIcon icon="download" size={20} onClick={handleDownload} />}

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
  color: ${props => props.theme.main.text};
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
  font-size: ${fonts.sizes.m}px;
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
  color: ${props => props.theme.main.text};
  padding: 10px;
  bottom: 0;
  right: 0;
`;

const SpinIcon = styled(Icon)`
  display: inline-block;
  padding: 10px;
  color: ${props => props.theme.main.text};
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
