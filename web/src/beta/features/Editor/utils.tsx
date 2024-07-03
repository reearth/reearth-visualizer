import SelectField from "@reearth/beta/components/fields/SelectField";
import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import generateRandomString from "@reearth/beta/utils/generate-random-string";
import { styled } from "@reearth/services/theme";

export const InputGroup: React.FC<{
  label: string;
  description?: string;
  children: React.ReactNode;
}> = ({ label, description, children }) => {
  return (
    <InputGroupWrapper>
      <Label>{label}</Label>
      {children}
      {description && <Description>{description}</Description>}
    </InputGroupWrapper>
  );
};

const InputGroupWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  width: "100%",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: theme.spacing.smallest,
}));

export const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: theme.spacing.large,
}));

export const Label = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
}));

const Description = styled("div")(({ theme }) => ({
  color: theme.content.weak,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
}));
export const InputsWrapper = styled("div")(() => ({
  width: "100%",
}));

export const SubmitWrapper = styled("div")(() => ({
  width: "100%",
  display: "flex",
  justifyContent: "flex-end",
}));

export const AddLayerWrapper = styled("div")(() => ({
  marginTop: "5px",
}));

export const LayerWrapper = styled("div")(() => ({
  display: "flex",
  width: "100%",
}));

export const LayerNameListWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  width: "100%",
}));

export const Input = styled.input`
  flex: auto;
  background: transparent;
  border: 1px solid #777;
  border-radius: 4px;
  outline: none;
  padding: 5px 10px;
  color: ${props => props.theme.content.main};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: auto;
  ::placeholder {
    color: ${({ theme }) => theme.content.weaker};
  }
`;

export const AssetWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ColJustifyBetween = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
`;

export const SourceTypeWrapper = styled.div`
  display: flex;
  gap: 24px;
`;

export const RadioButtonLabel = styled.label`
  display: flex;
  align-items: center;

  span {
    font-size: 0.75rem;
  }
`;

export const TextArea = styled.textarea`
  flex: auto;
  background: transparent;
  border: 1px solid #777;
  border-radius: 4px;
  outline: none;
  resize: none;
  padding: 5px 10px;
  color: ${props => props.theme.content.main};
`;

export const DeleteLayerIcon = styled(Icon)<{ disabled?: boolean }>`
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  background: transparent;
  border: 1px solid #777;
  padding: 7px 6px;
  border-radius: 4px;
  outline: none;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)}; // Reduce opacity for disabled state
`;

export const LayerStyleIcon = styled(Icon)`
  cursor: pointer;
  background: transparent;
  border: 1px solid #777;
  padding: 7px 6px;
  border-radius: 4px;
  outline: none;
`;

export const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
`;

export const AddButtonWrapper = styled.div`
  width: 100%;
  margin-top: 8px;
`;
export const SelectWrapper = styled(SelectField)`
  display: block;
  margin-top: 4px;
  width: 100%;
`;

export const PropertyListHeader = styled.div`
  display: flex;
  justify-content: center;
`;

export const StyledText = styled(Text)`
  padding: 8px 2px;
  cursor: pointer;
  width: 100%;
`;

export const TitledText = styled(Text)`
  padding: 8px 0px;
  width: 44%;
`;

export const DeleteButton = styled(Icon)`
  cursor: pointer;
  outline: none;
  margin-right: 6px;
`;

export const PropertyFieldContanier = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  background: ${({ theme }) => theme.bg[2]};
  color: ${({ theme }) => theme.content.main};
  border-radius: 4px;
  box-sizing: border-box;
  gap: 8px;
`;

export const PropertyField = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  width: 50%;
  gap: 4px;
`;

export const HandleIcon = styled(Icon)`
  color: ${({ theme }) => theme.content.weak};
  cursor: move;
  padding-left: 4px;
  &:hover {
    color: ${({ theme }) => theme.content.main};
  }
`;

export const generateTitle = (url: string, layerName?: string): string => {
  if (layerName && layerName.trim() !== "") return layerName;
  if (url.trim() !== "") {
    try {
      const urlObject = new URL(url);
      const pathParts = urlObject.pathname.split("/");
      const lastPart = pathParts.pop() || "";
      const fileName = lastPart.split(".")[0];
      return fileName;
    } catch (error) {
      console.error("Invalid URL", error);
    }
  }
  return generateRandomString(5);
};

export const handleCoordinate = (geomery: any) => {
  switch (geomery.type) {
    case "Polygon":
      return geomery.polygonCoordinates;
    case "MultiPolygon":
      return geomery.multiPolygonCoordinates;
    case "LineString":
      return geomery.lineStringCoordinates;
    case "Point":
      return geomery.pointCoordinates;
    case "GeometryCollection":
      return geomery.geometries;
    default:
      return geomery;
  }
};
