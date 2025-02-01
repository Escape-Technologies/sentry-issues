import * as vscode from "vscode";

export class SentryPuller {
  constructor(
    private readonly logger: vscode.LogOutputChannel,
    private readonly api_key: string,
    private readonly url: string
  ) {
    this.logger.info(`Using sentry to ${this.url}`);
  }
}
