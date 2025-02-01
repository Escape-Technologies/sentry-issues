import * as vscode from "vscode";
import { z, ZodType } from "zod";
import { getNextPage } from "./link";

export class SentryPuller {
  private readonly logger: vscode.LogOutputChannel;
  private readonly api_key: string;
  private readonly org: string;
  private readonly url: string;

  constructor(data: {
    logger: vscode.LogOutputChannel;
    api_key: string;
    organization: string;
    url: string;
  }) {
    this.logger = data.logger;
    this.api_key = data.api_key;
    this.org = data.organization;
    this.url = data.url;

    if (this.url.endsWith("/")) {
      this.url = this.url.slice(0, -1);
    }
    this.logger.info(`Using sentry to ${this.url}`);
  }
  // https://docs.sentry.io/api/ratelimits/
  private remaining: number | null = null;
  private reset: Date | null = null;

  private async fetch(url: string, init?: RequestInit): Promise<Response> {
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
        Authorization: `Bearer ${this.api_key}`,
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
    return (
      await this.GET(
        `${this.url}/api/0/projects/`,
        z.array(
          z.object({
            slug: z.string(),
          })
        )
      )
    ).flat();
  }

  async GETIssues(id: string) {
    return (
      await this.GET(
        `${this.url}/api/0/projects/${this.org}/${id}/issues/`,
        z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            culprit: z.string(),
            permalink: z.string(),
          })
        )
      )
    ).flat();
  }
}
