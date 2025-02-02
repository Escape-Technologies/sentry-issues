import * as vscode from "vscode";

export type Credentials = {
  apiKey: string;
  organization: string;
  url: string;
};

export class CredentialsProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  public async reset(): Promise<void> {
    await this.context.secrets.delete("sentry.apiKey");
    await this.context.secrets.delete("sentry.organization");
    await this.context.secrets.delete("sentry.url");
  }

  public async forceConfigure(): Promise<Credentials> {
    let apiKey = await this.context.secrets.get("sentry.apiKey");
    const config = vscode.workspace.getConfiguration("sentry-issues");
    let organization = config.get<string>("organization");

    if (!organization) {
      organization = await vscode.window.showInputBox({
        prompt: "Enter your Sentry organization slug",
        ignoreFocusOut: true,
      });
      throw new Error("Organization is required");
    }

    if (!apiKey) {
      apiKey = await vscode.window.showInputBox({
        prompt: "Enter your Sentry API key",
        password: true,
        ignoreFocusOut: true,
      });
      throw new Error("API key is required");
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
    let apiKey = await this.context.secrets.get("sentry.apiKey");
    const config = vscode.workspace.getConfiguration("sentry-issues");
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
