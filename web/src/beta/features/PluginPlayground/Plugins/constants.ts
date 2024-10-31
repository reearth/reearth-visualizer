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
  sourceCode: `
        id: test-plugin
        name: Test plugin
        version: 1.0.0
        extensions:
            - id: test-widget
                type: widget
                name: Test
    `,
  disableEdit: true,
  disableDelete: true
} as const satisfies FileType;

export const ALLOWED_FILE_EXTENSIONS = ["yaml", "yml", "js"] as const;
