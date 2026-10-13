"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ASPECT_RATIOS } from "@/lib/constants";
import type { AspectRatio, StyleListItem } from "@/types";
import { cn } from "@/lib/utils";

interface StyleSelectorProps {
  styles: StyleListItem[];
  codeId: string;
  selectedId?: string;
  onSelect: (style: StyleListItem) => void;
  onDelete?: (style: StyleListItem) => void;
}

function getAspectRatioValue(ratio: AspectRatio): string {
  const { width, height } = ASPECT_RATIOS[ratio];
  return `${width} / ${height}`;
}

export function StyleSelector({
  styles,
  codeId,
  selectedId,
  onSelect,
  onDelete,
}: StyleSelectorProps) {
  return (
    <div className="style-masonry">
      {styles.map((style) => {
        const ratio = style.aspect_ratio as AspectRatio;
        const ratioMeta = ASPECT_RATIOS[ratio];

        return (
          <div
            key={style.id}
            className={cn(
              "style-masonry-item group relative",
              selectedId === style.id && "rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background",
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(style)}
              className="style-card w-full cursor-pointer overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm"
            >
              <div
                className="canvas-checkerboard relative w-full overflow-hidden bg-surface"
                style={{ aspectRatio: getAspectRatioValue(ratio) }}
              >
                {style.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={style.thumbnail}
                    alt={style.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted">
                    Sin preview
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/35 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="translate-y-2 font-medium text-white transition-transform duration-300 group-hover:translate-y-0">
                    {style.name}
                  </p>
                  <p className="mt-1 translate-y-2 text-sm text-white/75 transition-[transform,opacity] delay-75 duration-300 group-hover:translate-y-0">
                    {ratio} — {ratioMeta.label}
                  </p>
                </div>
              </div>
            </button>

            <div className="absolute right-2 top-2 z-10 flex gap-1.5 opacity-100 transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="liquid-glass-btn liquid-glass-btn-icon h-8 w-8 hover:bg-transparent"
                asChild
              >
                <Link
                  href={`/editor/${codeId}/${style.id}`}
                  aria-label={`Editar ${style.name}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="liquid-glass-btn-danger liquid-glass-btn-icon h-8 w-8 hover:bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(style);
                  }}
                  aria-label={`Eliminar ${style.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
