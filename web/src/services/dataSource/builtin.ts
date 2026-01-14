export type BuiltinDataSource = {
  name: string;
  label: string;
  icon?: string;
  url?: string;
};

export enum BuiltinDataSourceName {
  plateau = "plateau"
}

export const BUILTIN_DATA_SOURCES: Record<
  BuiltinDataSourceName,
  BuiltinDataSource
> = {
  [BuiltinDataSourceName.plateau]: {
    name: "plateau",
    label: "国土交通省 Project PLATEAU",
    icon: "https://www.mlit.go.jp/plateau/assets/img/common/logo.svg",
    url: "https://www.mlit.go.jp/plateau/open-data/"
  }
};
