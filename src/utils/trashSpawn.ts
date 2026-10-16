interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function getTrashSpawnSlots(area: Rect, bins: Rect[]) {
  const width = area.right - area.left;
  const height = area.bottom - area.top;
  const slots: { x: number; y: number }[] = [];
  // Include the label and rotation, not just the 56px trash image.
  const halfWidth = 90;
  const halfHeight = 55;
  const clearance = 24;
  for (const y of [62, 72, 82, 52, 42]) {
    for (const x of [30, 50, 70]) {
      const cx = area.left + x / 100 * width;
      const cy = area.top + y / 100 * height;
      if (bins.every(bin =>
        cx + halfWidth + clearance < bin.left ||
        cx - halfWidth - clearance > bin.right ||
        cy + halfHeight + clearance < bin.top ||
        cy - halfHeight - clearance > bin.bottom
      )) slots.push({ x, y });
    }
  }
  return slots;
}
