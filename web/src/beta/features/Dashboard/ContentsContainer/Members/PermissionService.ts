import { Role } from "@reearth/services/gql";

export enum Action {
  ViewAllUsers = "viewAllUsers",
  InviteNewMembers = "inviteNewMembers",
  RemoveMember = "removeMember",
  RemoveMaintainer = "removeMaintainer",
  RemoveOwner = "removeOwner",
  ModifyMaintainerToMember = "modifyMaintainerToMember",
  ModifyMaintainerToOwner = "modifyMaintainerToOwner",
  ModifyOwnerToOther = "modifyOwnerToOther",
  ModifyMemberToMaintainer = "modifyMemberToMaintainer",
  ModifyMemberToOwner = "modifyMemberToOwner",
  ManagePaymentSettings = "managePaymentSettings",
  ViewBillingInfo = "viewBillingInfo",
  ViewWorkspaceSettings = "viewWorkspaceSettings",
  EditWorkspaceSettings = "editWorkspaceSettings"
}

interface IRolePermissionConfig {
  Reader?: boolean;
  Writer?: boolean;
  Maintainer?: boolean;
  Owner?: boolean;
  default?: boolean;
}

interface IPermissionEntry {
  Reader?: IRolePermissionConfig;
  Writer?: IRolePermissionConfig;
  Maintainer?: IRolePermissionConfig;
  Owner?: IRolePermissionConfig;
  default?: IRolePermissionConfig;
}

type PermissionMatrix = {
  [A in Action]?: IPermissionEntry;
};

function isMember(role: Role | undefined): boolean {
  return role === Role.Reader || role === Role.Writer;
}

const permissionMatrix: PermissionMatrix = {
  [Action.ViewAllUsers]: {
    default: { default: true }
  },
  [Action.InviteNewMembers]: {
    Maintainer: { default: true },
    Owner: { default: true }
  },
  [Action.RemoveMember]: {
    Maintainer: { Reader: true, Writer: true },
    Owner: { Reader: true, Writer: true }
  },
  [Action.RemoveMaintainer]: {
    Maintainer: { Maintainer: true },
    Owner: { Maintainer: true }
  },
  [Action.RemoveOwner]: {
    Owner: { Owner: true }
  },
  [Action.ModifyMaintainerToMember]: {
    Maintainer: { Maintainer: true },
    Owner: { Maintainer: true }
  },
  [Action.ModifyMaintainerToOwner]: {
    Owner: { Maintainer: true }
  },
  [Action.ModifyOwnerToOther]: {
    Owner: { Owner: true }
  },
  [Action.ModifyMemberToMaintainer]: {
    Maintainer: { Reader: true, Writer: true },
    Owner: { Reader: true, Writer: true }
  },
  [Action.ModifyMemberToOwner]: {
    Owner: { Reader: true, Writer: true }
  },
  [Action.ManagePaymentSettings]: {
    Owner: { default: true }
  },
  [Action.ViewBillingInfo]: {
    Owner: { default: true }
  },
  [Action.ViewWorkspaceSettings]: {
    default: { default: true }
  },
  [Action.EditWorkspaceSettings]: {
    Owner: { default: true }
  }
};

export class PermissionService {
  private meRole: Role | undefined;
  private memberRole: Role | undefined;

  constructor(meRole: Role | undefined, memberRole: Role | undefined) {
    this.meRole = meRole;
    this.memberRole = memberRole;
  }

  private checkPermission(action: Action): boolean {
    const entry = permissionMatrix[action];
    if (!entry) return false;

    let meCfg: IRolePermissionConfig | undefined;

    switch (this.meRole) {
      case Role.Reader:
        meCfg = entry.Reader;
        break;
      case Role.Writer:
        meCfg = entry.Writer;
        break;
      case Role.Maintainer:
        meCfg = entry.Maintainer;
        break;
      case Role.Owner:
        meCfg = entry.Owner;
        break;
      default:
        meCfg = entry.default;
        break;
    }

    if (!meCfg && entry.default) {
      return entry.default.default === true;
    }
    if (!meCfg) {
      return false;
    }

    if (meCfg.default !== undefined) {
      return meCfg.default;
    }

    if (!this.memberRole) return false;

    switch (this.memberRole) {
      case Role.Reader:
        return meCfg.Reader === true;
      case Role.Writer:
        return meCfg.Writer === true;
      case Role.Maintainer:
        return meCfg.Maintainer === true;
      case Role.Owner:
        return meCfg.Owner === true;
      default:
        return false;
    }
  }

  canViewAllUsers(): boolean {
    return this.checkPermission(Action.ViewAllUsers);
  }

  canInviteNewMembers(): boolean {
    return this.checkPermission(Action.InviteNewMembers);
  }

  canRemoveMember(): boolean {
    return this.checkPermission(Action.RemoveMember);
  }

  canRemoveMaintainer(): boolean {
    return this.checkPermission(Action.RemoveMaintainer);
  }

  canRemoveOwner(): boolean {
    return this.checkPermission(Action.RemoveOwner);
  }

  canModifyMaintainerToMember(): boolean {
    return this.checkPermission(Action.ModifyMaintainerToMember);
  }

  canModifyMaintainerToOwner(): boolean {
    return this.checkPermission(Action.ModifyMaintainerToOwner);
  }

  canModifyOwnerToOther(): boolean {
    return this.checkPermission(Action.ModifyOwnerToOther);
  }

  canModifyMemberToMaintainer(): boolean {
    return this.checkPermission(Action.ModifyMemberToMaintainer);
  }

  canModifyMemberToOwner(): boolean {
    return this.checkPermission(Action.ModifyMemberToOwner);
  }

  canManagePaymentSettings(): boolean {
    return this.checkPermission(Action.ManagePaymentSettings);
  }

  canViewBillingInfo(): boolean {
    return this.checkPermission(Action.ViewBillingInfo);
  }

  canViewWorkspaceSettings(): boolean {
    return this.checkPermission(Action.ViewWorkspaceSettings);
  }

  canEditWorkspaceSettings(): boolean {
    return this.checkPermission(Action.EditWorkspaceSettings);
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
    }
    return [];
  }

  canRemoveByRole(): boolean {
    if (isMember(this.memberRole)) return this.canRemoveMember();
    if (this.memberRole === Role.Maintainer) return this.canRemoveMaintainer();
    if (this.memberRole === Role.Owner) return this.canRemoveOwner();
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

  canModifyToTargetRole(newRole: Role): boolean {
    if (this.memberRole === Role.Maintainer) {
      if (isMember(newRole)) return this.canModifyMaintainerToMember();
      if (newRole === Role.Owner) return this.canModifyMaintainerToOwner();
      return false;
    }
    if (isMember(this.memberRole)) {
      if (newRole === Role.Maintainer)
        return this.canModifyMemberToMaintainer();
      if (newRole === Role.Owner) return this.canModifyMemberToOwner();
      return false;
    }
    if (this.memberRole === Role.Owner) {
      if (isMember(newRole) || newRole === Role.Maintainer)
        return this.canModifyOwnerToOther();
      return false;
    }
    return false;
  }
}
