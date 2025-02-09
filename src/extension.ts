import * as vscode from "vscode";
import { CredentialsProvider } from "./vscode/creds";
import { EventDetailsViewProvider } from "./vscode/sidebar/eventDetails";
import { SentryEventData } from "./vscode/sidebar/items/event";
import { SentryTreeDataProvider } from "./vscode/sidebar/sidebar";

export function activate(context: vscode.ExtensionContext) {
  const logger = vscode.window.createOutputChannel("Sentry Issues", { log: true });
  const credProvider = new CredentialsProvider(context);
  const treeDataProvider = new SentryTreeDataProvider(logger, credProvider);
  const eventDetailsProvider = new EventDetailsViewProvider(context.extensionUri);

  const refresh = async () => {
    await credProvider.forceConfigure();
    treeDataProvider.cleanCache();
    await treeDataProvider.refresh();
  };
  const reset = async () => {
    await credProvider.reset();
    await refresh();
  };

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("sentryIssuesSidebar.sidebar", treeDataProvider),
    vscode.window.registerWebviewViewProvider("sentryIssuesSidebar.eventDetails", eventDetailsProvider),
    vscode.commands.registerCommand("sentry-issues-viewer.refresh", refresh),
    vscode.commands.registerCommand("sentry-issues-viewer.reset", reset),
    vscode.commands.registerCommand("sentry-issues-viewer.filter", async () => {
      const text = await vscode.window.showInputBox({
        prompt: "Filter projects",
        value: "",
      });
      treeDataProvider.updateFilter(text ?? "");
    }),
    vscode.commands.registerCommand("sentry-issues-viewer.showEvent", (event: SentryEventData) => {
      eventDetailsProvider.showEvent(event);
    })
  );
}

export function deactivate() {}
