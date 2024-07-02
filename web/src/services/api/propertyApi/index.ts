import { useMutation } from "@apollo/client";
import { useCallback } from "react";

import { ValueType, ValueTypes, valueToGQL, valueTypeToGQL } from "@reearth/beta/utils/value";
import { PropertyItemPayload } from "@reearth/services/gql";
import {
  UPDATE_PROPERTY_VALUE,
  ADD_PROPERTY_ITEM,
  REMOVE_PROPERTY_ITEM,
  MOVE_PROPERTY_ITEM,
} from "@reearth/services/gql/queries/property";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";

import { MutationReturn } from "../types";

// export type Mode = "infobox" | "scene" | "layer" | "block" | "widgets" | "widget" | "cluster";

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [updatePropertyValue] = useMutation(UPDATE_PROPERTY_VALUE);
  const [addPropertyItem] = useMutation(ADD_PROPERTY_ITEM);
  const [removePropertyItem] = useMutation(REMOVE_PROPERTY_ITEM);
  const [movePropertyItem] = useMutation(MOVE_PROPERTY_ITEM);

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
      setNotification({ type: "success", text: t("Successfully updated the property value!") });
      return {
        data: data.updatePropertyValue.property,
        status: "success",
      };
    },
    [updatePropertyValue, setNotification, t],
  );

  const useAddPropertyItem = useCallback(
    async (
      propertyId: string,
      schemaGroupId: string,
    ): Promise<MutationReturn<Partial<PropertyItemPayload["property"]["id"]>>> => {
      const { data, errors } = await addPropertyItem({
        variables: {
          propertyId,
          schemaGroupId,
        },
        refetchQueries: ["GetScene"],
      });

      if (errors || !data?.addPropertyItem?.property?.id) {
        console.log("GraphQL: Failed to update property", errors);
        setNotification({ type: "error", text: t("Failed to update property.") });

        return { data: undefined, status: "error" };
      }

      return {
        data: data.addPropertyItem.property.id,
        status: "success",
      };
    },
    [addPropertyItem, setNotification, t],
  );

  const useRemovePropertyItem = useCallback(
    async (
      propertyId: string,
      schemaGroupId: string,
      itemId: string,
    ): Promise<MutationReturn<Partial<PropertyItemPayload["property"]["id"]>>> => {
      const { data, errors } = await removePropertyItem({
        variables: {
          propertyId,
          schemaGroupId,
          itemId,
        },
        refetchQueries: ["GetScene"],
      });

      if (errors || !data?.removePropertyItem?.property?.id) {
        console.log("GraphQL: Failed to update property", errors);
        setNotification({ type: "error", text: t("Failed to update property.") });

        return { data: undefined, status: "error" };
      }

      return {
        data: data.removePropertyItem.property.id,
        status: "success",
      };
    },
    [removePropertyItem, setNotification, t],
  );

  const useMovePropertyItem = useCallback(
    async (
      propertyId: string,
      schemaGroupId: string,
      itemId: string,
      index: number,
    ): Promise<MutationReturn<Partial<PropertyItemPayload["property"]["id"]>>> => {
      const { data, errors } = await movePropertyItem({
        variables: {
          propertyId,
          schemaGroupId,
          itemId,
          index,
        },
        refetchQueries: ["GetScene"],
      });

      if (errors || !data?.movePropertyItem?.property?.id) {
        console.log("GraphQL: Failed to update property", errors);
        setNotification({ type: "error", text: t("Failed to update property.") });

        return { data: undefined, status: "error" };
      }

      return {
        data: data.movePropertyItem.property.id,
        status: "success",
      };
    },
    [movePropertyItem, setNotification, t],
  );
  return {
    useUpdatePropertyValue,
    useAddPropertyItem,
    useRemovePropertyItem,
    useMovePropertyItem,
  };
};
