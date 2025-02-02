import * as vscode from "vscode";
import { SentryPuller } from "../api/index.js";

/**
 * Represents a single item (either a Slug or an Issue) in the tree.
 */
class SentryItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly slug?: string,
    public readonly permalink?: string
  ) {
    super(label, collapsibleState);

    if (permalink) {
      this.command = {
        command: "vscode.open",
        title: "Open Issue",
        arguments: [vscode.Uri.parse(permalink)],
      };
    }
  }
}

/**
 * The TreeDataProvider that supplies Slugs and Issues.
 */
export class SentryTreeDataProvider
  implements vscode.TreeDataProvider<SentryItem>
{
  // Event emitter to trigger a refresh
  private _onDidChangeTreeData: vscode.EventEmitter<
    SentryItem | undefined | void
  > = new vscode.EventEmitter<SentryItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<SentryItem | undefined | void> =
    this._onDidChangeTreeData.event;

  // Add filter state
  private filterText: string = "";

  constructor(
    private readonly getPuller: () => Promise<SentryPuller | undefined>
  ) {}

  // Add method to update filter
  public updateFilter(text: string) {
    this.filterText = text.toLowerCase();
    this.refresh();
  }

  /**
   * Refresh the tree (e.g., when the user clicks a Refresh button).
   */
  async refresh(): Promise<void> {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Returns the children of a given element, or the root children if no element.
   */
  public async getChildren(element?: SentryItem): Promise<SentryItem[]> {
    try {
      const puller = await this.getPuller();
      if (!puller) {
        return [];
      }

      if (!element) {
        // Root level - fetch projects
        const projects = await puller.GETProjects();
        return projects
          .filter(
            (project) =>
              this.filterText === "" ||
              project.slug.toLowerCase().includes(this.filterText)
          )
          .map(
            (project) =>
              new SentryItem(
                project.slug,
                vscode.TreeItemCollapsibleState.Collapsed,
                project.slug
              )
          );
      } else {
        // Issue level - fetch issues for the project
        const issues = await puller.GETIssues(element.slug!);
        return issues.map(
          (issue) =>
            new SentryItem(
              `${issue.title} (${issue.culprit})`,
              vscode.TreeItemCollapsibleState.None,
              undefined,
              issue.permalink
            )
        );
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to fetch Sentry data: ${error}`);
      return [];
    }
  }

  /**
   * Returns how the tree should present the element.
   */
  public getTreeItem(element: SentryItem): vscode.TreeItem {
    return element;
  }
}
