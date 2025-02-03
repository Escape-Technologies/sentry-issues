import { SentryPuller } from "../../../api/index.js";
import { SentryEventT, SentryIssueT, SentryProjectT } from "../../../api/types.js";
import { SentryEventFrame } from "./eventFrame.js";
import { SentryItem } from "./generic.js";

export type SentryEventData = {
  event: SentryEventT;
  issue: SentryIssueT;
  project: SentryProjectT;
};

export class SentryEvent extends SentryItem {
  constructor(
    private readonly puller: SentryPuller,
    public readonly event: SentryEventT,
    public readonly issue: SentryIssueT,
    public readonly project: SentryProjectT
  ) {
    const environment = event.tags.find((tag) => tag.key === "environment")?.value || "unknown";
    super({
      puller,
      name: environment + " " + new Date(event.dateCreated).toLocaleString(),
      leaf: false,
    });
    this.command = {
      command: "sentry-issues-viewer.showEvent",
      title: "Show Event Details",
      arguments: [
        {
          event: this.event,
          issue: this.issue,
          project: this.project,
        },
      ],
    };
  }

  public async getChildrens(): Promise<SentryItem[]> {
    const exception = this.event.entries.find((entry) => entry.type === "exception")?.data.values;
    if (!exception) return [];
    const frames = exception.flatMap((entry) => entry.stacktrace.frames);
    return frames.map((frame) => new SentryEventFrame(this.puller, frame, this.event, this.issue, this.project));
  }
}
