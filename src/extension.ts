import * as vscode from "vscode";
import { refresh } from "./extension/index.js";
import { SentryTreeDataProvider } from "./extension/sidebar.js";
import { SentryPuller } from "./api/index.js";

export function activate(context: vscode.ExtensionContext) {
  // Create logger and puller
  const logger = vscode.window.createOutputChannel("Sentry Issues", {
    log: true,
  });

  // Get configuration values
  const config = vscode.workspace.getConfiguration("sentry-issues");
  const apiKey = config.get<string>("apiKey") || "";
  const organization = config.get<string>("organization") || "";
  const url = config.get<string>("url") || "https://sentry.io";

  const puller = new SentryPuller({
    logger,
    api_key: apiKey,
    organization: organization,
    url: url,
  });

  // Create the tree data provider with puller
  const treeDataProvider = new SentryTreeDataProvider(puller);

  // Register the refresh command
  context.subscriptions.push(
    vscode.commands.registerCommand("sentry-issues.refresh", refresh)
  );

  // Create and register the tree view
  const treeView = vscode.window.createTreeView("sentryIssuesSidebar.sidebar", {
    treeDataProvider,
    showCollapseAll: true,
  });

  // Register the search command
  context.subscriptions.push(
    vscode.commands.registerCommand("sentry-issues.filter", async () => {
      const searchText = await vscode.window.showInputBox({
        placeHolder: "Filter projects...",
        prompt: "Enter text to filter projects",
      });

      if (searchText !== undefined) {
        treeDataProvider.updateFilter(searchText);
      }
    })
  );

  // Add the tree view and logger to subscriptions
  context.subscriptions.push(treeView, logger);
}

export function deactivate() {}
