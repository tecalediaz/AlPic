/** Incremento de snap al rotar con Shift/Alt (0°, 45°, 90°, …). */
export const ROTATION_SNAP_INCREMENT = 45;

export function snapRotationAngle(
  angle: number,
  increment: number = ROTATION_SNAP_INCREMENT,
): number {
  return Math.round(angle / increment) * increment;
}

/** Activa el snap de rotación cuando se mantiene Shift o Alt. */
export function shouldSnapRotation(e?: { shiftKey?: boolean; altKey?: boolean }): boolean {
  return (e?.shiftKey ?? false) || (e?.altKey ?? false);
}
