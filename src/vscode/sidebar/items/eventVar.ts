import { SentryPuller } from "../../../api/index.js";
import {
  SentryEventT,
  SentryExceptionFrameT,
  SentryExceptionFrameVarsT,
  SentryIssueT,
  SentryProjectT,
} from "../../../api/types.js";
import { SentryItem } from "./generic.js";

export class SentryEventVar extends SentryItem {
  constructor(
    private readonly puller: SentryPuller,
    public readonly name: string,
    public readonly value: SentryExceptionFrameVarsT["key"],
    public readonly frame: SentryExceptionFrameT,
    public readonly event: SentryEventT,
    public readonly issue: SentryIssueT,
    public readonly project: SentryProjectT
  ) {
    super({
      puller,
      name,
      leaf: true,
    });
    this.description = typeof value === "string" ? value : JSON.stringify(value);
  }

  public async getChildrens(): Promise<SentryItem[]> {
    return [];
  }
}
