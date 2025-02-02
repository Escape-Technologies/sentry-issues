import * as vscode from "vscode";
import { SentryPuller } from "../api/index";
import { SentryItem, SentryItemData } from "../vscode/sentryItem";
import { CredentialsProvider } from "./creds";

class ExampleSentryItem extends SentryItem {
  private readonly deep: number;
  constructor(data: SentryItemData & { deep?: number }) {
    super(data);
    this.deep = data.deep || 10;
  }

  public async getChildrens(): Promise<SentryItem[]> {
    return new Array(this.deep).fill(0).map(
      (_, i) =>
        new ExampleSentryItem({
          ...this.data,
          name: `${this.data.name} ${i}`,
          deep: this.deep - 1,
          leaf: this.deep === 1,
        })
    );
  }
}

export class SentryTreeDataProvider
  implements vscode.TreeDataProvider<SentryItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    SentryItem | undefined | void
  > = new vscode.EventEmitter<SentryItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<SentryItem | undefined | void> =
    this._onDidChangeTreeData.event;

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

  public async getRootItems(): Promise<SentryItem[]> {
    if (!this.puller) {
      return [];
    }
    return [
      new ExampleSentryItem({
        name: "Example",
        puller: this.puller,
      }),
    ];
  }

  private filterText: string = "";
  public updateFilter(text: string) {
    this.filterText = text.toLowerCase();
    this.refresh();
  }
}
