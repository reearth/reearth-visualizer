import { Role } from "@reearth/services/gql";
import { describe, it, expect } from "vitest";

import { PermissionService } from "./PermissionService";

describe("PermissionService", () => {
  describe("canViewAllUsers", () => {
    it("returns true for any actor role", () => {
      const roles = [Role.Owner, Role.Maintainer, Role.Reader, Role.Writer];
      roles.forEach((role) => {
        expect(PermissionService.canViewAllUsers(role)).toBe(true);
      });
    });
  });

  describe("canInvite", () => {
    it("returns true for Owner and false for other roles", () => {
      expect(PermissionService.canInvite(Role.Owner)).toBe(true);
      expect(PermissionService.canInvite(Role.Maintainer)).toBe(false);
      expect(PermissionService.canInvite(Role.Reader)).toBe(false);
      expect(PermissionService.canInvite(Role.Writer)).toBe(false);
    });
  });

  describe("canRemove", () => {
    it("returns true for Owner removing any member", () => {
      expect(PermissionService.canRemove(Role.Owner, Role.Reader, false)).toBe(
        true
      );
      expect(PermissionService.canRemove(Role.Owner, Role.Writer, false)).toBe(
        true
      );
      expect(
        PermissionService.canRemove(Role.Owner, Role.Maintainer, false)
      ).toBe(true);
      expect(PermissionService.canRemove(Role.Owner, Role.Owner, false)).toBe(
        true
      );
    });

    it("returns false for Maintainer removing any member", () => {
      expect(
        PermissionService.canRemove(Role.Maintainer, Role.Reader, false)
      ).toBe(false);
      expect(
        PermissionService.canRemove(Role.Maintainer, Role.Writer, false)
      ).toBe(false);
      expect(
        PermissionService.canRemove(Role.Maintainer, Role.Maintainer, false)
      ).toBe(false);
    });

    it("returns false when islast is true", () => {
      expect(PermissionService.canRemove(Role.Owner, Role.Reader, true)).toBe(
        false
      );
      expect(
        PermissionService.canRemove(Role.Maintainer, Role.Reader, true)
      ).toBe(false);
    });
  });

  describe("canModify", () => {
    it("returns true for Owner modifying any member", () => {
      expect(PermissionService.canModify(Role.Owner, Role.Reader, false)).toBe(
        true
      );
      expect(PermissionService.canModify(Role.Owner, Role.Writer, false)).toBe(
        true
      );
      expect(
        PermissionService.canModify(Role.Owner, Role.Maintainer, false)
      ).toBe(true);
      expect(PermissionService.canModify(Role.Owner, Role.Owner, false)).toBe(
        true
      );
    });

    it("returns false for Maintainer modifying any member", () => {
      expect(
        PermissionService.canModify(Role.Maintainer, Role.Reader, false)
      ).toBe(false);
      expect(
        PermissionService.canModify(Role.Maintainer, Role.Writer, false)
      ).toBe(false);
      expect(
        PermissionService.canModify(Role.Maintainer, Role.Maintainer, false)
      ).toBe(false);
    });

    it("returns false when islast is true", () => {
      expect(PermissionService.canModify(Role.Owner, Role.Reader, true)).toBe(
        false
      );
      expect(
        PermissionService.canModify(Role.Maintainer, Role.Reader, true)
      ).toBe(false);
    });
  });

  describe("Payment & Billing Methods", () => {
    it("canManagePaymentSettings returns true only for Owner", () => {
      expect(PermissionService.canManagePaymentSettings(Role.Owner)).toBe(true);
      expect(PermissionService.canManagePaymentSettings(Role.Maintainer)).toBe(
        false
      );
      expect(PermissionService.canManagePaymentSettings(Role.Reader)).toBe(
        false
      );
      expect(PermissionService.canManagePaymentSettings(Role.Writer)).toBe(
        false
      );
    });

    it("canViewBillingInfo returns true only for Owner", () => {
      expect(PermissionService.canViewBillingInfo(Role.Owner)).toBe(true);
      expect(PermissionService.canViewBillingInfo(Role.Reader)).toBe(false);
      expect(PermissionService.canViewBillingInfo(Role.Maintainer)).toBe(false);
    });
  });

  describe("Workspace Settings", () => {
    it("canViewWorkspaceSettings returns true for any role", () => {
      const roles = [Role.Owner, Role.Maintainer, Role.Reader, Role.Writer];
      roles.forEach((role) => {
        expect(PermissionService.canViewWorkspaceSettings(role)).toBe(true);
      });
    });

    it("canEditWorkspaceSettings returns true only for Owner", () => {
      expect(PermissionService.canEditWorkspaceSettings(Role.Owner)).toBe(true);
      expect(PermissionService.canEditWorkspaceSettings(Role.Maintainer)).toBe(
        false
      );
      expect(PermissionService.canEditWorkspaceSettings(Role.Reader)).toBe(
        false
      );
      expect(PermissionService.canEditWorkspaceSettings(Role.Writer)).toBe(
        false
      );
    });
  });

  describe("getRoleOptions", () => {
    const t = (key: string) => `translated(${key})`;
    it("returns all roles if actor is Owner", () => {
      const options = PermissionService.getRoleOptions(t, Role.Owner);
      expect(options).toHaveLength(4);
      expect(options).toEqual([
        { value: Role.Reader, label: "translated(READER)" },
        { value: Role.Writer, label: "translated(WRITER)" },
        { value: Role.Maintainer, label: "translated(MAINTAINER) (WIP)" },
        { value: Role.Owner, label: "translated(OWNER)" }
      ]);
    });

    it("returns READER, WRITER, and MAINTAINER if actor is Maintainer", () => {
      const options = PermissionService.getRoleOptions(t, Role.Maintainer);
      expect(options).toHaveLength(3);
      expect(options).toEqual([
        { value: Role.Reader, label: "translated(READER)" },
        { value: Role.Writer, label: "translated(WRITER)" },
        { value: Role.Maintainer, label: "translated(MAINTAINER) (WIP)" }
      ]);
    });

    it("returns empty array for other roles", () => {
      expect(PermissionService.getRoleOptions(t, Role.Reader)).toEqual([]);
      expect(PermissionService.getRoleOptions(t, Role.Writer)).toEqual([]);
    });
  });

  describe("getRoleLabel", () => {
    const t = (key: string) => `translated(${key})`;
    it("returns lower-case label with (WIP) for Maintainer", () => {
      expect(PermissionService.getRoleLabel(t, Role.Maintainer)).toBe(
        "translated(maintainer)(WIP)"
      );
    });

    it("returns lower-case label for other roles", () => {
      expect(PermissionService.getRoleLabel(t, Role.Owner)).toBe(
        "translated(owner)"
      );
      expect(PermissionService.getRoleLabel(t, Role.Reader)).toBe(
        "translated(reader)"
      );
      expect(PermissionService.getRoleLabel(t, Role.Writer)).toBe(
        "translated(writer)"
      );
    });
  });
});
