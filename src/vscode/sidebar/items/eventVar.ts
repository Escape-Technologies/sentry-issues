import * as vscode from "vscode";
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
    public readonly value: SentryExceptionFrameVarsT,
    public readonly frame: SentryExceptionFrameT,
    public readonly event: SentryEventT,
    public readonly issue: SentryIssueT,
    public readonly project: SentryProjectT
  ) {
    super({
      puller,
      name,
      leaf: typeof value === "string",
    });
    const varTxt = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    if (varTxt.split("\n").length === 1) this.description = varTxt;
    else this.tooltip = new vscode.MarkdownString("```json\n" + varTxt + "\n```");
  }

  public async getChildrens(): Promise<SentryItem[]> {
    if (typeof this.value === "string") return [];
    if (Array.isArray(this.value))
      return this.value.map(
        (v, i) => new SentryEventVar(this.puller, `${i}`, v, this.frame, this.event, this.issue, this.project)
      );
    return Object.entries(this.value).map(
      ([key, v]) => new SentryEventVar(this.puller, key, v, this.frame, this.event, this.issue, this.project)
    );
  }
}
