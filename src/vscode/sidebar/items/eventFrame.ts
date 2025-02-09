import * as vscode from "vscode";
import { SentryPuller } from "../../../api/index.js";
import { SentryEventT, SentryExceptionFrameT, SentryIssueT, SentryProjectT } from "../../../api/types.js";
import { SentryEventVar } from "./eventVar.js";
import { SentryItem } from "./generic.js";

const resolveLocalPath = async (absPath: string): Promise<vscode.Uri | undefined> => {
  const components = absPath.split("/").filter(Boolean);
  for (let i = 0; i < components.length; i++) {
    const searchPath = components.slice(components.length - 1 - i).join("/");
    const files = await vscode.workspace.findFiles(`**/${searchPath}`);
    if (files.length === 0) {
      return undefined;
    } else if (files.length === 1) {
      return files[0];
    }
  }
  return undefined;
};

export class SentryEventFrame extends SentryItem {
  constructor(
    private readonly puller: SentryPuller,
    public readonly frame: SentryExceptionFrameT,
    public readonly event: SentryEventT,
    public readonly issue: SentryIssueT,
    public readonly project: SentryProjectT,
    public readonly localPath: vscode.Uri | undefined,
    name: string
  ) {
    super({
      puller,
      name,
      leaf: false,
    });
    if (this.localPath) {
      this.command = {
        command: "vscode.open",
        title: "Open File",
        arguments: [this.localPath],
      };
    }
  }

  public static async new(
    puller: SentryPuller,
    frame: SentryExceptionFrameT,
    event: SentryEventT,
    issue: SentryIssueT,
    project: SentryProjectT
  ): Promise<SentryEventFrame> {
    let localPath = await resolveLocalPath(frame.absPath);
    let name = `${frame.inApp ? "In App" : "Out of App"} ${frame.absPath} (${frame.lineNo})`;
    if (localPath) {
      name = localPath.path;
      if (frame.lineNo) {
        localPath = localPath.with({ fragment: frame.lineNo.toString() });
      }
    }
    return new SentryEventFrame(puller, frame, event, issue, project, localPath, name);
  }

  public async getChildrens(): Promise<SentryItem[]> {
    if (!this.frame.vars) return [];
    return Object.entries(this.frame.vars).map(
      ([key, value]) => new SentryEventVar(this.puller, key, value, this.frame, this.event, this.issue, this.project)
    );
  }
}
