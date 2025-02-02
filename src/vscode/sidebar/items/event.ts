import { SentryItem } from "./generic.js";
import { SentryPuller } from "../../../api/index.js";
import { SentryEventT, SentryIssueT, SentryProjectT } from "../../../api/types.js";

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
    super({
      puller,
      name: new Date(event.dateCreated).toLocaleString(),
      leaf: true,
    });
    this.command = {
      command: "sentry-issues.showEvent",
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
    return [];
  }
}
