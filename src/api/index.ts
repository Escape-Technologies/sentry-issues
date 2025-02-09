import * as vscode from "vscode";
import { z, ZodType } from "zod";
import { CredentialsProvider } from "../vscode/creds";
import { getNextPage } from "./link";
import { SentryEventSchema, SentryIssueSchema, SentryProjectSchema } from "./types";

export class SentryPuller {
  constructor(
    public readonly logger: vscode.LogOutputChannel,
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
    if (this.remaining === 0 && this.reset !== null && this.reset > new Date()) {
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
    this.remaining = Number(response.headers.get("X-Sentry-Rate-Limit-Remaining"));
    this.reset = new Date(Number(response.headers.get("X-Sentry-Rate-Limit-Reset")) * 1000);
    return response;
  }

  private async GET<S extends ZodType>(
    url: string,
    schema: S,
    max_res: number = 0,
    data: Array<z.infer<S>> = []
  ): Promise<Array<z.infer<S>>> {
    const response = await this.fetch(url);
    this.logger.info(`GET ${url} : ${response.status}`);
    const next = getNextPage(response.headers.get("link"));
    const txt = await response.text();
    for (const obj of JSON.parse(txt)) {
      const parsed = schema.safeParse(obj);
      if (parsed.success) data.push(parsed.data);
      else {
        this.logger.error(`Failed to parse ${obj} : ${parsed.error}`);
      }
      if (max_res !== 0 && data.length >= max_res) return data;
    }
    return next ? this.GET(next, schema, max_res, data) : data;
  }

  async GETProjects() {
    const creds = await this.credProvider.configure();
    if (!creds) {
      return [];
    }
    return await this.GET(`${creds.url}/api/0/projects/`, SentryProjectSchema);
  }

  async GETIssues(projectId: string) {
    const creds = await this.credProvider.configure();
    if (!creds) {
      return [];
    }
    return await this.GET(`${creds.url}/api/0/projects/${creds.organization}/${projectId}/issues/`, SentryIssueSchema);
  }

  async GETEvents(issueId: string) {
    const creds = await this.credProvider.configure();
    if (!creds) {
      return [];
    }
    return await this.GET(
      `${creds.url}/api/0/issues/${issueId}/events/?full=true&environment=prod`,
      SentryEventSchema,
      10
    );
  }
}
