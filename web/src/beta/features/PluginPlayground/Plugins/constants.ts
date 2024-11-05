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
  sourceCode: `id: test-plugin
name: Test plugin
version: 1.0.0
extensions:
  - id: button
    type: widget
    name: Button
    description: Button widget
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
