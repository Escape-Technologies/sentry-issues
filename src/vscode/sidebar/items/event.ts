import { SentryItem } from "./generic.js";
import { SentryPuller } from "../../../api/index.js";
import { SentryEventT } from "../../../api/types.js";

export class SentryEvent extends SentryItem {
  constructor(
    private readonly puller: SentryPuller,
    private readonly event: SentryEventT
  ) {
    super({
      puller,
      name: new Date(event.dateCreated).toLocaleString(),
      leaf: true,
    });
  }

  public async getChildrens(): Promise<SentryItem[]> {
    return [];
  }
}
