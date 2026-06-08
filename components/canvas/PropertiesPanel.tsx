"use client";

import { type Canvas, type FabricImage, type FabricObject, type Group, type IText } from "fabric";
import { TextPanel } from "@/components/canvas/TextPanel";
import { ImagePanel } from "@/components/canvas/ImageSlotPanel";
import { ShapePanel } from "@/components/canvas/ShapePanel";
import { GradientLayerPanel } from "@/components/canvas/GradientLayerPanel";
import { SVGGroupPanel } from "@/components/canvas/SVGGroupPanel";
import {
  isGradientLayer,
  isImageObject,
  isSVGGroup,
  isShapeObject,
  isTextObject,
} from "@/lib/fabric-utils";

interface PropertiesPanelProps {
  canvas: Canvas | null;
  selectedObject?: FabricObject;
  onModified: () => void;
  liveUpdateTick?: number;
}

export function PropertiesPanel({
  canvas,
  selectedObject,
  onModified,
  liveUpdateTick,
}: PropertiesPanelProps) {
  // liveUpdateTick cambia durante el drag para que React re-renderice este árbol
  // y los paneles lean los valores actualizados del objeto Fabric.
  void liveUpdateTick;
  if (!selectedObject) {
    return null;
  }

  if (isGradientLayer(selectedObject)) {
    return <GradientLayerPanel obj={selectedObject as import("fabric").Rect} onModified={onModified} />;
  }

  if (isTextObject(selectedObject)) {
    return <TextPanel obj={selectedObject as IText} onModified={onModified} />;
  }

  if (isImageObject(selectedObject)) {
    return <ImagePanel obj={selectedObject as FabricImage} onModified={onModified} />;
  }

  if (isSVGGroup(selectedObject)) {
    return <SVGGroupPanel obj={selectedObject as Group} onModified={onModified} />;
  }

  if (isShapeObject(selectedObject)) {
    return <ShapePanel obj={selectedObject} onModified={onModified} />;
  }

  return null;
}
