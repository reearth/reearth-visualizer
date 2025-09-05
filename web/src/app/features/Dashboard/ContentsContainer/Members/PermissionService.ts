import { Role } from "@reearth/services/gql";

export enum Action {
  ViewAllUsers = "viewAllUsers",
  Invite = "invite",
  Remove = "remove",
  Modify = "modify",
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

const permissionMatrix: PermissionMatrix = {
  [Action.Invite]: {
    //maintainer can't add new member for now
    Maintainer: { default: false },
    Owner: { default: true }
  },
  [Action.Remove]: {
    //maintainer can't remove member for now
    Maintainer: { Reader: false, Writer: false, Maintainer: false },
    Owner: { Reader: true, Writer: true, Maintainer: true, Owner: true }
  },
  [Action.Modify]: {
    //maintainer can't modify member role for now
    Maintainer: { Reader: false, Writer: false, Maintainer: false },
    Owner: { Reader: true, Writer: true, Maintainer: true, Owner: true }
  },
  [Action.ViewAllUsers]: {
    default: { default: true }
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

export const PermissionService = {
  checkPermission(action: Action, actorRole: Role, targetRole?: Role): boolean {
    const entry = permissionMatrix[action];
    if (!entry) return false;

    let cfg: IRolePermissionConfig | undefined;
    switch (actorRole) {
      case Role.Reader:
        cfg = entry.Reader;
        break;
      case Role.Writer:
        cfg = entry.Writer;
        break;
      case Role.Maintainer:
        cfg = entry.Maintainer;
        break;
      case Role.Owner:
        cfg = entry.Owner;
        break;
      default:
        cfg = entry.default;
        break;
    }

    if (!cfg && entry.default) {
      return entry.default.default === true;
    }
    if (!cfg) return false;
    if (cfg.default !== undefined) return cfg.default;

    if (targetRole) {
      switch (targetRole) {
        case Role.Reader:
          return cfg.Reader === true;
        case Role.Writer:
          return cfg.Writer === true;
        case Role.Maintainer:
          return cfg.Maintainer === true;
        case Role.Owner:
          return cfg.Owner === true;
        default:
          return false;
      }
    }
    return false;
  },

  canViewAllUsers(actorRole: Role): boolean {
    return this.checkPermission(Action.ViewAllUsers, actorRole);
  },

  canInvite(actorRole: Role): boolean {
    return this.checkPermission(Action.Invite, actorRole);
  },

  canRemove(actorRole: Role, targetRole: Role, islast: boolean): boolean {
    if (islast) return false;
    return this.checkPermission(Action.Remove, actorRole, targetRole);
  },

  canModify(actorRole: Role, targetRole: Role, islast: boolean): boolean {
    if (islast) return false;
    return this.checkPermission(Action.Modify, actorRole, targetRole);
  },

  canManagePaymentSettings(actorRole: Role): boolean {
    return this.checkPermission(Action.ManagePaymentSettings, actorRole);
  },

  canViewBillingInfo(actorRole: Role): boolean {
    return this.checkPermission(Action.ViewBillingInfo, actorRole);
  },

  canViewWorkspaceSettings(actorRole: Role): boolean {
    return this.checkPermission(Action.ViewWorkspaceSettings, actorRole);
  },

  canEditWorkspaceSettings(actorRole: Role): boolean {
    return this.checkPermission(Action.EditWorkspaceSettings, actorRole);
  },

  getRoleOptions(
    t: (key: string) => string,
    actorRole: Role
  ): { value: Role; label: string }[] {
    if (actorRole === Role.Owner) {
      return [
        { value: Role.Reader, label: t("READER") },
        { value: Role.Writer, label: t("WRITER") },
        { value: Role.Maintainer, label: t("MAINTAINER") + " (WIP)" },
        { value: Role.Owner, label: t("OWNER") }
      ];
    } else if (actorRole === Role.Maintainer) {
      return [
        { value: Role.Reader, label: t("READER") },
        { value: Role.Writer, label: t("WRITER") },
        { value: Role.Maintainer, label: t("MAINTAINER") + " (WIP)" }
      ];
    }
    return [];
  },

  getRoleLabel(t: (key: string) => string, role: Role): string {
    const memerRoleTranslation = {
      MAINTAINER: t("MAINTAINER"),
      OWNER: t("OWNER"),
      READER: t("READER"),
      WRITER: t("WRITER")
    };
    return role === Role.Maintainer
      ? //maintainer backend mutation work in progress for now
        memerRoleTranslation[role].toLowerCase() + "(WIP)"
      : memerRoleTranslation[role].toLowerCase();
  }
};
