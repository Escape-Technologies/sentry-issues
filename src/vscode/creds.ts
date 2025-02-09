import * as vscode from "vscode";

export type Credentials = {
  apiKey: string;
  organization: string;
  url: string;
};

export class CredentialsProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  public async reset(): Promise<void> {
    await this.context.secrets.delete("sentry-issues-viewer.apiKey");
    await this.context.secrets.delete("sentry-issues-viewer.organization");
    await this.context.secrets.delete("sentry-issues-viewer.url");
  }

  public async forceConfigure(): Promise<Credentials> {
    const config = vscode.workspace.getConfiguration("sentry-issues-viewer");

    let organization = config.get<string>("organization");
    if (!organization) {
      organization = await vscode.window.showInputBox({
        prompt: "Enter your Sentry organization slug",
        ignoreFocusOut: true,
      });
      if (!organization) throw new Error("Organization is required");
      else await config.update("organization", organization);
    }

    let apiKey = await this.context.secrets.get("sentry-issues-viewer.apiKey");
    if (!apiKey) {
      apiKey = await vscode.window.showInputBox({
        prompt: "Enter your Sentry API key",
        password: true,
        ignoreFocusOut: true,
      });
      if (!apiKey) throw new Error("API key is required");
      else await this.context.secrets.store("sentry-issues-viewer.apiKey", apiKey);
    }

    let url = config.get<string>("url") || "https://sentry.io";
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }

    return {
      apiKey,
      organization,
      url,
    };
  }

  public async configure(): Promise<Credentials | undefined> {
    let apiKey = await this.context.secrets.get("sentry-issues-viewer.apiKey");
    const config = vscode.workspace.getConfiguration("sentry-issues-viewer");
    let organization = config.get<string>("organization");
    if (!!apiKey && !!organization) {
      let url = config.get<string>("url") || "https://sentry.io";
      if (url.endsWith("/")) {
        url = url.slice(0, -1);
      }
      return {
        apiKey,
        organization,
        url,
      };
    }
  }
}
