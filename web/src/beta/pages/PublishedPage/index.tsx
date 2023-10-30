import NotFound from "@reearth/beta/components/NotFound";
import PublishedGis from "@reearth/beta/features/PublishedVisualizer";
import { useCore } from "@reearth/beta/utils/use-core";
import ClassicPublished from "@reearth/classic/components/organisms/Published";
import ClassicCorePublished from "@reearth/classic/components/organisms/Published/core";
import { Provider as DndProvider } from "@reearth/classic/util/use-dnd";
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
