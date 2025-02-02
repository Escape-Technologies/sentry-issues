import * as vscode from "vscode";
import { z, ZodType } from "zod";
import { getNextPage } from "./link";
import {
  SentryProjectSchema,
  SentryIssueSchema,
  SentryEventSchema,
} from "./types";
import { CredentialsProvider } from "../extension/creds";

export class SentryPuller {
  constructor(
    private readonly logger: vscode.LogOutputChannel,
    private readonly credProvider: CredentialsProvider
  ) {}

  // https://docs.sentry.io/api/ratelimits/
  private remaining: number | null = null;
  private reset: Date | null = null;

  private async fetch(url: string, init?: RequestInit): Promise<Response> {
    const creds = await this.credProvider.configure();
    if (!creds) {
      throw new Error("No credentials found");
    }
    if (
      this.remaining === 0 &&
      this.reset !== null &&
      this.reset > new Date()
    ) {
      const delay = this.reset.getTime() - new Date().getTime();
      this.logger.debug(`Rate limit reached, waiting ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    const response = await fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${creds.apiKey}`,
      },
    });
    this.remaining = Number(
      response.headers.get("X-Sentry-Rate-Limit-Remaining")
    );
    this.reset = new Date(
      Number(response.headers.get("X-Sentry-Rate-Limit-Reset")) * 1000
    );
    return response;
  }

  private async GET<S extends ZodType>(
    url: string,
    schema: S,
    old_res: Array<z.infer<S>> = []
  ): Promise<Array<z.infer<S>>> {
    const response = await this.fetch(url);
    this.logger.info(`GET ${url} : ${response.status}`);
    const next = getNextPage(response.headers.get("link"));
    const txt = await response.text();
    this.logger.info(JSON.stringify(JSON.parse(txt), null, 2));
    const data = [...old_res, schema.parse(JSON.parse(txt))];
    return next ? this.GET(next, schema, data) : data;
  }

  async GETProjects() {
    const creds = await this.credProvider.configure();
    if (!creds) {
      return [];
    }
    return (
      await this.GET(
        `${creds.url}/api/0/projects/`,
        z.array(SentryProjectSchema)
      )
    ).flat();
  }

  async GETIssues(projectId: string) {
    const creds = await this.credProvider.configure();
    if (!creds) {
      return [];
    }
    return (
      await this.GET(
        `${creds.url}/api/0/projects/${creds.organization}/${projectId}/issues/`,
        z.array(SentryIssueSchema)
      )
    ).flat();
  }

  async GETEvents(issueId: string) {
    const creds = await this.credProvider.configure();
    if (!creds) {
      return [];
    }
    return (
      await this.GET(
        `${creds.url}/api/0/issues/${issueId}/events/?full=true&environment=prod`,
        z.array(SentryEventSchema)
      )
    ).flat();
  }
}
