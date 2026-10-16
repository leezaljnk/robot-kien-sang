interface Bounds {
  left: number;
  right: number;
  bottom: number;
  top: number;
  width: number;
  height: number;
}

export function getBinApproachTarget(
  area: Bounds,
  bin: Bounds,
  robotWidth: number,
  organic: boolean
) {
  const halfWidth = robotWidth / 2;
  const centerX = organic ? bin.right + halfWidth + 8 : bin.left - halfWidth - 8;
  const x = Math.max(halfWidth, Math.min(area.width - halfWidth, centerX - area.left));
  const y = Math.max(0, Math.min(area.height, bin.bottom - area.top));
  return { x: x / area.width * 100, y: y / area.height * 100 };
}
