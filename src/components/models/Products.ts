import { IProduct } from "../../types";
import { IEvents } from "../base/Events";

export class Products {
  private items: IProduct[] = [];
  private selected: IProduct | null = null;

  constructor(private events: IEvents) {}

  setItems(items: IProduct[]): void {
    this.items = items;
    this.events.emit("products:changed", { items: this.items });
  }

  getItems(): IProduct[] {
    return this.items;
  }

  getById(id: string): IProduct | undefined {
    return this.items.find((item) => item.id === id);
  }

  setSelected(product: IProduct | null): void {
    this.selected = product;
    this.events.emit("product:selected", this.selected ?? undefined);
  }

  getSelected(): IProduct | null {
    return this.selected;
  }
}
