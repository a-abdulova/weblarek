import { ensureElement } from "../../utils/utils";
import { IOrderFormView, TPayment } from "../../types";
import { Form } from "./Form";
import { IEvents } from "../base/Events";

export class OrderForm extends Form<IOrderFormView> {
  protected cardButton: HTMLButtonElement;
  protected cashButton: HTMLButtonElement;
  protected addressInput: HTMLInputElement;

  constructor(events: IEvents, container: HTMLFormElement) {
    super(events, container);

    this.cardButton = ensureElement<HTMLButtonElement>(
      'button[name="card"]',
      this.container,
    );
    this.cashButton = ensureElement<HTMLButtonElement>(
      'button[name="cash"]',
      this.container,
    );
    this.addressInput = ensureElement<HTMLInputElement>(
      'input[name="address"]',
      this.container,
    );

    this.cardButton.addEventListener("click", () => {
      this.events.emit("payment:change", { payment: "card" });
    });

    this.cashButton.addEventListener("click", () => {
      this.events.emit("payment:change", { payment: "cash" });
    });
  }

  set payment(value: TPayment | null) {
    this.cardButton.classList.toggle("button_alt-active", value === "card");
    this.cashButton.classList.toggle("button_alt-active", value === "cash");
  }

  set address(value: string) {
    this.addressInput.value = value;
  }
}
