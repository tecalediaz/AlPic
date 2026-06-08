/**
 * Store a nivel de módulo que sobrevive al Router Cache de Next.js.
 * El editor escribe aquí al guardar; el workspace lo lee al montar o volver.
 */

import type { Style } from "@/types";

let latestSavedStyle: Style | null = null;

export function storeLatestSavedStyle(style: Style) {
  latestSavedStyle = style;
}

export function consumeLatestSavedStyle(styleId: string): Style | null {
  if (latestSavedStyle?.id === styleId) {
    const s = latestSavedStyle;
    latestSavedStyle = null;
    return s;
  }
  return null;
}

export function peekLatestSavedStyle(styleId: string): Style | null {
  return latestSavedStyle?.id === styleId ? latestSavedStyle : null;
}
