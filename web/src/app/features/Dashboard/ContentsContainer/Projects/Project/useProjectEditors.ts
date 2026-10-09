import { formatRelativeTime } from "@reearth/app/utils/time";
import { useMe } from "@reearth/services/api/user";
import { useWorkspace } from "@reearth/services/api/workspace";
import { useT } from "@reearth/services/i18n/hooks";
import { useCallback, useMemo } from "react";

import { Project as ProjectType } from "../../../type";

export type Editor = {
  name: string;
  avatarURL?: string;
};

export default (project: ProjectType) => {
  const t = useT();
  const { me } = useMe();
  const { workspace } = useWorkspace(project.workspaceId);

  const lang = me.lang;

  const resolveEditor = useCallback(
    (userId?: string | null): Editor | undefined => {
      if (!userId) return undefined;
      // Only the signed-in user's photo is available on the client, so other
      // members always fall back to their initial.
      if (userId === me.id) {
        return {
          name: me.name ?? "",
          avatarURL: me.metadata?.photoURL ?? undefined
        };
      }
      const member = workspace?.members.find((m) => m.userId === userId);
      return { name: member?.user?.name ?? t("Unknown user") };
    },
    [me.id, me.name, me.metadata?.photoURL, workspace?.members, t]
  );

  const creator = useMemo(
    () => resolveEditor(project.createdById),
    [resolveEditor, project.createdById]
  );
  // A project that has never been edited has no updatedById yet, so its last
  // editor is whoever created it.
  const lastEditor = useMemo(
    () => resolveEditor(project.updatedById) ?? creator,
    [resolveEditor, project.updatedById, creator]
  );

  const updatedRelative = useMemo(
    () =>
      project.updatedAt
        ? formatRelativeTime(new Date(project.updatedAt), lang)
        : undefined,
    [project.updatedAt, lang]
  );

  const updatedAtFull = useMemo(() => {
    if (!project.updatedAt) return undefined;
    const date = new Date(project.updatedAt);
    const time = date.toLocaleTimeString(lang, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    return `${date.toLocaleDateString(lang)} ${time}`;
  }, [project.updatedAt, lang]);

  const createdAtFull = useMemo(
    () =>
      project.createdAt
        ? new Date(project.createdAt).toLocaleDateString(lang)
        : undefined,
    [project.createdAt, lang]
  );

  return {
    creator,
    lastEditor,
    updatedRelative,
    updatedAtFull,
    createdAtFull
  };
};
