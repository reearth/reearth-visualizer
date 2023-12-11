import React, { useCallback } from "react";

import Button from "@reearth/beta/components/Button";
import CatalogCard from "@reearth/beta/components/CatalogCard";
import TextInput from "@reearth/beta/components/fields/common/TextInput";
import Loading from "@reearth/beta/components/Loading";
import Modal from "@reearth/beta/components/Modal";
import Text from "@reearth/beta/components/Text";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";

import useHooks from "./hooks";

export type Props = {
  sceneId?: string;
  open?: boolean;
  onSelect?: (value: string) => void;
  onClose: () => void;
};

const ChooseLayerStyleModal: React.FC<Props> = ({ open, sceneId, onClose, onSelect }) => {
  const t = useT();
  const [, setNotification] = useNotification();

  const {
    layerStyles,
    localSearchTerm,
    searchTerm,
    layerStylesWrapperRef,
    selectedLayerStyles,
    isLayerStylesLoading,
    handleSelectLayerStyle,
    handleSearch,
    handleSearchInputChange,
    onScrollToBottom,
  } = useHooks({ sceneId });

  const handleSelectButtonClick = useCallback(() => {
    if (selectedLayerStyles && selectedLayerStyles.length > 0) {
      onSelect?.(selectedLayerStyles[0].id);
      onClose?.();
    } else {
      setNotification({
        type: "warning",
        text: t("Please select an layer style before clicking Select."),
      });
    }
  }, [selectedLayerStyles, onSelect, onClose, setNotification, t]);

  return (
    <StyledModal
      title={t("Select Layer Style")}
      isVisible={open}
      onClose={onClose}
      button1={
        <Button
          size="medium"
          buttonType="primary"
          text={t("Select")}
          onClick={handleSelectButtonClick}
        />
      }
      button2={
        <Button
          size="medium"
          buttonType="secondary"
          text={t("Cancel")}
          onClick={() => onClose?.()}
        />
      }>
      <ControlWarpper>
        <SearchWarpper>
          <TextInput value={localSearchTerm} onChange={handleSearchInputChange} />
          <SearchButton icon="search" margin="0" onClick={handleSearch} />
        </SearchWarpper>
      </ControlWarpper>
      <LayerStyleWrapper>
        {!isLayerStylesLoading && (!layerStyles || layerStyles.length < 1) ? (
          <Template>
            <TemplateText size="body">
              {searchTerm
                ? t("No layerStyle match your search.")
                : t(
                    "You haven't added any layerStyle yet. Click the add button in the bottom panel to get started.",
                  )}
            </TemplateText>
          </Template>
        ) : (
          <LayerStyleListWrapper
            ref={layerStylesWrapperRef}
            onScroll={e => !isLayerStylesLoading && onScrollToBottom?.(e)}>
            <LayerStyleList>
              {layerStyles?.map(a => (
                <CatalogCard
                  key={a.id}
                  name={a.name}
                  icon={"layerStyle"}
                  onSelect={() => handleSelectLayerStyle?.(a as LayerStyle)}
                  selected={selectedLayerStyles.some(ua => ua.id === a.id)}
                />
              ))}
            </LayerStyleList>
            {isLayerStylesLoading && <Loading />}
          </LayerStyleListWrapper>
        )}
      </LayerStyleWrapper>
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  width: 730px;
`;
const LayerStyleWrapper = styled.div`
  max-height: calc(100vh - 240px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ControlWarpper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
`;

const SearchWarpper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SearchButton = styled(Button)`
  width: 12px;
  height: 28px;
`;

const LayerStyleListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
`;

const LayerStyleList = styled.div`
  margin-right: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fill, 114px);
  grid-template-rows: repeat(auto-fill, 119px);
  gap: ${({ theme }) => theme.spacing.small}px;
  justify-content: space-between;
  min-height: 373px;
`;

const Template = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 373px;
`;

const TemplateText = styled(Text)`
  text-align: center;
  width: 390px;
`;
export default ChooseLayerStyleModal;
