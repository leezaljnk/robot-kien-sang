export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function getTrashSpawnSlots(
  area: Rect,
  bins: Rect[],
  playableArea: Rect = area,
  obstacles: Rect[] = []
) {
  const width = area.right - area.left;
  const height = area.bottom - area.top;
  const slots: { x: number; y: number }[] = [];
  const halfWidth = 90;
  const halfHeight = 55;
  const clearance = 24;
  const stepX = 128;
  const stepY = 48;
  const blockers = [...bins, ...obstacles];
  const candidateXs = new Set<number>();
  const candidateYs = new Set<number>();

  for (let cx = playableArea.left + halfWidth + clearance;
    cx <= playableArea.right - halfWidth - clearance;
    cx += stepX) candidateXs.add(cx);
  for (let cy = playableArea.top + halfHeight + clearance;
    cy <= playableArea.bottom - halfHeight - clearance;
    cy += stepY) candidateYs.add(cy);
  for (const blocker of blockers) {
    candidateXs.add(blocker.left - halfWidth - clearance - 1);
    candidateXs.add(blocker.right + halfWidth + clearance + 1);
    candidateYs.add(blocker.top - halfHeight - clearance - 1);
    candidateYs.add(blocker.bottom + halfHeight + clearance + 1);
  }

  for (const cy of candidateYs) {
    for (const cx of candidateXs) {
      if (cx < playableArea.left + halfWidth + clearance ||
        cx > playableArea.right - halfWidth - clearance ||
        cy < playableArea.top + halfHeight + clearance ||
        cy > playableArea.bottom - halfHeight - clearance) continue;
      const isClear = blockers.every(blocker =>
        cx + halfWidth + clearance < blocker.left ||
        cx - halfWidth - clearance > blocker.right ||
        cy + halfHeight + clearance < blocker.top ||
        cy - halfHeight - clearance > blocker.bottom
      );
      if (isClear) {
        slots.push({
          x: (cx - area.left) / width * 100,
          y: (cy - area.top) / height * 100,
        });
      }
    }
  }
  return slots;
}

export function getNonOverlappingTrashSpawnSlots(
  slots: { x: number; y: number }[],
  area: Rect,
  count: number,
  occupied: { x: number; y: number }[] = [],
  random: () => number = Math.random
) {
  const width = area.right - area.left;
  const height = area.bottom - area.top;
  const minHorizontalDistance = 118;
  const minVerticalDistance = 104;
  const candidates = [...slots];

  for (let index = candidates.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
  }

  const findSelection = (startIndex: number, selected: { x: number; y: number }[]): { x: number; y: number }[] | null => {
    if (selected.length === count) return selected;
    for (let index = startIndex; index < candidates.length; index++) {
      const candidate = candidates[index];
      const isClear = [...occupied, ...selected].every(point =>
        Math.abs(candidate.x - point.x) / 100 * width >= minHorizontalDistance ||
        Math.abs(candidate.y - point.y) / 100 * height >= minVerticalDistance
      );
      if (!isClear) continue;
      const result = findSelection(index + 1, [...selected, candidate]);
      if (result) return result;
    }
    return null;
  };

  return findSelection(0, []) || [];
}
