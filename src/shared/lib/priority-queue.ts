type PriorityQueueElement<T> = {
  item: T;
  priority: number;
};

class PriorityQueue<T> {
  private readonly elements: PriorityQueueElement<T>[] = [];

  public constructor(initialElements: PriorityQueueElement<T>[] = []) {
    this.elements = initialElements;
  }

  public enqueue(item: T, priority: number): void {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  public dequeue(): T | null {
    return this.elements.shift()?.item ?? null;
  }

  public empty(): boolean {
    return this.elements.length === 0;
  }
}

export { PriorityQueue };
