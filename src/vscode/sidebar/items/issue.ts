import { SentryItem } from "./generic.js";
import { SentryPuller } from "../../../api/index.js";
import { SentryIssueT, SentryProjectT } from "../../../api/types.js";
import { SentryEvent } from "./event.js";

export class SentryIssue extends SentryItem {
  constructor(
    private readonly puller: SentryPuller,
    public readonly issue: SentryIssueT,
    public readonly project: SentryProjectT
  ) {
    super({
      puller,
      name: issue.title,
      leaf: false,
    });
  }

  public async getChildrens(): Promise<SentryItem[]> {
    const events = await this.puller.GETEvents(this.issue.id);
    return events.map((event) => new SentryEvent(this.puller, event, this.issue, this.project));
  }
}
