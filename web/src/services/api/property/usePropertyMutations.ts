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
import { useLang, useT } from "@reearth/services/i18n/hooks";
import { useNotification } from "@reearth/services/state";
import { useCallback } from "react";

import { MutationReturn } from "../types";

export type PropertyMutationOptions = {
  /**
   * Skip the `GetScene` refetch this mutation would otherwise trigger. Set it
   * when the caller chains several property writes together and a single
   * refetch at the end of the chain brings the cache up to date for all of
   * them, instead of one full `GetScene` round trip per write.
   */
  skipRefetch?: boolean;
  /**
   * Suppress the success notification. For writes the user did not initiate
   * directly (internal plumbing such as the system tile) a toast is noise.
   * Errors are still reported.
   */
  silentSuccess?: boolean;
};

const refetchQueriesFor = (options?: PropertyMutationOptions) =>
  options?.skipRefetch ? [] : ["GetScene"];

export const usePropertyMutations = () => {
  const t = useT();
  const currentLang = useLang();
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
      vt: ValueType,
      options?: PropertyMutationOptions
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
          lang
        },
        refetchQueries: refetchQueriesFor(options)
      });

      if (error || !data?.updatePropertyValue) {
        console.log("GraphQL: Failed to update property", error);
        setNotification({
          type: "error",
          text: t("Failed to update property.")
        });

        return { status: "error" };
      }
      if (!options?.silentSuccess) {
        setNotification({
          type: "success",
          text: t("Successfully updated the property value!")
        });
      }
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
      schemaGroupId: string,
      options?: PropertyMutationOptions
    ): Promise<
      MutationReturn<{ propertyId: string; newItemId: string | undefined }>
    > => {
      const { data, error } = await addPropertyItemMutation({
        variables: {
          propertyId,
          schemaGroupId,
          lang: currentLang
        },
        refetchQueries: refetchQueriesFor(options)
      });

      if (error || !data?.addPropertyItem?.property?.id) {
        console.log("GraphQL: Failed to update property", error);
        setNotification({
          type: "error",
          text: t("Failed to update property.")
        });

        return { data: undefined, status: "error" };
      }

      const property = data.addPropertyItem.property;
      const propertyItem = data.addPropertyItem.propertyItem;
      const newItemId =
        propertyItem?.__typename === "PropertyGroup" ? propertyItem.id : undefined;

      return {
        data: { propertyId: property.id, newItemId },
        status: "success"
      };
    },
    [addPropertyItemMutation, setNotification, t, currentLang]
  );

  const removePropertyItem = useCallback(
    async (
      propertyId: string,
      schemaGroupId: string,
      itemId: string,
      options?: PropertyMutationOptions
    ): Promise<
      MutationReturn<Partial<PropertyItemPayload["property"]["id"]>>
    > => {
      const { data, error } = await removePropertyItemMutation({
        variables: {
          propertyId,
          schemaGroupId,
          itemId,
          lang: currentLang
        },
        refetchQueries: refetchQueriesFor(options)
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
    [removePropertyItemMutation, setNotification, t, currentLang]
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
          index,
          lang: currentLang
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
    [movePropertyItemMutation, setNotification, t, currentLang]
  );

  return {
    updatePropertyValue,
    addPropertyItem,
    removePropertyItem,
    movePropertyItem
  };
};
