import NumberField from "@reearth/beta/components/fields/NumberField";
import TextAreaField from "@reearth/beta/components/fields/TextAreaField";
import TextField from "@reearth/beta/components/fields/TextField";
import ToggleField from "@reearth/beta/components/fields/ToggleField";
import URLField from "@reearth/beta/components/fields/URLField";
import { useT } from "@reearth/services/i18n";

export const FieldComponent = ({ field }: { field: any }) => {
  const t = useT();

  return field?.type === "Text" ? (
    <TextField key={field?.id} name={field?.title} value={field?.value} onChange={() => {}} />
  ) : field?.type === "TextArea" ? (
    <TextAreaField
      name={field?.title}
      value={field?.value}
      description={field?.description}
      onChange={() => {}}
    />
  ) : field?.type === "Asset" ? (
    <URLField
      name={field?.title}
      entityType="image"
      fileType={"asset"}
      value={field?.value}
      description={field?.description}
      onChange={() => {}}
    />
  ) : field?.type === "URL" ? (
    <URLField
      name={field?.title}
      entityType="file"
      fileType={"URL"}
      value={field?.value}
      description={field?.description}
      onChange={() => {}}
    />
  ) : field?.type === "Float" || field.type === "Int" ? (
    <NumberField
      name={field?.title}
      value={field?.value}
      description={field?.description}
      min={field?.min}
      max={field?.max}
      onChange={() => {}}
    />
  ) : field?.type === "Boolean" ? (
    <ToggleField key={field?.id} name={field?.title} checked={!!field?.value} onChange={() => {}} />
  ) : (
    <div>{t("Unsupported field type")}</div>
  );
};
