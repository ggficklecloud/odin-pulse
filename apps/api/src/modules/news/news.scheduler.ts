import { env } from "../../config/env.js";
import { NewsService } from "./news.service.js";

export class NewsScheduler {
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly service: NewsService) {}

  start() {
    if (!env.SCHEDULE_ENABLED) {
      return;
    }

    void this.runLoop();
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private async runLoop() {
    await this.service.triggerRefresh("scheduled");
    this.timer = setTimeout(() => {
      void this.runLoop();
    }, env.FETCH_INTERVAL_MS);
  }
}
