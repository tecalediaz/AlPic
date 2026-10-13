import { getInitialFabricJson } from "@/lib/canvas-config";
import type { AspectRatio, Style, StyleListItem } from "@/types";

const STORAGE_KEY = "alpic.styles.v1";
export const LOCAL_WORKSPACE_ID = "local";

function readStyles(): Style[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Los estilos locales no se pudieron leer.");
  return parsed.filter((item): item is Style =>
    typeof item === "object" && item !== null &&
    typeof item.id === "string" && typeof item.name === "string" &&
    typeof item.fabric_json === "object" && item.fabric_json !== null &&
    typeof item.aspect_ratio === "string",
  );
}

function writeStyles(styles: Style[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
  } catch {
    throw new Error("No hay espacio para guardar este estilo en el navegador. Reducí el tamaño de las imágenes o exportá una copia.");
  }
}

export function listLocalStyles(): StyleListItem[] {
  return readStyles().map(({ fabric_json: _fabricJson, ...style }) => {
    void _fabricJson;
    return style;
  }).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function getLocalStyle(id: string): Style | null {
  return readStyles().find((style) => style.id === id) ?? null;
}

export function createLocalStyle(name: string, aspectRatio: AspectRatio = "9:16"): Style {
  const now = new Date().toISOString();
  const style: Style = {
    id: crypto.randomUUID(),
    code_id: LOCAL_WORKSPACE_ID,
    name: name.trim(),
    fabric_json: getInitialFabricJson(aspectRatio),
    aspect_ratio: aspectRatio,
    thumbnail: null,
    created_at: now,
    updated_at: now,
  };
  if (!style.name) throw new Error("Escribí un nombre para el estilo.");
  writeStyles([style, ...readStyles()]);
  return style;
}

export function saveLocalStyle(id: string, changes: Pick<Style, "name" | "fabric_json" | "thumbnail" | "aspect_ratio">): Style {
  const styles = readStyles();
  const index = styles.findIndex((style) => style.id === id);
  if (index < 0) throw new Error("Este estilo ya no está guardado en este navegador.");
  const updated = { ...styles[index], ...changes, name: changes.name.trim(), updated_at: new Date().toISOString() };
  if (!updated.name) throw new Error("Escribí un nombre para el estilo.");
  styles[index] = updated;
  writeStyles(styles);
  return updated;
}

export function deleteLocalStyle(id: string) {
  writeStyles(readStyles().filter((style) => style.id !== id));
}
