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
                className="canvas-checkerboard style-card-preview relative w-full overflow-hidden bg-surface"
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
                    Sin vista previa
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="truncate font-semibold text-foreground">{style.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{ratio} · {ratioMeta.label}</span>
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
