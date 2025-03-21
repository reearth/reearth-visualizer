import { Role } from "@reearth/services/gql";

function isMember(role: Role | undefined): boolean {
  return role === Role.Reader || role === Role.Writer;
}

export class PermissionService {
  private meRole: Role | undefined;
  private memberRole: Role | undefined;

  constructor(meRole: Role | undefined, memberRole: Role | undefined) {
    this.meRole = meRole;
    this.memberRole = memberRole;
  }

  canViewAllUsers(): boolean {
    return true;
  }

  canInviteNewMembers(): boolean {
    return this.meRole === Role.Maintainer || this.meRole === Role.Owner;
  }

  canRemoveMember(): boolean {
    return (
      (this.meRole === Role.Maintainer || this.meRole === Role.Owner) &&
      isMember(this.memberRole)
    );
  }

  canRemoveMaintainer(): boolean {
    return (
      (this.meRole === Role.Maintainer || this.meRole === Role.Owner) &&
      this.memberRole === Role.Maintainer
    );
  }

  canRemoveOwner(): boolean {
    return this.meRole === Role.Owner && this.memberRole === Role.Owner;
  }

  canModifyMaintainerToMember(): boolean {
    return (
      (this.meRole === Role.Maintainer || this.meRole === Role.Owner) &&
      this.memberRole === Role.Maintainer
    );
  }

  canModifyMaintainerToOwner(): boolean {
    return this.meRole === Role.Owner && this.memberRole === Role.Maintainer;
  }

  canModifyOwnerToOther(): boolean {
    return this.meRole === Role.Owner && this.memberRole === Role.Owner;
  }

  canModifyMemberToMaintainer(): boolean {
    return (
      (this.meRole === Role.Maintainer || this.meRole === Role.Owner) &&
      isMember(this.memberRole)
    );
  }

  canModifyMemberToOwner(): boolean {
    return this.meRole === Role.Owner && isMember(this.memberRole);
  }

  canManagePaymentSettings(): boolean {
    return this.meRole === Role.Owner;
  }

  canViewBillingInfo(): boolean {
    return this.meRole === Role.Owner;
  }

  canViewWorkspaceSettings(): boolean {
    return true;
  }

  canEditWorkspaceSettings(): boolean {
    return this.meRole === Role.Owner;
  }

  getRoleOptions(t: (key: string) => string): { value: Role; label: string }[] {
    if (this.meRole === Role.Owner) {
      return [
        { value: Role.Reader, label: t("READER") },
        { value: Role.Writer, label: t("WRITER") },
        { value: Role.Maintainer, label: t("MAINTAINER") + " (WIP)" },
        { value: Role.Owner, label: t("OWNER") }
      ];
    } else if (this.meRole === Role.Maintainer) {
      return [
        { value: Role.Reader, label: t("READER") },
        { value: Role.Writer, label: t("WRITER") },
        { value: Role.Maintainer, label: t("MAINTAINER") + " (WIP)" }
      ];
    } else {
      return [];
    }
  }

  canRemoveByRole(): boolean {
    if (isMember(this.memberRole)) {
      return this.canRemoveMember();
    }
    if (this.memberRole === Role.Maintainer) {
      return this.canRemoveMaintainer();
    }
    if (this.memberRole === Role.Owner) {
      return this.canRemoveOwner();
    }
    return false;
  }

  canModifyByRole(): boolean {
    if (this.memberRole === Role.Maintainer) {
      return this.meRole === Role.Maintainer || this.meRole === Role.Owner;
    }

    if (this.memberRole === Role.Owner) {
      return this.meRole === Role.Owner;
    }

    if (isMember(this.memberRole)) {
      return this.meRole === Role.Maintainer || this.meRole === Role.Owner;
    }
    return false;
  }

  /**
   * Check if the user can modify the role of the member to the target role
   * @param newRole target role
   */
  canModifyToTargetRole(newRole: Role): boolean {
    if (this.memberRole === Role.Maintainer) {
      if (isMember(newRole)) {
        return this.canModifyMaintainerToMember();
      }
      if (newRole === Role.Owner) {
        return this.canModifyMaintainerToOwner();
      }
      return false;
    }

    if (isMember(this.memberRole)) {
      if (newRole === Role.Maintainer) {
        return this.canModifyMemberToMaintainer();
      }
      if (newRole === Role.Owner) {
        return this.canModifyMemberToOwner();
      }
      return false;
    }

    if (this.memberRole === Role.Owner) {
      if (isMember(newRole) || newRole === Role.Maintainer) {
        return this.canModifyOwnerToOther();
      }
      return false;
    }

    return false;
  }
}
