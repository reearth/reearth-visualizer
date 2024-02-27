export class WorkerQueue<T> {
  private queue: (() => Promise<T>)[] = [];
  private maxConcurrentTasks: number;
  private runningTasks = 0;
  private onEmpty: () => void;

  constructor(maxConcurrentTasks = 5, onEmpty: () => void) {
    this.maxConcurrentTasks = maxConcurrentTasks;
    this.onEmpty = onEmpty;
  }

  private async processQueue(): Promise<void> {
    if (this.runningTasks >= this.maxConcurrentTasks || this.queue.length === 0) {
      return;
    }

    this.runningTasks++;
    const task = this.queue.shift();
    try {
      await task?.();
    } catch (error) {
      console.error("Error processing task:", error);
    } finally {
      this.runningTasks--;
      this.processQueue();
    }

    if (this.queue.length === 0 && this.runningTasks === 0) {
      this.onEmpty();
    }
  }

  enqueue(task: () => Promise<T>): void {
    this.queue.push(task);
    this.processQueue();
  }
}
