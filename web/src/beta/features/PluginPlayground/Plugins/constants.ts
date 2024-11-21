export type PluginType = {
  id: string;
  title: string;
  files: FileType[];
};

export type FileType = {
  id: string;
  title: string;
  sourceCode: string;
  disableEdit?: boolean;
  disableDelete?: boolean;
};

export const REEARTH_YML_FILE = {
  id: "reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: demo-widget
name: Test plugin
version: 1.0.0
extensions:
  - id: demo-widget
    type: widget
    name: Demo Widget
    description: Demo widget
    widgetLayout:
      defaultLocation:
        zone: outer
        section: left
        area: top
  `,
  disableEdit: true,
  disableDelete: true
} as const satisfies FileType;

export const ALLOWED_FILE_EXTENSIONS = ["js"] as const;
