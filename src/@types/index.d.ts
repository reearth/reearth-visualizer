declare module "*.yml" {
  const content: any;
  export default content;
}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const url: string;
  export default url;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.md";

declare module "*?raw" {
  const content: string;
  export default content;
}
