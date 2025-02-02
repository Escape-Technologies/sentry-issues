import { SentryItem } from "./generic.js";
import { SentryPuller } from "../../../api/index.js";
import { SentryIssue } from "./issue.js";
import { SentryProjectT } from "../../../api/types.js";

export class SentryProject extends SentryItem {
  constructor(
    private readonly puller: SentryPuller,
    public readonly project: SentryProjectT
  ) {
    super({
      puller,
      name: project.slug,
      leaf: false,
    });
  }

  public async getChildrens(): Promise<SentryItem[]> {
    const issues = await this.puller.GETIssues(this.project.slug);
    return issues.map((issue) => new SentryIssue(this.puller, issue, this.project));
  }
}
