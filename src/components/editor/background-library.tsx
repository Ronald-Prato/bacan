import { Palette } from "lucide-react";

import type { BackgroundImage } from "@/editor/backgrounds";

type BackgroundLibraryProps = {
  activeColor: string;
  activeImageSrc?: string;
  colorSwatches: readonly string[];
  images: readonly BackgroundImage[];
  recentImages: readonly BackgroundImage[];
  onColorChange: (color: string) => void;
  onImageSelect: (background: BackgroundImage) => void;
  onShowAll: () => void;
};

export function BackgroundLibrary({
  activeColor,
  activeImageSrc,
  colorSwatches,
  images,
  recentImages,
  onColorChange,
  onImageSelect,
  onShowAll,
}: BackgroundLibraryProps) {
  return (
    <div className="space-y-5">
      <section aria-label="Colores de fondo">
        <div className="editor-background-color-strip flex gap-2 overflow-x-auto pb-1">
          <label className="editor-background-color-trigger relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-white/15 bg-[#181c20] text-slate-200 transition-colors hover:border-primary focus-within:border-ring">
            <Palette className="size-5" aria-hidden="true" />
            <input
              type="color"
              value={activeColor}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
              aria-label="Elegir color de fondo personalizado"
              onChange={(event) => onColorChange(event.target.value)}
            />
          </label>
          {colorSwatches.map((color) => {
            const isActive =
              !activeImageSrc && activeColor === color.toLowerCase();

            return (
              <button
                key={color}
                type="button"
                className={`size-10 shrink-0 rounded-full border-2 transition-colors hover:border-primary focus-visible:border-ring ${
                  isActive ? "border-primary" : "border-white/15"
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Usar fondo ${color}`}
                aria-pressed={isActive}
                onClick={() => onColorChange(color)}
              />
            );
          })}
        </div>
      </section>

      {recentImages.length > 0 ? (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="editor-background-section-title text-sm font-bold text-slate-200">
              Usado recién
            </h3>
            <button
              type="button"
              className="text-xs font-semibold text-slate-300 transition-colors hover:text-primary"
              onClick={onShowAll}
            >
              Ver todo
            </button>
          </div>
          <div className="editor-background-recents flex gap-2 overflow-x-auto pb-1">
            {recentImages.map((background) => (
              <BackgroundThumbnail
                key={background.id}
                background={background}
                isActive={activeImageSrc === background.src}
                className="size-[88px] shrink-0"
                onSelect={onImageSelect}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-2.5">
        <h3 className="editor-background-section-title text-sm font-bold text-slate-200">
          Todos los resultados
        </h3>
        {images.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {images.map((background) => (
              <BackgroundThumbnail
                key={background.id}
                background={background}
                isActive={activeImageSrc === background.src}
                className="aspect-square w-full"
                onSelect={onImageSelect}
              />
            ))}
          </div>
        ) : (
          <div className="editor-background-empty rounded-md border border-dashed border-white/15 bg-[#181c20] p-4 text-sm text-slate-400">
            No hay imágenes para esa búsqueda.
          </div>
        )}
      </section>
    </div>
  );
}

function BackgroundThumbnail({
  background,
  isActive,
  className,
  onSelect,
}: {
  background: BackgroundImage;
  isActive: boolean;
  className: string;
  onSelect: (background: BackgroundImage) => void;
}) {
  return (
    <button
      type="button"
      className={`editor-background-thumbnail overflow-hidden rounded-sm border-2 bg-[#181c20] transition-colors hover:border-primary focus-visible:border-ring ${
        isActive ? "border-primary" : "border-transparent"
      } ${className}`}
      title={background.name}
      aria-label={`Usar fondo ${background.name}`}
      aria-pressed={isActive}
      onClick={() => onSelect(background)}
    >
      <img
        src={background.src}
        alt=""
        loading="lazy"
        className="size-full object-cover"
      />
    </button>
  );
}
