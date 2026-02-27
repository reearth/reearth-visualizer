import { useMutation } from "@apollo/client/react";
import {
  ValueType,
  ValueTypes,
  valueToGQL,
  valueTypeToGQL
} from "@reearth/app/utils/value";
import { PropertyItemPayload } from "@reearth/services/gql";
import {
  UPDATE_PROPERTY_VALUE,
  ADD_PROPERTY_ITEM,
  REMOVE_PROPERTY_ITEM,
  MOVE_PROPERTY_ITEM
} from "@reearth/services/gql/queries/property";
import { useT } from "@reearth/services/i18n/hooks";
import { useNotification } from "@reearth/services/state";
import { useCallback } from "react";

import { MutationReturn } from "../types";

export const usePropertyMutations = () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [updatePropertyValueMutation] = useMutation(UPDATE_PROPERTY_VALUE);
  const [addPropertyItemMutation] = useMutation(ADD_PROPERTY_ITEM);
  const [removePropertyItemMutation] = useMutation(REMOVE_PROPERTY_ITEM);
  const [movePropertyItemMutation] = useMutation(MOVE_PROPERTY_ITEM);

  const updatePropertyValue = useCallback(
    async (
      propertyId: string,
      schemaGroupId: string,
      itemId: string | undefined,
      fieldId: string,
      lang: string,
      v: ValueTypes[ValueType] | undefined,
      vt: ValueType
    ) => {
      const gvt = valueTypeToGQL(vt);
      if (!gvt) return;
      const value = valueToGQL(v, vt);
      const { data, error } = await updatePropertyValueMutation({
        variables: {
          propertyId,
          itemId,
          schemaGroupId,
          fieldId,
          value,
          type: gvt,
          lang: lang
        },
        refetchQueries: ["GetScene"]
      });

      if (error || !data?.updatePropertyValue) {
        console.log("GraphQL: Failed to update property", error);
        setNotification({
          type: "error",
          text: t("Failed to update property.")
        });

        return { status: "error" };
      }
      setNotification({
        type: "success",
        text: t("Successfully updated the property value!")
      });
      return {
        data: data.updatePropertyValue.property,
        status: "success"
      };
    },
    [updatePropertyValueMutation, setNotification, t]
  );

  const addPropertyItem = useCallback(
    async (
      propertyId: string,
      schemaGroupId: string
    ): Promise<
      MutationReturn<Partial<PropertyItemPayload["property"]["id"]>>
    > => {
      const { data, error } = await addPropertyItemMutation({
        variables: {
          propertyId,
          schemaGroupId
        },
        refetchQueries: ["GetScene"]
      });

      if (error || !data?.addPropertyItem?.property?.id) {
        console.log("GraphQL: Failed to update property", error);
        setNotification({
          type: "error",
          text: t("Failed to update property.")
        });

        return { data: undefined, status: "error" };
      }

      return {
        data: data.addPropertyItem.property.id,
        status: "success"
      };
    },
    [addPropertyItemMutation, setNotification, t]
  );

  const removePropertyItem = useCallback(
    async (
      propertyId: string,
      schemaGroupId: string,
      itemId: string
    ): Promise<
      MutationReturn<Partial<PropertyItemPayload["property"]["id"]>>
    > => {
      const { data, error } = await removePropertyItemMutation({
        variables: {
          propertyId,
          schemaGroupId,
          itemId
        },
        refetchQueries: ["GetScene"]
      });

      if (error || !data?.removePropertyItem?.property?.id) {
        console.log("GraphQL: Failed to update property", error);
        setNotification({
          type: "error",
          text: t("Failed to update property.")
        });

        return { data: undefined, status: "error" };
      }

      return {
        data: data.removePropertyItem.property.id,
        status: "success"
      };
    },
    [removePropertyItemMutation, setNotification, t]
  );

  const movePropertyItem = useCallback(
    async (
      propertyId: string,
      schemaGroupId: string,
      itemId: string,
      index: number
    ): Promise<
      MutationReturn<Partial<PropertyItemPayload["property"]["id"]>>
    > => {
      const { data, error } = await movePropertyItemMutation({
        variables: {
          propertyId,
          schemaGroupId,
          itemId,
          index
        },
        refetchQueries: ["GetScene"]
      });

      if (error || !data?.movePropertyItem?.property?.id) {
        console.log("GraphQL: Failed to update property", error);
        setNotification({
          type: "error",
          text: t("Failed to update property.")
        });

        return { data: undefined, status: "error" };
      }

      return {
        data: data.movePropertyItem.property.id,
        status: "success"
      };
    },
    [movePropertyItemMutation, setNotification, t]
  );

  return {
    updatePropertyValue,
    addPropertyItem,
    removePropertyItem,
    movePropertyItem
  };
};
