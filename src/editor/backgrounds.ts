import { filterSearchItems } from "./search";

export type BackgroundPalette = {
  id: string;
  name: string;
  colors: readonly string[];
};

export type BackgroundImage = {
  id: string;
  name: string;
  src: string;
  keywords: readonly string[];
};

export type BackgroundCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const BACKGROUND_IMAGES: readonly BackgroundImage[] = [
  {
    id: "blue-concrete",
    name: "Concreto azul",
    src: "/backgrounds/blue-concrete.jpg",
    keywords: ["textura", "cemento", "azul"],
  },
  {
    id: "white-plaster",
    name: "Yeso blanco",
    src: "/backgrounds/white-plaster.jpg",
    keywords: ["textura", "pared", "blanco"],
  },
  {
    id: "warm-wood",
    name: "Madera calida",
    src: "/backgrounds/warm-wood.jpg",
    keywords: ["textura", "madera", "marron"],
  },
  {
    id: "white-marble",
    name: "Marmol blanco",
    src: "/backgrounds/white-marble.jpg",
    keywords: ["textura", "marmol", "piedra"],
  },
  {
    id: "green-field",
    name: "Cancha verde",
    src: "/backgrounds/green-field.jpg",
    keywords: ["deporte", "cesped", "verde"],
  },
  {
    id: "coffee-beans",
    name: "Granos de cafe",
    src: "/backgrounds/coffee-beans.jpg",
    keywords: ["comida", "cafe", "marron"],
  },
  {
    id: "balloons",
    name: "Globos de fiesta",
    src: "/backgrounds/balloons.jpg",
    keywords: ["fiesta", "globos", "color"],
  },
  {
    id: "modern-interior",
    name: "Interior moderno",
    src: "/backgrounds/modern-interior.jpg",
    keywords: ["casa", "muebles", "decoracion"],
  },
  {
    id: "orange-sky",
    name: "Cielo naranja",
    src: "/backgrounds/orange-sky.jpg",
    keywords: ["atardecer", "cielo", "naranja"],
  },
];

export const BACKGROUND_PALETTES: readonly BackgroundPalette[] = [
  {
    id: "sunset",
    name: "Atardecer",
    colors: ["#fff1d6", "#ffd6a5", "#ffadad", "#cdb4db", "#6d597a"],
  },
  {
    id: "forest",
    name: "Bosque",
    colors: ["#edf6e5", "#b7d3a8", "#7fa06a", "#496a48", "#263d2d"],
  },
  {
    id: "ocean",
    name: "Oceano",
    colors: ["#e8f6f8", "#a8dadc", "#74b3ce", "#457b9d", "#264653"],
  },
  {
    id: "neutrals",
    name: "Neutros",
    colors: ["#faf9f6", "#e7e2da", "#c9c1b7", "#817970", "#34312f"],
  },
];

export function filterBackgroundPalettes(query: string): BackgroundPalette[] {
  return filterSearchItems(BACKGROUND_PALETTES, query, [
    "name",
    (palette) => palette.colors.join(" "),
  ]);
}

export function filterBackgroundImages(query: string): BackgroundImage[] {
  return filterSearchItems(BACKGROUND_IMAGES, query, [
    "name",
    (background) => background.keywords.join(" "),
  ]);
}

export function updateRecentBackgroundIds(
  recentIds: readonly string[],
  selectedId: string,
  limit = 4,
): string[] {
  return [selectedId, ...recentIds.filter((id) => id !== selectedId)].slice(
    0,
    Math.max(0, limit),
  );
}

export function getBackgroundCoverCrop(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): BackgroundCrop {
  const sourceAspectRatio = sourceWidth / sourceHeight;
  const targetAspectRatio = targetWidth / targetHeight;

  if (sourceAspectRatio > targetAspectRatio) {
    const width = sourceHeight * targetAspectRatio;

    return {
      x: (sourceWidth - width) / 2,
      y: 0,
      width,
      height: sourceHeight,
    };
  }

  const height = sourceWidth / targetAspectRatio;

  return {
    x: 0,
    y: (sourceHeight - height) / 2,
    width: sourceWidth,
    height,
  };
}

export function normalizeBackgroundColorForPicker(
  color: string,
  fallback = "#ffffff",
): string {
  const normalized = color.trim().toLowerCase();
  const shortHexMatch = normalized.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/);

  if (shortHexMatch) {
    return `#${shortHexMatch
      .slice(1)
      .map((value) => `${value}${value}`)
      .join("")}`;
  }

  return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : fallback;
}
