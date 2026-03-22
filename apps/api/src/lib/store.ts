/**
 * Lightweight in-memory store – a thin wrapper around a Map.
 * Replace with a real database adapter (Prisma, Drizzle, etc.) when ready.
 */
export class InMemoryStore<T extends { id: string }> {
  private store = new Map<string, T>();

  findAll(): T[] {
    return Array.from(this.store.values());
  }

  findById(id: string): T | undefined {
    return this.store.get(id);
  }

  findOne(predicate: (item: T) => boolean): T | undefined {
    return this.findAll().find(predicate);
  }

  create(item: T): T {
    this.store.set(item.id, item);
    return item;
  }

  update(id: string, patch: Partial<Omit<T, 'id'>>): T | undefined {
    const existing = this.store.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch };
    this.store.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  count(): number {
    return this.store.size;
  }

  /** Clear all entries – useful in tests. */
  clear(): void {
    this.store.clear();
  }
}
