import { Button, Icon, TextInput } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

import { PropertyListItem } from ".";

type Props = {
  item: PropertyListItem;
  handleClassName?: string;
  onKeyBlur: (newValue?: string) => void;
  onValueBlur: (newValue?: string) => void;
  onItemRemove: () => void;
};

const EditorItem: FC<Props> = ({
  item,
  handleClassName,
  onKeyBlur,
  onValueBlur,
  onItemRemove,
}) => {
  const [currentKeyValue, setCurrentKeyValue] = useState<string>(item.key);
  const [currentValue, setCurrentValue] = useState<string>(item.value);

  const handleKeyChange = useCallback((newValue: string) => {
    setCurrentKeyValue(newValue);
  }, []);

  const handleKeyBlur = useCallback(
    (newValue: string) => {
      onKeyBlur(newValue);
    },
    [onKeyBlur],
  );

  const handleValueChange = useCallback((newValue: string) => {
    setCurrentValue(newValue);
  }, []);

  const handleValueBlur = useCallback(
    (newValue: string) => {
      onValueBlur(newValue);
    },
    [onValueBlur],
  );

  return (
    <Field>
      <HandleIcon icon="dotsSixVertical" className={handleClassName} />
      <TextInput
        size="small"
        value={currentKeyValue}
        onChange={handleKeyChange}
        onBlur={handleKeyBlur}
      />
      <TextInput
        size="small"
        value={currentValue}
        onChange={handleValueChange}
        onBlur={handleValueBlur}
      />
      <Button
        icon="trash"
        iconButton
        appearance="simple"
        size="small"
        onClick={onItemRemove}
      />
    </Field>
  );
};

export default EditorItem;

const Field = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  alignSelf: "stretch",
  width: "100%",
  background: theme.bg[2],
  color: theme.content.main,
  gap: theme.spacing.micro,
  padding: theme.spacing.micro,
  borderRadius: theme.radius.smallest,
}));

const HandleIcon = styled(Icon)(({ theme }) => ({
  color: theme.content.weak,
  cursor: "move",
  "&:hover": {
    color: theme.content.main,
  },
}));
