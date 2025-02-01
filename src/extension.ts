import * as vscode from "vscode";
import { refresh } from "./extension/index.js";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("sentry-issues.refresh",refresh);
  context.subscriptions.push(disposable);
}

export function deactivate() {}
