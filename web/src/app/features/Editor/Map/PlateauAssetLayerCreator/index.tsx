import { Button, Icon, Modal, ModalPanel } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { LayerAddProps } from "../../hooks/useLayers";

import useHooks from "./hooks";
import Prefecture from "./Prefecture";
import TreeItem from "./TreeItem";

type PlateauAssetLayerCreatorProps = {
  sceneId: string;
  onClose: () => void;
  onLayerAdd: (layerAddInp: LayerAddProps) => void;
};

const MODAL_HEIGHT = 450;
const SIDEBAR_WIDTH = 297;

const PlateauAssetLayerCreator: FC<PlateauAssetLayerCreatorProps> = ({
  sceneId,
  onClose,
  onLayerAdd
}) => {
  const t = useT();

  const {
    prefectures,
    dataset,
    selectedDatasetItem,
    handleSelectDatasetItem,
    handleLayerAdd,
    addLayerDisabled
  } = useHooks({
    onLayerAdd,
    sceneId
  });

  return (
    <Modal size="large" visible={true} data-testid="plateau-asset-layer-modal">
      <ModalPanel
        title={t("PLATEAU Data Catalog")}
        onCancel={onClose}
        data-testid="plateau-asset-layer-modal-panel"
        actions={
          <>
            <Button
              onClick={onClose}
              size="normal"
              title={t("Cancel")}
              data-testid="plateau-asset-layer-creator-cancel-btn"
            />
            <Button
              size="normal"
              title={t("Add to Layer")}
              appearance="primary"
              onClick={handleLayerAdd}
              disabled={addLayerDisabled}
              data-testid="plateau-asset-layer-creator-add-layer-btn"
            />
          </>
        }
      >
        <Wrapper data-testid="plateau-asset-layer-wrapper">
          <Sidebar>
            <AreaWrapper>
              {prefectures.map((prefecture) => (
                <Prefecture
                  key={prefecture.id}
                  id={prefecture.id}
                  label={prefecture.label}
                />
              ))}
            </AreaWrapper>
          </Sidebar>
          <Main>
            <Title>{dataset?.name}</Title>
            {dataset?.items?.length > 0 && (
              <ItemSelector>
                {dataset.items.map((item) => (
                  <TreeItem
                    key={item.id}
                    id={item.id}
                    label={item.name}
                    selected={selectedDatasetItem?.id === item.id}
                    onClick={() => handleSelectDatasetItem(item)}
                  />
                ))}
              </ItemSelector>
            )}
            <Description>
              <Linkify content={dataset?.description} />
            </Description>
          </Main>
        </Wrapper>
      </ModalPanel>
    </Modal>
  );
};

export default PlateauAssetLayerCreator;

const Wrapper = styled("div")(() => ({
  height: `${MODAL_HEIGHT}px`,
  display: "flex"
}));

const Sidebar = styled("div")(({ theme }) => ({
  width: `${SIDEBAR_WIDTH}px`,
  flexShrink: 0,
  height: "100%",
  borderRight: `1px solid ${theme.outline.weaker}`,
  boxSizing: "border-box"
}));

const AreaWrapper = styled("div")(({ theme }) => ({
  height: "100%",
  overflow: "auto",
  padding: theme.spacing.smallest,
  ...theme.scrollBar
}));

const Main = styled("div")(({ theme }) => ({
  height: "100%",
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing.largest,
  gap: theme.spacing.normal,
  boxSizing: "border-box",
  ...theme.scrollBar
}));

const Title = styled("div")(({ theme }) => ({
  fontSize: theme.fonts.sizes.h3
}));

const ItemSelector = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest,
  backgroundColor: theme.bg[0],
  borderRadius: theme.radius.small,
  padding: theme.spacing.smallest
}));

const Description = styled("div")(({ theme }) => ({
  fontSize: theme.fonts.sizes.body,
  whiteSpace: "pre-line"
}));

const Linkify: FC<{ content: string | null | undefined }> = ({ content }) => {
  return (
    <>
      {content
        ?.split(
          /(https?:\/\/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9(@:%_+.~#?&//=]*)/
        )
        .map((e, i) =>
          (i + 1) % 2 === 0 ? (
            <Link key={i} onClick={() => window.open(e, "_blank")}>
              {e}
              <StyledIcon icon="arrowSquareOut" size={12} />
            </Link>
          ) : (
            <span key={i}>{e}</span>
          )
        )}
    </>
  );
};

const Link = styled("span")(({ theme }) => ({
  color: theme.primary.main,
  cursor: "pointer",
  textDecoration: "underline"
}));

const StyledIcon = styled(Icon)(() => ({
  display: "inline-block"
}));
