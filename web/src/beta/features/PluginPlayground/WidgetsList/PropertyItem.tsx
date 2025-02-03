import { FC, useMemo, useState } from "react";

import {
  ColorField,
  InputField,
  SelectField,
  TimePointField,
  TextareaField,
  AssetField
} from "../../../ui/fields";
import { GroupField } from "../types";

type Props = {
  field: GroupField;
};

const PropertyItem: FC<Props> = ({ field }) => {
  const [value, setValue] = useState<string | string[]>("");

  const assetTypes: "image"[] | "file"[] | undefined = useMemo(
    () =>
      field.type === "url"
        ? field.ui === "image"
          ? ["image" as const]
          : field.ui === "file"
            ? ["file" as const]
            : undefined
        : undefined,
    [field.type, field.ui]
  );

  return (
    <>
      {field.type === "string" ? (
        field.ui === "datetime" ? (
          <TimePointField
            key={field.id}
            title={field.name}
            value={value as string}
            onChange={(newValue?: string) => setValue(newValue || "")}
          />
        ) : field.ui === "selection" ? (
          <SelectField
            key={field.id}
            title={field.name}
            value={(value as string) ?? ""}
            options={
              field?.choices?.map(
                ({ key, label }: { key: string; label: string }) => ({
                  value: key,
                  label: label
                })
              ) || []
            }
            onChange={(newValue?: string | string[]) =>
              setValue(newValue || "")
            }
          />
        ) : field.ui === "color" ? (
          <ColorField
            key={field.id}
            title={field.name}
            value={(value as string) ?? ""}
            onChange={setValue}
          />
        ) : field.ui === "multiline" ? (
          <TextareaField
            key={field.id}
            title={field.name}
            resizable="height"
            value={(value as string) ?? ""}
            onChange={setValue}
          />
        ) : (
          <InputField
            key={field.id}
            title={field.name}
            value={value as string}
            onChange={setValue}
          />
        )
      ) : field.type === "url" ? (
        <AssetField
          key={field.id}
          title={field.name}
          assetsTypes={assetTypes}
          inputMethod={
            field.ui === "video" || field.ui === undefined ? "URL" : "asset"
          }
          value={(value as string) ?? ""}
          onChange={(newValue?: string) => setValue(newValue || "")}
        />
      ) : null}
    </>
  );
};

export default PropertyItem;
