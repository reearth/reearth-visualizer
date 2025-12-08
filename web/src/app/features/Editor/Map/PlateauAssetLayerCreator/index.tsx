import {
  Button,
  Icon,
  IconButton,
  Modal,
  ModalPanel,
  TabItem,
  Tabs,
  TextInput
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { LayerAddProps } from "../../hooks/useLayers";

import AreaTree from "./AreaTree";
import Dataset from "./Dataset";
import useHooks from "./hooks";
import Loading from "./Loading";
import TreeItem from "./TreeItem";
import TypeTree from "./TypeTree";

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
    dataset,
    selectedPlateauDatasetItem,
    handleSelectDatasetItem,
    handleLayerAdd,
    addLayerDisabled,
    searchInput,
    handleSearchChange,
    searchDatasets,
    searchText,
    searchLoading,
    handleSearch
  } = useHooks({
    onLayerAdd,
    sceneId
  });

  const tabItems: TabItem[] = [
    {
      id: "plateau-asset-area-tab",
      name: t("Area"),
      children: <AreaTree />
    },
    {
      id: "plateau-asset-type-tab",
      name: t("Dataset Type"),
      children: <TypeTree />
    }
  ];

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
            <SearchWrapper>
              <TextInput
                value={searchInput}
                placeholder={`${t("Search by name")}`}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                data-testid="plateau-asset-search-input"
                actions={[
                  <IconButton
                    icon="magnifyingGlass"
                    appearance="simple"
                    onClick={handleSearch}
                    data-testid="plateau-asset-search-btn"
                  />
                ]}
              />
            </SearchWrapper>
            {searchText && searchInput ? (
              <SearchResults>
                {searchLoading ? (
                  <LoadingWrapper>
                    <Loading />
                  </LoadingWrapper>
                ) : searchDatasets?.length ? (
                  searchDatasets.map((dataset) => (
                    <Dataset
                      id={`search-result-${dataset.id}`}
                      label={dataset.label}
                      key={dataset.id}
                      datasetId={dataset.id}
                      type={dataset.type}
                    />
                  ))
                ) : (
                  <NoResult>{t("No results found")}</NoResult>
                )}
              </SearchResults>
            ) : (
              <Tabs tabs={tabItems} noPadding flexHeight />
            )}
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
                    selected={selectedPlateauDatasetItem?.id === item.id}
                    onClick={() => handleSelectDatasetItem(item)}
                    testId={item.id}
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
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column"
}));

const SearchWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing.small,
  backgroundColor: theme.bg[0]
}));

const LoadingWrapper = styled("div")(() => ({
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}));

const NoResult = styled("div")(({ theme }) => ({
  padding: theme.spacing.small,
  textAlign: "center",
  color: theme.content.weak,
  fontSize: theme.fonts.sizes.body
}));

const SearchResults = styled("div")(({ theme }) => ({
  minHeight: 0,
  flex: 1,
  overflow: "auto",
  padding: theme.spacing.smallest,
  backgroundColor: theme.bg[0],
  fontSize: theme.fonts.sizes.body,
  ...theme.scrollBar
}));

const Main = styled("div")(({ theme }) => ({
  height: "100%",
  width: "100%",
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
