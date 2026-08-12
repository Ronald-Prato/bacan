import { describe, expect, it } from "vitest";

import {
  BACKGROUND_IMAGES,
  BACKGROUND_PALETTES,
  filterBackgroundImages,
  filterBackgroundPalettes,
  getBackgroundCoverCrop,
  normalizeBackgroundColorForPicker,
  updateRecentBackgroundIds,
} from "./backgrounds";

describe("editor backgrounds", () => {
  it("provides simple starter palettes", () => {
    expect(BACKGROUND_PALETTES.map((palette) => palette.name)).toEqual([
      "Atardecer",
      "Bosque",
      "Oceano",
      "Neutros",
    ]);
    expect(
      BACKGROUND_PALETTES.every((palette) => palette.colors.length === 5),
    ).toBe(true);
  });

  it("filters palettes by name or color", () => {
    expect(
      filterBackgroundPalettes("bosque").map((palette) => palette.id),
    ).toEqual(["forest"]);
    expect(
      filterBackgroundPalettes("#264653").map((palette) => palette.id),
    ).toEqual(["ocean"]);
  });

  it("provides a searchable local image library", () => {
    expect(BACKGROUND_IMAGES.length).toBeGreaterThanOrEqual(9);
    expect(
      new Set(BACKGROUND_IMAGES.map((background) => background.id)).size,
    ).toBe(BACKGROUND_IMAGES.length);
    expect(
      BACKGROUND_IMAGES.every((background) =>
        background.src.startsWith("/backgrounds/"),
      ),
    ).toBe(true);
    expect(
      filterBackgroundImages("marmol").map((background) => background.id),
    ).toContain("white-marble");
    expect(
      filterBackgroundImages("cafe").map((background) => background.id),
    ).toContain("coffee-beans");
  });

  it("moves a used background to the front of a bounded recent list", () => {
    expect(
      updateRecentBackgroundIds(["paper", "wood", "marble"], "wood", 3),
    ).toEqual(["wood", "paper", "marble"]);
    expect(
      updateRecentBackgroundIds(["paper", "wood", "marble"], "concrete", 3),
    ).toEqual(["concrete", "paper", "wood"]);
  });

  it("calculates a centered cover crop for background images", () => {
    expect(getBackgroundCoverCrop(1600, 800, 1000, 1000)).toEqual({
      x: 400,
      y: 0,
      width: 800,
      height: 800,
    });
    expect(getBackgroundCoverCrop(800, 1600, 1000, 1000)).toEqual({
      x: 0,
      y: 400,
      width: 800,
      height: 800,
    });
  });

  it("normalizes canvas colors for the native color picker", () => {
    expect(normalizeBackgroundColorForPicker("#ABC")).toBe("#aabbcc");
    expect(normalizeBackgroundColorForPicker("#12A4EF")).toBe("#12a4ef");
    expect(normalizeBackgroundColorForPicker("transparent")).toBe("#ffffff");
  });
});
