import { FC, useState, Fragment } from "react";

import { Selector, SelectorProps, Icon } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme, fonts } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

export type SelectorFieldProps = CommonFieldProps & SelectorProps;

const SelectorField: FC<SelectorFieldProps> = ({ commonTitle, description, ...props }) => {
  const theme = useTheme();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleChange = (value: string | string[]) => {
    const newValue = Array.isArray(value) ? value : [value];
    const uniqueItems = Array.from(new Set([...selectedItems, ...newValue]));
    setSelectedItems(uniqueItems);
  };

  const handleRemoveItem = (item: string) => {
    setSelectedItems(selectedItems.filter(i => i !== item));
  };

  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <FieldContainer>
        <Selector multiple={true} {...props} value={selectedItems} onChange={handleChange} />
        {selectedItems.length > 0 && (
          <SelectedItems>
            {selectedItems.map((item, index) => (
              <Fragment key={index}>
                <SelectedItem>
                  {item}
                  <IconWrapper onClick={() => handleRemoveItem(item)}>
                    <Icon icon="close" color={theme.content.weak} />
                  </IconWrapper>
                </SelectedItem>
              </Fragment>
            ))}
          </SelectedItems>
        )}
      </FieldContainer>
    </CommonField>
  );
};

const FieldContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: `${theme.spacing.smallest}px`,
}));

const SelectedItems = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: `${theme.spacing.micro}px`,
}));

const SelectedItem = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  fontSize: fonts.sizes.body,
  alignItems: "center",
  height: "20px",
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  background: theme.bg[2],
  borderRadius: theme.radius.smallest,
}));

const IconWrapper = styled("div")`
  display: flex;
  align-items: center;
`;

export default SelectorField;
