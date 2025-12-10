import { styled } from "@reearth/services/theme";
import { Search, X } from "lucide-react";
import { FC } from "react";
import { createPortal } from "react-dom";

import { useMapSearch } from "./hooks";

// Hard-coded configuration
const API_TOKEN = "";

const MapGoogleSearch: FC = () => {
  const {
    query,
    suggestions,
    selectedPlace,
    containerRef,
    dropdownPosition,
    handleInputChange,
    handleKeyDown,
    handleSelectPlace,
    handleClear,
    inputPlaceholder
  } = useMapSearch({ apiKey: API_TOKEN });

  // Render dropdown in portal
  const renderDropdown = () => {
    if (!dropdownPosition || suggestions.length === 0) return null;

    const content = (
      <SuggestionsList
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width
        }}
      >
        {suggestions.map((suggestion) => (
          <SuggestionItem
            key={suggestion.place_id}
            onClick={() => handleSelectPlace(suggestion)}
          >
            {`${suggestion.formatted_address}, ${suggestion.name}`}
          </SuggestionItem>
        ))}
      </SuggestionsList>
    );

    return createPortal(content, document.body);
  };

  return (
    <Container ref={containerRef}>
      <SearchBox>
        <InputWrapper>
          <StyledInput
            placeholder={inputPlaceholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <SearchIconWrapper
            clickable={!!selectedPlace}
            onClick={selectedPlace ? handleClear : undefined}
          >
            {selectedPlace ? <X size={14} /> : <Search size={14} />}
          </SearchIconWrapper>
        </InputWrapper>
      </SearchBox>

      {renderDropdown()}
    </Container>
  );
};

export default MapGoogleSearch;

const Container = styled("div")(() => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  flex: "0 1 419px", // flex-grow: 0, flex-shrink: 1, flex-basis: 419px
  maxWidth: "419px",
  minWidth: "200px"
}));

const SearchBox = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  minHeight: "28px",
  background: theme.bg[1],
  borderRadius: theme.radius.small,
  border: `1px solid ${theme.outline.weak}`,
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`
}));

const InputWrapper = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  height: "18px"
}));

const StyledInput = styled("input")(({ theme }) => ({
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  "&::placeholder": {
    color: theme.content.weak
  },
  "&:disabled": {
    cursor: "not-allowed",
    opacity: 0.5
  }
}));

const SearchIconWrapper = styled("div")<{ clickable?: boolean }>(
  ({ theme, clickable }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.content.weak,
    flexShrink: 0,
    cursor: clickable ? "pointer" : "default",
    transition: "color 0.2s",
    "&:hover": clickable
      ? {
          color: theme.content.main
        }
      : {}
  })
);

const SuggestionsList = styled("ul")(({ theme }) => ({
  position: "fixed",
  listStyle: "none",
  margin: 0,
  padding: 0,
  maxHeight: "240px",
  overflowY: "auto",
  borderRadius: theme.radius.small,
  background: theme.bg[2],
  border: `1px solid ${theme.outline.weak}`,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  zIndex: 10000
}));

const SuggestionItem = styled("li")(({ theme }) => ({
  padding: `${theme.spacing.small}px`,
  cursor: "pointer",
  fontSize: theme.fonts.sizes.body,
  color: theme.content.main,
  transition: "background 0.2s",
  "&:hover": {
    background: theme.bg[3]
  }
}));
