import { useMutation } from "@apollo/client";
import { useCallback } from "react";

import { ValueType, ValueTypes, valueToGQL, valueTypeToGQL } from "@reearth/beta/utils/value";
import { UPDATE_PROPERTY_VALUE } from "@reearth/services/gql/queries/property";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";

// export type Mode = "infobox" | "scene" | "layer" | "block" | "widgets" | "widget" | "cluster";

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [updatePropertyValue] = useMutation(UPDATE_PROPERTY_VALUE);

  const useUpdatePropertyValue = useCallback(
    async (
      propertyId: string,
      schemaGroupId: string,
      itemId: string | undefined,
      fieldId: string,
      lang: string,
      v: ValueTypes[ValueType] | undefined,
      vt: ValueType,
    ) => {
      const gvt = valueTypeToGQL(vt);
      if (!gvt) return;
      const value = valueToGQL(v, vt);
      const { data, errors } = await updatePropertyValue({
        variables: {
          propertyId,
          itemId,
          schemaGroupId,
          fieldId,
          value,
          type: gvt,
          lang: lang,
        },
        refetchQueries: ["GetScene"],
      });

      if (errors || !data?.updatePropertyValue) {
        console.log("GraphQL: Failed to update property", errors);
        setNotification({ type: "error", text: t("Failed to update property.") });

        return { status: "error" };
      }

      return {
        data: data.updatePropertyValue.property,
        status: "success",
      };
    },
    [updatePropertyValue, setNotification, t],
  );

  return {
    useUpdatePropertyValue,
  };
};
