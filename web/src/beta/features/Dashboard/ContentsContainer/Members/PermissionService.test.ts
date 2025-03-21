import { Role } from "@reearth/services/gql";
import { describe, it, expect } from "vitest";

import { PermissionService } from "./PermissionService";

describe("PermissionService", () => {
  describe("canViewAllUsers", () => {
    it("returns true for any role", () => {
      const roles = [
        Role.Owner,
        Role.Maintainer,
        Role.Reader,
        Role.Writer,
        undefined
      ];
      roles.forEach((me) => {
        const service = new PermissionService(me, Role.Reader);
        expect(service.canViewAllUsers()).toBe(true);
      });
    });
  });

  describe("canInviteNewMembers", () => {
    it("returns true for MAINTAINER and OWNER", () => {
      const serviceMaintainer = new PermissionService(
        Role.Maintainer,
        Role.Reader
      );
      const serviceOwner = new PermissionService(Role.Owner, Role.Writer);
      expect(serviceMaintainer.canInviteNewMembers()).toBe(true);
      expect(serviceOwner.canInviteNewMembers()).toBe(true);
    });

    it("returns false for READER and WRITER or undefined", () => {
      const serviceReader = new PermissionService(Role.Reader, Role.Reader);
      const serviceWriter = new PermissionService(Role.Writer, Role.Reader);
      const serviceUndefined = new PermissionService(undefined, Role.Reader);
      expect(serviceReader.canInviteNewMembers()).toBe(false);
      expect(serviceWriter.canInviteNewMembers()).toBe(false);
      expect(serviceUndefined.canInviteNewMembers()).toBe(false);
    });
  });

  describe("Remove Methods", () => {
    describe("canRemoveMember", () => {
      it("returns true when me is MAINTAINER or OWNER and member is READER/WRITER", () => {
        const s1 = new PermissionService(Role.Maintainer, Role.Reader);
        const s2 = new PermissionService(Role.Maintainer, Role.Writer);
        const s3 = new PermissionService(Role.Owner, Role.Reader);
        const s4 = new PermissionService(Role.Owner, Role.Writer);

        expect(s1.canRemoveMember()).toBe(true);
        expect(s2.canRemoveMember()).toBe(true);
        expect(s3.canRemoveMember()).toBe(true);
        expect(s4.canRemoveMember()).toBe(true);
      });

      it("returns false otherwise", () => {
        const s1 = new PermissionService(Role.Reader, Role.Reader);
        const s2 = new PermissionService(Role.Writer, Role.Writer);
        const s3 = new PermissionService(Role.Maintainer, Role.Maintainer);
        const s4 = new PermissionService(Role.Owner, Role.Owner);
        const s5 = new PermissionService(undefined, Role.Reader);

        expect(s1.canRemoveMember()).toBe(false);
        expect(s2.canRemoveMember()).toBe(false);
        expect(s3.canRemoveMember()).toBe(false);
        expect(s4.canRemoveMember()).toBe(false);
        expect(s5.canRemoveMember()).toBe(false);
      });
    });

    describe("canRemoveMaintainer", () => {
      it("returns true when me is MAINTAINER or OWNER and member is MAINTAINER", () => {
        const s1 = new PermissionService(Role.Maintainer, Role.Maintainer);
        const s2 = new PermissionService(Role.Owner, Role.Maintainer);
        expect(s1.canRemoveMaintainer()).toBe(true);
        expect(s2.canRemoveMaintainer()).toBe(true);
      });

      it("returns false otherwise", () => {
        const s1 = new PermissionService(Role.Maintainer, Role.Writer);
        const s2 = new PermissionService(Role.Owner, Role.Owner);
        const s3 = new PermissionService(Role.Reader, Role.Maintainer);
        expect(s1.canRemoveMaintainer()).toBe(false);
        expect(s2.canRemoveMaintainer()).toBe(false);
        expect(s3.canRemoveMaintainer()).toBe(false);
      });
    });

    describe("canRemoveOwner", () => {
      it("returns true when me is OWNER and member is OWNER", () => {
        const s = new PermissionService(Role.Owner, Role.Owner);
        expect(s.canRemoveOwner()).toBe(true);
      });

      it("returns false otherwise", () => {
        const s1 = new PermissionService(Role.Maintainer, Role.Owner);
        const s2 = new PermissionService(Role.Reader, Role.Owner);
        const s3 = new PermissionService(Role.Owner, Role.Maintainer);
        expect(s1.canRemoveOwner()).toBe(false);
        expect(s2.canRemoveOwner()).toBe(false);
        expect(s3.canRemoveOwner()).toBe(false);
      });
    });

    describe("canRemoveByRole", () => {
      it("calls canRemoveMember if member is READER/WRITER", () => {
        const s = new PermissionService(Role.Maintainer, Role.Reader);
        expect(s.canRemoveByRole()).toBe(true); // same as canRemoveMember
      });

      it("calls canRemoveMaintainer if member is MAINTAINER", () => {
        const s = new PermissionService(Role.Maintainer, Role.Maintainer);
        expect(s.canRemoveByRole()).toBe(true);
      });

      it("calls canRemoveOwner if member is OWNER", () => {
        const s = new PermissionService(Role.Owner, Role.Owner);
        expect(s.canRemoveByRole()).toBe(true);
      });

      it("returns false if role is undefined or no matching condition", () => {
        const s = new PermissionService(Role.Maintainer, undefined);
        expect(s.canRemoveByRole()).toBe(false);
      });
    });
  });

  describe("Modify Methods", () => {
    describe("canModifyMaintainerToMember", () => {
      it("returns true when me is MAINTAINER/OWNER and member is MAINTAINER", () => {
        const s1 = new PermissionService(Role.Maintainer, Role.Maintainer);
        const s2 = new PermissionService(Role.Owner, Role.Maintainer);
        expect(s1.canModifyMaintainerToMember()).toBe(true);
        expect(s2.canModifyMaintainerToMember()).toBe(true);
      });

      it("returns false otherwise", () => {
        const s1 = new PermissionService(Role.Maintainer, Role.Owner);
        const s2 = new PermissionService(Role.Reader, Role.Maintainer);
        expect(s1.canModifyMaintainerToMember()).toBe(false);
        expect(s2.canModifyMaintainerToMember()).toBe(false);
      });
    });

    describe("canModifyMaintainerToOwner", () => {
      it("returns true if me is OWNER and member is MAINTAINER", () => {
        const s = new PermissionService(Role.Owner, Role.Maintainer);
        expect(s.canModifyMaintainerToOwner()).toBe(true);
      });

      it("returns false otherwise", () => {
        const s1 = new PermissionService(Role.Maintainer, Role.Maintainer);
        const s2 = new PermissionService(Role.Owner, Role.Owner);
        expect(s1.canModifyMaintainerToOwner()).toBe(false);
        expect(s2.canModifyMaintainerToOwner()).toBe(false);
      });
    });

    describe("canModifyOwnerToOther", () => {
      it("returns true if me is OWNER and member is OWNER", () => {
        const s = new PermissionService(Role.Owner, Role.Owner);
        expect(s.canModifyOwnerToOther()).toBe(true);
      });

      it("returns false otherwise", () => {
        const s1 = new PermissionService(Role.Maintainer, Role.Owner);
        const s2 = new PermissionService(Role.Owner, Role.Maintainer);
        expect(s1.canModifyOwnerToOther()).toBe(false);
        expect(s2.canModifyOwnerToOther()).toBe(false);
      });
    });

    describe("canModifyMemberToMaintainer", () => {
      it("returns true if me is MAINTAINER/OWNER and member is READER/WRITER", () => {
        const s1 = new PermissionService(Role.Maintainer, Role.Reader);
        const s2 = new PermissionService(Role.Owner, Role.Writer);
        expect(s1.canModifyMemberToMaintainer()).toBe(true);
        expect(s2.canModifyMemberToMaintainer()).toBe(true);
      });

      it("returns false otherwise", () => {
        const s1 = new PermissionService(Role.Reader, Role.Reader);
        const s2 = new PermissionService(Role.Maintainer, Role.Maintainer);
        expect(s1.canModifyMemberToMaintainer()).toBe(false);
        expect(s2.canModifyMemberToMaintainer()).toBe(false);
      });
    });

    describe("canModifyMemberToOwner", () => {
      it("returns true if me is OWNER and member is READER/WRITER", () => {
        const s = new PermissionService(Role.Owner, Role.Reader);
        expect(s.canModifyMemberToOwner()).toBe(true);
      });

      it("returns false otherwise", () => {
        const s1 = new PermissionService(Role.Maintainer, Role.Reader);
        const s2 = new PermissionService(Role.Owner, Role.Maintainer);
        expect(s1.canModifyMemberToOwner()).toBe(false);
        expect(s2.canModifyMemberToOwner()).toBe(false);
      });
    });

    describe("canModifyByRole", () => {
      it("MAINTAINER can modify MAINTAINER, MEMBER => true", () => {
        const s1 = new PermissionService(Role.Maintainer, Role.Maintainer);
        const s2 = new PermissionService(Role.Maintainer, Role.Reader);
        expect(s1.canModifyByRole()).toBe(true);
        expect(s2.canModifyByRole()).toBe(true);
      });

      it("OWNER can modify any role => true", () => {
        const s1 = new PermissionService(Role.Owner, Role.Owner);
        const s2 = new PermissionService(Role.Owner, Role.Reader);
        const s3 = new PermissionService(Role.Owner, Role.Maintainer);
        expect(s1.canModifyByRole()).toBe(true);
        expect(s2.canModifyByRole()).toBe(true);
        expect(s3.canModifyByRole()).toBe(true);
      });

      it("READER/WRITER generally cannot modify => false", () => {
        const s1 = new PermissionService(Role.Reader, Role.Writer);
        const s2 = new PermissionService(Role.Writer, Role.Maintainer);
        expect(s1.canModifyByRole()).toBe(false);
        expect(s2.canModifyByRole()).toBe(false);
      });
    });

    describe("canModifyToTargetRole", () => {
      it("Maintainer -> Member(Reader) => canModifyMaintainerToMember => true", () => {
        const s = new PermissionService(Role.Maintainer, Role.Maintainer);
        expect(s.canModifyToTargetRole(Role.Reader)).toBe(true);
      });

      it("Maintainer -> Owner => canModifyMaintainerToOwner => true if me=Owner", () => {
        const s1 = new PermissionService(Role.Owner, Role.Maintainer);
        expect(s1.canModifyToTargetRole(Role.Owner)).toBe(true);

        const s2 = new PermissionService(Role.Maintainer, Role.Maintainer);
        expect(s2.canModifyToTargetRole(Role.Owner)).toBe(false);
      });

      it("Member(Reader) -> Maintainer => canModifyMemberToMaintainer => true if me=Owner/Maintainer", () => {
        const s1 = new PermissionService(Role.Owner, Role.Reader);
        expect(s1.canModifyToTargetRole(Role.Maintainer)).toBe(true);

        const s2 = new PermissionService(Role.Maintainer, Role.Reader);
        expect(s2.canModifyToTargetRole(Role.Maintainer)).toBe(true);

        const s3 = new PermissionService(Role.Reader, Role.Reader);
        expect(s3.canModifyToTargetRole(Role.Maintainer)).toBe(false);
      });

      it("Member(Reader) -> Owner => canModifyMemberToOwner => true if me=Owner", () => {
        const s1 = new PermissionService(Role.Owner, Role.Writer);
        expect(s1.canModifyToTargetRole(Role.Owner)).toBe(true);

        const s2 = new PermissionService(Role.Maintainer, Role.Reader);
        expect(s2.canModifyToTargetRole(Role.Owner)).toBe(false);
      });

      it("Owner -> Member or Maintainer => canModifyOwnerToOther => true if me=OWNER", () => {
        const s1 = new PermissionService(Role.Owner, Role.Owner);
        expect(s1.canModifyToTargetRole(Role.Reader)).toBe(true);
        expect(s1.canModifyToTargetRole(Role.Maintainer)).toBe(true);

        const s2 = new PermissionService(Role.Maintainer, Role.Owner);
        expect(s2.canModifyToTargetRole(Role.Maintainer)).toBe(false);
      });
    });
  });

  describe("Payment & Billing Methods", () => {
    it("canManagePaymentSettings => true only if OWNER", () => {
      const s1 = new PermissionService(Role.Owner, Role.Maintainer);
      const s2 = new PermissionService(Role.Maintainer, Role.Writer);
      expect(s1.canManagePaymentSettings()).toBe(true);
      expect(s2.canManagePaymentSettings()).toBe(false);
    });

    it("canViewBillingInfo => true only if OWNER", () => {
      const s1 = new PermissionService(Role.Owner, Role.Reader);
      const s2 = new PermissionService(Role.Reader, Role.Owner);
      expect(s1.canViewBillingInfo()).toBe(true);
      expect(s2.canViewBillingInfo()).toBe(false);
    });
  });

  describe("Workspace Settings", () => {
    it("canViewWorkspaceSettings => always true", () => {
      const roles = [
        Role.Owner,
        Role.Maintainer,
        Role.Reader,
        Role.Writer,
        undefined
      ];
      roles.forEach((r) => {
        const s = new PermissionService(r, Role.Reader);
        expect(s.canViewWorkspaceSettings()).toBe(true);
      });
    });

    it("canEditWorkspaceSettings => true only if OWNER", () => {
      const s1 = new PermissionService(Role.Owner, Role.Reader);
      const s2 = new PermissionService(Role.Maintainer, Role.Reader);
      expect(s1.canEditWorkspaceSettings()).toBe(true);
      expect(s2.canEditWorkspaceSettings()).toBe(false);
    });
  });

  describe("getRoleOptions", () => {
    const t = (key: string) => `translated(${key})`; // Mock translation

    it("returns all roles if me is OWNER", () => {
      const service = new PermissionService(Role.Owner, Role.Reader);
      const options = service.getRoleOptions(t);
      expect(options).toHaveLength(4);
      expect(options[0]).toEqual({
        value: Role.Reader,
        label: "translated(READER)"
      });
      expect(options[1]).toEqual({
        value: Role.Writer,
        label: "translated(WRITER)"
      });
      expect(options[2]).toEqual({
        value: Role.Maintainer,
        label: "translated(MAINTAINER) (WIP)"
      });
      expect(options[3]).toEqual({
        value: Role.Owner,
        label: "translated(OWNER)"
      });
    });

    it("returns READER, WRITER, MAINTAINER if me is MAINTAINER", () => {
      const service = new PermissionService(Role.Maintainer, Role.Writer);
      const options = service.getRoleOptions(t);
      expect(options).toHaveLength(3);
    });

    it("returns empty array otherwise", () => {
      const service = new PermissionService(Role.Reader, Role.Writer);
      expect(service.getRoleOptions(t)).toEqual([]);
    });
  });
});
