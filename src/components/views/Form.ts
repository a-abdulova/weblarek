import { ensureElement } from "../../utils/utils";
import { IFormState } from "../../types";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";

export abstract class Form<T> extends Component<T & IFormState> {
  protected submitButton: HTMLButtonElement;
  protected errorsElement: HTMLElement;
  protected formElement: HTMLFormElement;

  protected constructor(
    protected events: IEvents,
    container: HTMLFormElement,
  ) {
    super(container);

    this.formElement = container;
    this.submitButton = ensureElement<HTMLButtonElement>(
      'button[type="submit"]',
      this.container,
    );
    this.errorsElement = ensureElement<HTMLElement>(
      ".form__errors",
      this.container,
    );

    this.formElement.addEventListener("input", () => {
      const formData = new FormData(this.formElement);
      const data = Object.fromEntries(formData.entries());
      this.events.emit(`${this.formElement.name}:change`, data);
    });

    this.formElement.addEventListener("submit", (event) => {
      event.preventDefault();
      this.events.emit(`${this.formElement.name}:submit`);
    });
  }

  set valid(value: boolean) {
    this.submitButton.disabled = !value;
  }

  set errors(value: string) {
    this.errorsElement.textContent = value;
  }
}
