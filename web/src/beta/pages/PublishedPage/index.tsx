import NotFound from "@reearth/beta/components/NotFound";
import PublishedGis from "@reearth/beta/features/Published";
import ClassicPublished from "@reearth/beta/organisms/Published";
import ClassicCorePublished from "@reearth/beta/organisms/Published/core";
import { useCore } from "@reearth/beta/utils/use-core";
import { Provider as DndProvider } from "@reearth/beta/utils/use-dnd";
import { useT } from "@reearth/services/i18n";

const PublishedPage: React.FC<{
  path?: string;
  default?: boolean;
  alias?: string;
}> = ({ alias }) => {
  const t = useT();
  const { isCore, isGisProject, hasError } = useCore("published", alias);

  return hasError ? (
    <NotFound
      customHeader={t("Something went wrong.")}
      customMessage={t("Couldn't find the Re:Earth project you were after.")}
    />
  ) : (
    <DndProvider>
      {isGisProject ? (
        <PublishedGis alias={alias} />
      ) : isCore ? (
        <ClassicCorePublished alias={alias} />
      ) : (
        <ClassicPublished alias={alias} />
      )}
    </DndProvider>
  );
};

export default PublishedPage;
