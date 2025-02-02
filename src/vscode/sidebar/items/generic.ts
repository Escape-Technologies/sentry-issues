import * as vscode from "vscode";
import { SentryPuller } from "../../../api/index.js";

export type SentryItemData = {
  puller: SentryPuller;
  name: string;
  leaf?: boolean;
};

export abstract class SentryItem extends vscode.TreeItem {
  constructor(data: SentryItemData) {
    super(data.name, data.leaf ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
  }

  abstract getChildrens(): Promise<SentryItem[]>;
}
