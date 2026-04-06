import { Component } from "../base/Component";
import { IGalleryView } from "../../types";

export class Gallery extends Component<IGalleryView> {
  set catalog(items: HTMLElement[]) {
    this.container.replaceChildren(...items);
  }
}
