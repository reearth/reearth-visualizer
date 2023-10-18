import PublishedGis from "@reearth/beta/features/PublishedVisualizer";
import { useCore } from "@reearth/beta/utils/use-core";
import ClassicPublished from "@reearth/classic/components/organisms/Published";
import ClassicCorePublished from "@reearth/classic/components/organisms/Published/core";
import { Provider as DndProvider } from "@reearth/classic/util/use-dnd";

const PublishedPage: React.FC<{
  path?: string;
  default?: boolean;
  alias?: string;
}> = ({ alias }) => {
  const { isCore, isGisProject } = useCore("published", alias);

  return (
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
