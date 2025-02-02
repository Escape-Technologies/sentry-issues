import * as vscode from "vscode";
import { SentryItem } from "./sentryItem";
import { SentryPuller } from "../api/index.js";
import { SentryIssue } from "./sentryIssue";

export class SentryProject extends SentryItem {
  private platform: string;
  private isBookmarked: boolean;

  constructor(data: SentryProjectData) {
    super(data);
    this.platform = data.platform;
    this.isBookmarked = false;
  }

  public getPlatform(): string {
    return this.platform;
  }

  public toggleBookmark(): void {
    this.isBookmarked = !this.isBookmarked;
  }

  public getType(): string {
    return "project";
  }

  public async getChildren(puller: SentryPuller): Promise<SentryItem[]> {
    try {
      if (!this.slug) {
        return [];
      }
      const issues = await puller.GETIssues(this.slug);
      if (!Array.isArray(issues)) {
        throw new Error("Invalid issues response");
      }

      return issues
        .filter(
          (issue): issue is SentryIssueResponse =>
            typeof issue === "object" &&
            issue !== null &&
            "id" in issue &&
            "title" in issue &&
            "permalink" in issue
        )
        .map(
          (issue) =>
            new SentryIssue({
              id: issue.id,
              name: issue.title,
              organization: this.organization,
              level: issue.level || "error",
              status: issue.status || "unresolved",
              permalink: issue.permalink,
              events: issue.count || 0,
              users: issue.userCount || 0,
              collapsibleState: vscode.TreeItemCollapsibleState.None,
            })
        );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to fetch issues for project ${this.name}: ${error}`
      );
      return [];
    }
  }

  public toTreeItem(): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(
      this.name,
      vscode.TreeItemCollapsibleState.Collapsed
    );
    treeItem.tooltip = `${this.name} (${this.platform})`;
    treeItem.iconPath = new vscode.ThemeIcon("project");
    return treeItem;
  }
}
