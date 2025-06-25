import Published from "@reearth/app/features/Published";

const PublishedPage: React.FC<{
  path?: string;
  default?: boolean;
  alias?: string;
}> = ({ alias }) => {
  return <Published alias={alias} />;
};

export default PublishedPage;
