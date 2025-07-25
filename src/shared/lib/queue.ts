class Queue<T> {
  private readonly items: T[] = [];

  public constructor(initialItems?: T[]) {
    if (initialItems !== undefined) {
      this.items.push(...initialItems);
    }
  }

  public dequeue(): T | null {
    return this.items.shift() ?? null;
  }

  public empty(): boolean {
    return this.items.length === 0;
  }

  public enqueue(item: T): void {
    this.items.push(item);
  }
}

export { Queue };
