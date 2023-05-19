import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { ReactNode } from "react";

import { Camera as settings } from "@reearth/util/value";

import PropertyField, { Layer as LayerType } from ".";

const Wrapper: React.FC<{ children?: ReactNode }> = ({ children }) => (
  <div style={{ padding: "32px" }}>{children}</div>
);

const choices = [
  { key: "a", label: "a", icon: "scene" },
  { key: "b", label: "b", icon: "layer" },
];

const camera: settings = {
  lat: 35.652832,
  lng: 139.839478,
  height: 1000,
  heading: 0,
  roll: 1,
  pitch: 1,
  fov: 60,
};

export default {
  title: "molecules/EarthEditor/PropertyPane/PropertyField",
  component: PropertyField,
} as Meta;

export const Bool = () => (
  <Wrapper>
    <PropertyField schema={{ id: "Title", type: "bool" }} onChange={action("onChange")} />
  </Wrapper>
);
export const Number = () => (
  <Wrapper>
    <PropertyField schema={{ id: "Title", type: "number" }} onChange={action("onChange")} />
  </Wrapper>
);
export const String = () => (
  <Wrapper>
    <PropertyField schema={{ id: "Title", type: "string" }} onChange={action("onChange")} />
  </Wrapper>
);
export const LatLng = () => (
  <Wrapper>
    <PropertyField schema={{ id: "Title", type: "latlng" }} onChange={action("onChange")} />
  </Wrapper>
);
export const Url = () => (
  <Wrapper>
    <PropertyField schema={{ id: "Title", type: "url" }} onChange={action("onChange")} />
  </Wrapper>
);
export const BoolWithValue = () => (
  <Wrapper>
    <PropertyField
      schema={{ id: "Title", type: "bool" }}
      field={{ id: "Title", type: "bool", value: true }}
      onChange={action("onChange")}
    />
  </Wrapper>
);
export const NumberWithValue = () => (
  <Wrapper>
    <PropertyField
      schema={{ id: "Title", type: "number" }}
      field={{ id: "Title", type: "number", value: 100 }}
      onChange={action("onChange")}
    />
  </Wrapper>
);
export const StringWithValue = () => (
  <Wrapper>
    <PropertyField
      schema={{ id: "Title", type: "string" }}
      field={{ id: "Title", type: "string", value: "hogetext" }}
      onChange={action("onChange")}
    />
  </Wrapper>
);
export const LatLngWithValue = () => (
  <Wrapper>
    <PropertyField
      schema={{ id: "Title", type: "latlng" }}
      field={{ id: "Title", type: "latlng", value: { lat: 123.234, lng: 34.4323 } }}
      onChange={action("onChange")}
    />
  </Wrapper>
);
export const UrlWithValue = () => (
  <Wrapper>
    <PropertyField
      schema={{ id: "Title", type: "url" }}
      field={{ id: "Title", type: "url", value: `/sample.svg` }}
      onChange={action("onChange")}
    />
  </Wrapper>
);
export const Color = () => (
  <Wrapper>
    <PropertyField
      schema={{ id: "Color", type: "string", ui: "color" }}
      field={{ id: "Color", type: "string", value: "ff0000" }}
      onChange={action("onChange")}
    />
  </Wrapper>
);
export const Multiline = () => (
  <Wrapper>
    <PropertyField
      schema={{ id: "Text", type: "string", ui: "multiline" }}
      field={{ id: "Text", type: "string", value: "multiline\nmultiline" }}
      onChange={action("onChange")}
    />
  </Wrapper>
);
export const Selection = () => (
  <Wrapper>
    <PropertyField
      schema={{ id: "Mode", type: "string", ui: "selection", choices }}
      field={{ id: "Mode", type: "string", value: "a" }}
      onChange={action("onChange")}
    />
  </Wrapper>
);
export const Buttons = () => (
  <Wrapper>
    <PropertyField
      schema={{ id: "Mode", type: "string", ui: "buttons", defaultValue: "a", choices }}
      onChange={action("onChange")}
    />
  </Wrapper>
);
export const Camera = () => (
  <Wrapper>
    <PropertyField
      schema={{ id: "Camera", type: "camera" }}
      field={{ id: "Camera", type: "camera", value: camera }}
      onChange={action("onChange")}
    />
  </Wrapper>
);
export const Typography = () => (
  <Wrapper>
    <PropertyField
      schema={{ id: "Typography", type: "typography" }}
      onChange={action("onChange")}
    />
  </Wrapper>
);
export const Polygon = () => (
  <Wrapper>
    <PropertyField schema={{ id: "Polygon", type: "polygon" }} onChange={action("onChange")} />
  </Wrapper>
);
export const LayerRef = () => (
  <Wrapper>
    <PropertyField
      schema={{ id: "Layer", type: "ref", ui: "layer" }}
      field={{
        id: "Layer",
        type: "ref",
        value: "a",
      }}
      onChange={action("onChange")}
      layers={layers}
    />
  </Wrapper>
);

export const LinkedPartially = () => (
  <Wrapper>
    <PropertyField
      schema={{ id: "Polygon", type: "polygon" }}
      field={{
        id: "Polygon",
        type: "polygon",
        link: { schema: "xxx", field: "yyy", fieldName: "YYY" },
      }}
      onChange={action("onChange")}
    />
  </Wrapper>
);

const layers: LayerType[] = [
  { id: "a", title: "A" },
  {
    id: "b",
    title: "B",
    group: true,
    children: [
      { id: "d", title: "xxx" },
      { id: "e", title: "aaa" },
      { id: "f", title: "F", group: true, children: [{ id: "g", title: "G" }] },
    ],
  },
  { id: "c", title: "C" },
];
