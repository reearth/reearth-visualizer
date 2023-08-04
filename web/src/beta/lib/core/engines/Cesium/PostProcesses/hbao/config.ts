export const AMBIENT_OCCLUSION_QUALITY: Record<
  "low" | "medium" | "high" | "extreme",
  { steps: number; directions: number; textureScale: number; maxRadius: number }
> = {
  low: {
    directions: 4,
    steps: 4,
    textureScale: 0.5,
    maxRadius: 30,
  },
  medium: {
    directions: 4,
    steps: 8,
    textureScale: 0.5,
    maxRadius: 40,
  },
  high: {
    directions: 8,
    steps: 8,
    textureScale: 1,
    maxRadius: 40,
  },
  extreme: {
    directions: 16,
    steps: 16,
    textureScale: 1,
    maxRadius: 40,
  },
};
