export type User = {
  name: string;
};

export type Workspace = {
  id?: string;
  name?: string;
  members?: Array<any>;
  policy?: {
    id: string;
    name: string;
  } | null;
};

export type Project = {
  id?: string;
  name?: string;
};
