import { SentryItem, SentryItemData } from "../../sentryItem";

export class ExampleSentryItem extends SentryItem {
  private readonly deep: number;
  constructor(data: SentryItemData & { deep?: number }) {
    super(data);
    this.deep = data.deep || 10;
  }

  public async getChildrens(): Promise<SentryItem[]> {
    return new Array(this.deep).fill(0).map(
      (_, i) =>
        new ExampleSentryItem({
          ...this.data,
          name: `${this.data.name} ${i}`,
          deep: this.deep - 1,
          leaf: this.deep === 1,
        })
    );
  }
}
