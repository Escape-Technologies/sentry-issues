import { SentryItem } from "../../sentryItem.js";
import { SentryPuller } from "../../../api/index.js";
import { SentryIssueT } from "../../../api/types.js";

export class SentryIssue extends SentryItem {
  constructor(
    private readonly puller: SentryPuller,
    private readonly issue: SentryIssueT
  ) {
    super({
      puller,
      name: issue.title,
      leaf: true,
    });
  }

  public async getChildrens(): Promise<SentryItem[]> {
    return [];
  }
}
