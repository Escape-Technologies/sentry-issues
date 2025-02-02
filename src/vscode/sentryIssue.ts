import * as vscode from "vscode";
import { SentryItem, SentryItemData } from "./sentryItem";
import { SentryPuller } from "../api/index.js";

export class SentryIssue extends SentryItem {
  constructor(private readonly data: SentryItemData & ) {}

  public async getChildren(_puller: SentryPuller): Promise<SentryItem[]> {
    return Promise.resolve([]);
  }

  public toTreeItem(): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(
      this.name,
      vscode.TreeItemCollapsibleState.None
    );
    treeItem.tooltip = "TODO";
    treeItem.iconPath = new vscode.ThemeIcon(
      this.level === "error" ? "error" : "warning"
    );
    return treeItem;
  }
}
