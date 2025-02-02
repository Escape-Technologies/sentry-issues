import * as vscode from "vscode";
import { SentryPuller } from "../../api/index";
import { SentryItem } from "./items/generic";
import { CredentialsProvider } from "../creds";
import { SentryProject } from "./items/project";
import { SentryProjectT } from "../../api/types";

export class SentryTreeDataProvider implements vscode.TreeDataProvider<SentryItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<SentryItem | undefined | void> = new vscode.EventEmitter<
    SentryItem | undefined | void
  >();
  readonly onDidChangeTreeData: vscode.Event<SentryItem | undefined | void> = this._onDidChangeTreeData.event;

  public getTreeItem(element: SentryItem): vscode.TreeItem {
    return element;
  }

  private readonly puller: SentryPuller;
  constructor(
    private readonly logger: vscode.LogOutputChannel,
    private readonly credProvider: CredentialsProvider
  ) {
    this.puller = new SentryPuller(this.logger, this.credProvider);
  }

  async refresh(): Promise<void> {
    this._onDidChangeTreeData.fire();
  }

  public async getChildren(element?: SentryItem): Promise<SentryItem[]> {
    if (!this.puller) {
      return [];
    }
    try {
      return element ? element.getChildrens() : this.getRootItems();
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to fetch Sentry data: ${error}`);
      return [];
    }
  }

  private projects: SentryProjectT[] = [];
  public cleanCache() {
    this.projects = [];
  }

  public async getRootItems(): Promise<SentryItem[]> {
    if (this.projects.length === 0) {
      this.projects = await this.puller.GETProjects();
    }
    return this.projects
      .filter((project) => project.slug.includes(this.filterText.toLowerCase()))
      .map((project) => new SentryProject(this.puller, project));
  }

  private filterText: string = "";
  public updateFilter(text: string) {
    this.filterText = text.toLowerCase();
    this.refresh();
  }
}
