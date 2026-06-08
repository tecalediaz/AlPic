import type { Canvas, FabricObject } from "fabric";
import { isUserText } from "@/lib/fabric-utils";

export function countUserTexts(canvas: Canvas): number {
  return canvas.getObjects().filter((obj) => isUserText(obj)).length;
}

export interface UserTextPickerPosition {
  x: number;
  y: number;
}

export function getUserTextPickerPosition(
  canvas: Canvas,
  obj: FabricObject,
): UserTextPickerPosition {
  const bb = obj.getBoundingRect();
  const canvasRect = canvas.getElement().getBoundingClientRect();

  return {
    x: canvasRect.left + bb.left + bb.width / 2,
    y: canvasRect.top + bb.top,
  };
}
