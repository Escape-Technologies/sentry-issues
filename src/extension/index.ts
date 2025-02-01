import * as vscode from "vscode";
import { z } from "zod";
import { SentryPuller } from "../api";

export const refresh = async () => {
  const logger = vscode.window.createOutputChannel("Sentry Issues", {
    log: true,
  });
  logger.info("Loading Sentry issues...");
  try {
    await main(logger);
    logger.info("Sentry issues loaded");
  } catch (error) {
    logger.error("Error loading Sentry issues:", error);
    vscode.window.showErrorMessage(
      "Error loading Sentry issues, read the window logs for more informations."
    );
  }
};

const configurationSchema = z.object({
  api_key: z.string(),
  organization: z.string(),
  url: z.string(),
});

const loadConfiguration = async (logger: vscode.LogOutputChannel) => {
  let sentryIssuesUris = await vscode.workspace.findFiles(
    "._sentry-issues.json",
    undefined,
    1
  );
  if (!sentryIssuesUris) {
    vscode.window.showWarningMessage(
      "File `._sentry-issues.json` not found in the workspace."
    );
    return;
  }
  logger.info(`Parsing ${sentryIssuesUris[0].fsPath}`);
  const data = await vscode.workspace.fs.readFile(sentryIssuesUris[0]);
  return configurationSchema.parse(JSON.parse(data.toString()));
};

const main = async (logger: vscode.LogOutputChannel) => {
  const config = await loadConfiguration(logger);
  if (!config) {
    return;
  }
  const puller = new SentryPuller({
    logger,
    ...config,
  });
  //const projects = await puller.GETProjects();
  const projects = [{ slug: "oracle" }];
  const issues = await puller.GETIssues(projects[0].slug);
  logger.info(`Found ${issues.length} issues`);
  // const issues = [
  //   {
  //     id: "6263089229",
  //     title: "Failed to parse specification",
  //     culprit: "scanner.main in setup",
  //     permalink: "https://escapetech.sentry.io/issues/6263089229/",
  //   },
  // ];
};
