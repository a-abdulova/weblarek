import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';

export abstract class Card<T> extends Component<T> {
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement | null;

  protected constructor(container: HTMLElement) {
    super(container);

    this.titleElement = ensureElement<HTMLElement>('.card__title', this.container);
    this.priceElement = this.container.querySelector('.card__price');
  }

  set title(value: string) {
    this.titleElement.textContent = value;
  }

  set price(value: number | null) {
    if (!this.priceElement) return;
    this.priceElement.textContent =
      value === null ? 'Бесценно' : `${value} синапсов`;
  }
}