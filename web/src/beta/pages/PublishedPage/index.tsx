import PublishedGis from "@reearth/beta/features/Published";
import { Provider as DndProvider } from "@reearth/beta/utils/use-dnd";

const PublishedPage: React.FC<{
  path?: string;
  default?: boolean;
  alias?: string;
}> = ({ alias }) => {
  return (
    <DndProvider>
      <PublishedGis alias={alias} />
    </DndProvider>
  );
};

export default PublishedPage;
