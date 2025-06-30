/* eslint-disable no-restricted-syntax */
function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

export default function compareData<T extends Record<string, any>>(
  existing: T[],
  updated: T[],
  idField: keyof T
) {
  const existingMap = new Map<any, T>()
  const updatedSet = new Set<any>()
  const toDelete: any[] = []
  const toUpdate: T[] = []
  const toInsert: T[] = []

  // Build existing map and identify deletions
  for (const item of existing) {
    existingMap.set(item[idField], item);
  }

  // Process updated items
  for (const item of updated) {
    const id = item[idField]
    updatedSet.add(id)

    const existingItem = existingMap.get(id)
    if (!existingItem) {
      toInsert.push(item)
    } else if (!deepEqual(existingItem, item)) {
      toUpdate.push(item)
    }
  }

  // Find items to delete (exist in current but not in updated)
  for (const [id] of existingMap) {
    if (!updatedSet.has(id)) {
      toDelete.push(id)
    }
  }

  return { toDelete, toUpdate, toInsert }
}
