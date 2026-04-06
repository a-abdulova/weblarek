import { ensureElement } from "../../utils/utils";
import { IBasketView } from "../../types";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";

export class BasketView extends Component<IBasketView> {
  protected listElement: HTMLElement;
  protected buttonElement: HTMLButtonElement;
  protected priceElement: HTMLElement;

  constructor(
    protected events: IEvents,
    container: HTMLElement,
  ) {
    super(container);

    this.listElement = ensureElement<HTMLElement>(
      ".basket__list",
      this.container,
    );
    this.buttonElement = ensureElement<HTMLButtonElement>(
      ".basket__button",
      this.container,
    );
    this.priceElement = ensureElement<HTMLElement>(
      ".basket__price",
      this.container,
    );

    this.buttonElement.addEventListener("click", () => {
      this.events.emit("order:open");
    });
  }

  set items(items: HTMLElement[]) {
    if (items.length) {
      this.listElement.replaceChildren(...items);
    } else {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "Корзина пуста";
      this.listElement.replaceChildren(emptyMessage);
    }

    this.buttonElement.disabled = items.length === 0;
  }

  set total(value: number) {
    this.priceElement.textContent = `${value} синапсов`;
  }
}
