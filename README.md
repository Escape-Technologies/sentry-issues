# Sentry Issues VSCode Extension

This extension allows you to view Sentry issues in VSCode.
You can then explore the issue events and fix it while beeing aware of the variables that raised the issue.

## Features

- List your Sentry projects
- List your Sentry issues
- Filter issues by project
- Load issue events
- Show stack trace
- Show variables values

## Extension Settings

### Get an API Key

To setup the extension, you will need to set your Sentry API key (promted and securely stored).

To get an API key, you can go to `/settings/account/api/auth-tokens/` on your sentry instance.
For example on sentry.io, you need to go to [https://sentry.io/settings/account/api/auth-tokens/](https://sentry.io/settings/account/api/auth-tokens/).

Here, create a new token. The extension is read only, so the following permissions are required:

- `organization:read`
- `project:read`
- `event:read`

Once created, you can click on the key button on the Sentry Issue pannel to set your API key.

### Other options

You also have the folowing parameters:

- `sentry-issues-viewer.organization`: Sentry Organization Slug.
- `sentry-issues-viewer.url`: Sentry Instance URL (default: `https://sentry.io`).

## Release Notes

### 0.0.1

Initial release of the extension.

### 0.0.2

- Cleanup package.json
- Add icon
- Add bugs url
- Add repository url

### 0.0.3

- Add `Get an API Key` documentation

### 0.0.4

- Allow lower vscode version
