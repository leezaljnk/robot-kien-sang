export interface IdentifiableTrashItem {
  id: string;
}

export function drawTrashItems<T extends IdentifiableTrashItem>(
  items: readonly T[],
  remaining: readonly T[],
  count: number,
  random: () => number = Math.random
): { selected: T[]; remaining: T[] } {
  const selected: T[] = [];
  let bag = [...remaining];

  while (selected.length < count && items.length > 0) {
    if (bag.length === 0) {
      bag = [...items];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    }

    const next = bag.shift();
    if (next) selected.push(next);
  }

  return { selected, remaining: bag };
}
