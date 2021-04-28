import React from "react";
import { Meta } from "@storybook/react";
import { subHours, subDays, subMonths, subYears } from "date-fns";
import AssetItem from ".";

const now = new Date();

export default {
  title: "molecules/Settings/Workspace/Asset/AssetItem",
  component: AssetItem,
} as Meta;

export const Image = () => (
  <AssetItem
    id="1"
    teamId="1"
    name="image.png"
    size={100}
    contentType="image"
    url=""
    createdAt={subHours(now, 4)}
  />
);
export const ImageWithPreview = () => (
  <AssetItem
    id="2"
    teamId="2"
    name="photo.jpg"
    size={100}
    contentType="image"
    url="https://via.placeholder.com/200x200.png/3F51B5"
    createdAt={subHours(now, 4)}
  />
);
export const Video = () => (
  <AssetItem
    id="3"
    teamId="3"
    name="asset.mov"
    size={100}
    contentType="video"
    url=""
    createdAt={subDays(now, 3)}
  />
);
export const VideoWithPreview = () => (
  <AssetItem
    id="4"
    teamId="4"
    name="movie.mov"
    size={100}
    contentType="video"
    url="https://via.placeholder.com/200x400.png/3F51B5"
    createdAt={subDays(now, 3)}
  />
);
export const Pdf = () => (
  <AssetItem
    id="5"
    teamId="5"
    name="test_final.pdf"
    size={100}
    contentType="pdf"
    url=""
    createdAt={subMonths(now, 2)}
  />
);
export const None = () => (
  <AssetItem
    id="6"
    teamId="6"
    name="test"
    size={100}
    contentType=""
    url=""
    createdAt={subYears(now, 1)}
  />
);
