import { SentryPuller } from "../../../api/index.js";
import { SentryEventT, SentryExceptionFrameT, SentryIssueT, SentryProjectT } from "../../../api/types.js";
import { SentryEventVar } from "./eventVar.js";
import { SentryItem } from "./generic.js";

export class SentryEventFrame extends SentryItem {
  constructor(
    private readonly puller: SentryPuller,
    public readonly frame: SentryExceptionFrameT,
    public readonly event: SentryEventT,
    public readonly issue: SentryIssueT,
    public readonly project: SentryProjectT
  ) {
    super({
      puller,
      name: frame.absPath,
      leaf: false,
    });
    // this.command = {
    //   command: "sentry-issues.showEvent",
    //   title: "Show Event Details",
    //   arguments: [
    //     {
    //       event: this.event,
    //       issue: this.issue,
    //       project: this.project,
    //     },
    //   ],
    // };
  }

  public async getChildrens(): Promise<SentryItem[]> {
    if (!this.frame.vars) return [];
    return Object.entries(this.frame.vars).map(
      ([key, value]) => new SentryEventVar(this.puller, key, value, this.frame, this.event, this.issue, this.project)
    );
  }
}
