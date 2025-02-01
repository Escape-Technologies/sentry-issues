import * as vscode from 'vscode';

export const refresh = async () => {
  const logger = vscode.window.createOutputChannel("Sentry Issues", {log: true});
  logger.info("Loading Sentry issues...");
  try {
    await main();
    logger.info("Sentry issues loaded");
  } catch (error) {
    logger.error("Error loading Sentry issues:", error);
    vscode.window.showErrorMessage("Error loading Sentry issues, read the window logs for more informations.");
  }
};          

const loadConfiguration = async () => {
  let sentryIssuesUris = await vscode.workspace.findFiles('._sentry-issues.json', undefined, 1);
  if (!sentryIssuesUris) {
    vscode.window.showWarningMessage("File `._sentry-issues.json` not found in the workspace.");
    return;
  }
  console.log(`Parsing ${sentryIssuesUris[0].fsPath}`);
  return JSON.parse((await vscode.workspace.fs.readFile(sentryIssuesUris[0])).toString());
};

const main = async () => {
  const config = await loadConfiguration();
  console.log(config);
  throw new Error('Not implemented');
};
