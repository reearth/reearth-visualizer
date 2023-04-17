import React, { useState, useCallback } from "react";

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

  const [isHover, setHover] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const handleRemoveDatasetSchema = useCallback(
    () => removeDatasetSchema?.(id),
    [id, removeDatasetSchema],
  );

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
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(34, 34, 34, 0.9);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
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
  padding: 10px;
`;

export default DatasetItem;
