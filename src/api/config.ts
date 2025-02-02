import * as vscode from "vscode";
import { z, ZodType } from "zod";

const configurationSchema = z.object({
  api_key: z.string(),
  organization: z.string(),
  url: z.string(),
});

export const loadConfiguration = async (logger: vscode.LogOutputChannel) => {
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
