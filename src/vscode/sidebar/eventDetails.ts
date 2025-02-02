import * as vscode from "vscode";
import { SentryEventData } from "./items/event";

export class EventDetailsViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void | Thenable<void> {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    this.updateContent();
  }

  private updateContent(data?: SentryEventData) {
    if (!this._view) {
      return;
    }
    this._view.webview.html = /*html*/ `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: var(--vscode-font-family); }
            pre { white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          ${data ? this.display(data) : "Select an event to view details"}
        </body>
      </html>
    `;
  }

  private display(data: SentryEventData): string {
    const environment = data.event.tags.find((tag) => tag.key === "environment")?.value || "unknown";

    const fullIssues = data.event.entries
      .filter((entry) => entry.type === "exception")
      .flatMap((entry) => entry.data.values)
      .flatMap((value) => /*html*/ `<pre>${value.value}</pre>`);

    const li = [
      /*html*/ `<a href="${data.issue.permalink + "events/" + data.event.id}" target="_blank">View it on Sentry</a>`,
    ];
    const kafkaUrl = data.event.tags.find((tag) => tag.key === "kafka.url")?.value;
    if (kafkaUrl) {
      li.push(/*html*/ `<a href="${kafkaUrl}" target="_blank">View it on Kafka</a>`);
    }
    const release = data.event.tags.find((tag) => tag.key === "release")?.value;
    if (release) {
      li.push(/*html*/ `Release: ${release}`);
    }

    return /*html*/ `
        <h1>${data.issue.title + " - " + environment}</h1>
        ${fullIssues.join("\n")}
        <ul>
            ${li.map((l) => `<li>${l}</li>`).join("\n")}
        </ul>
    `;
  }

  public showEvent(data: SentryEventData) {
    this.updateContent(data);
  }
}
