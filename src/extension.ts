import * as vscode from "vscode";
import { SentryTreeDataProvider } from "./vscode/sidebar/sidebar.js";
import { CredentialsProvider } from "./extension/creds.js";

export async function activate(context: vscode.ExtensionContext) {
  const logger = vscode.window.createOutputChannel("Sentry Issues", {
    log: true,
  });
  const credProvider = new CredentialsProvider(context);
  const treeDataProvider = new SentryTreeDataProvider(logger, credProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand("sentry-issues.reset", async () => {
      await credProvider.reset();
      await credProvider.forceConfigure();
      treeDataProvider.cleanCache();
      treeDataProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sentry-issues.refresh", async () => {
      await credProvider.forceConfigure();
      treeDataProvider.cleanCache();
      treeDataProvider.refresh();
    })
  );

  const treeView = vscode.window.createTreeView("sentryIssuesSidebar.sidebar", {
    treeDataProvider,
    showCollapseAll: true,
  });

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

  context.subscriptions.push(treeView, logger);
}

export function deactivate() {}
