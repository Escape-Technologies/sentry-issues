import * as vscode from "vscode";
import { SentryTreeDataProvider } from "./extension/sidebar.js";
import { SentryPuller } from "./api/index.js";

async function getApiKey(
  context: vscode.ExtensionContext
): Promise<string | undefined> {
  // Try to get from secure storage first
  let apiKey = await context.secrets.get("sentry.apiKey");

  if (!apiKey) {
    // If not found, prompt the user
    apiKey = await vscode.window.showInputBox({
      prompt: "Enter your Sentry API key",
      password: true,
      ignoreFocusOut: true,
    });

    if (apiKey) {
      await context.secrets.store("sentry.apiKey", apiKey);
    }
  }

  return apiKey;
}

async function getOrganization(): Promise<string | undefined> {
  const config = vscode.workspace.getConfiguration("sentry-issues");
  let organization = config.get<string>("organization");

  if (!organization) {
    organization = await vscode.window.showInputBox({
      prompt: "Enter your Sentry organization slug",
      ignoreFocusOut: true,
    });

    if (organization) {
      // Save to workspace settings
      await config.update("organization", organization, true);
    }
  }

  return organization;
}

export async function activate(context: vscode.ExtensionContext) {
  const logger = vscode.window.createOutputChannel("Sentry Issues", {
    log: true,
  });

  // Create puller with lazy initialization
  let puller: SentryPuller | undefined;

  async function ensurePuller(): Promise<SentryPuller | undefined> {
    if (!puller) {
      const apiKey = await getApiKey(context);
      if (!apiKey) {
        vscode.window.showErrorMessage("Sentry API key is required");
        return undefined;
      }

      const organization = await getOrganization();
      if (!organization) {
        vscode.window.showErrorMessage("Sentry organization slug is required");
        return undefined;
      }

      const config = vscode.workspace.getConfiguration("sentry-issues");
      const url = config.get<string>("url") || "https://sentry.io";

      puller = new SentryPuller({
        logger,
        api_key: apiKey,
        organization: organization,
        url: url,
      });
    }
    return puller;
  }

  const treeDataProvider = new SentryTreeDataProvider(ensurePuller);

  // Register command to reset API key
  context.subscriptions.push(
    vscode.commands.registerCommand("sentry-issues.resetApiKey", async () => {
      await context.secrets.delete("sentry.apiKey");
      puller = undefined; // Reset the puller
      treeDataProvider.refresh();
    })
  );

  // Register command to reset organization
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "sentry-issues.resetOrganization",
      async () => {
        const config = vscode.workspace.getConfiguration("sentry-issues");
        await config.update("organization", undefined, true);
        puller = undefined;
        treeDataProvider.refresh();
      }
    )
  );

  // Register the refresh command
  context.subscriptions.push(
    vscode.commands.registerCommand("sentry-issues.refresh", async () => {
      await ensurePuller();
      treeDataProvider.refresh();
    })
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

  context.subscriptions.push(treeView, logger);
}

export function deactivate() {}
