import * as vscode from "vscode";
import { SentryEventT } from "../../api/types";

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

  private updateContent(event?: SentryEventT) {
    if (!this._view) {
      return;
    }

    const content = event
      ? `<pre>${JSON.stringify(event, null, 2)}</pre>`
      : '<div style="padding: 20px;">Select an event to view details</div>';

    this._view.webview.html = `
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
          ${content}
        </body>
      </html>
    `;
  }

  public showEvent(event: SentryEventT) {
    this.updateContent(event);
  }
}
