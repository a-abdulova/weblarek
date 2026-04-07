import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";
import { IModalView } from "../../types";

export class Modal extends Component<IModalView> {
  protected closeButton: HTMLButtonElement;
  protected contentElement: HTMLElement;

  constructor(
    protected events: IEvents,
    container: HTMLElement,
  ) {
    super(container);

    this.closeButton = ensureElement<HTMLButtonElement>(
      ".modal__close",
      this.container,
    );
    this.contentElement = ensureElement<HTMLElement>(
      ".modal__content",
      this.container,
    );

    this.closeButton.addEventListener("click", () => this.close());

    this.container.addEventListener("click", (event) => {
      if (event.target === this.container) {
        this.close();
      }
    });
  }

  set content(value: HTMLElement) {
    this.contentElement.replaceChildren(value);
  }

  open(): void {
    this.container.classList.add("modal_active");
  }

  close(): void {
    this.container.classList.remove("modal_active");
    this.contentElement.replaceChildren();
  }

  render(data: IModalView): HTMLElement {
    super.render(data);
    this.open();
    return this.container;
  }
}
