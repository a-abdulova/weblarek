import { IProduct } from "../../types";
import { IEvents } from "../base/Events";

export class Basket {
  private items: IProduct[] = [];

  constructor(private events: IEvents) {}

  getItems(): IProduct[] {
    return this.items;
  }

  add(product: IProduct): void {
    if (!this.has(product.id)) {
      this.items.push(product);
      this.events.emit("basket:changed", { items: this.items });
    }
  }

  remove(id: string): void {
    this.items = this.items.filter((item) => item.id !== id);
    this.events.emit("basket:changed", { items: this.items });
  }

  clear(): void {
    this.items = [];
    this.events.emit("basket:changed", { items: this.items });
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  }

  getCount(): number {
    return this.items.length;
  }

  has(id: string): boolean {
    return this.items.some((item) => item.id === id);
  }
}
