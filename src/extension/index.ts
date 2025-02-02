import * as vscode from "vscode";
import { SentryPuller } from "../api";
import { loadConfiguration } from "../api/config";

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
