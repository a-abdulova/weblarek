import "./scss/styles.scss";

import { Api } from "./components/base/Api";
import { EventEmitter } from "./components/base/Events";

import { Products } from "./components/models/Products";
import { Basket } from "./components/models/Basket";
import { Buyer } from "./components/models/Buyer";

import { WebLarekApi } from "./components/WebLarekApi";

import { Header } from "./components/views/Header";
import { Gallery } from "./components/views/Gallery";
import { Modal } from "./components/views/Modal";
import { CardCatalog } from "./components/views/CardCatalog";
import { CardPreview } from "./components/views/CardPreview";
import { CardBasket } from "./components/views/CardBasket";
import { BasketView } from "./components/views/BasketView";
import { OrderForm } from "./components/views/OrderForm";
import { ContactsForm } from "./components/views/ContactsForm";
import { Success } from "./components/views/Success";

import { API_URL } from "./utils/constants";
import { cloneTemplate, ensureElement } from "./utils/utils";
import { IBuyer, IOrderRequest, IProduct } from "./types";

// Базовые объекты

const events = new EventEmitter();

const apiClient = new Api(API_URL);
const webLarekApi = new WebLarekApi(apiClient);

// Модели

const productsModel = new Products(events);
const basketModel = new Basket(events);
const buyerModel = new Buyer(events);

// View

const header = new Header(events, ensureElement<HTMLElement>(".header"));
const gallery = new Gallery(ensureElement<HTMLElement>(".gallery"));
const modal = new Modal(events, ensureElement<HTMLElement>("#modal-container"));

let currentModal:
  | "product"
  | "basket"
  | "order"
  | "contacts"
  | "success"
  | null = null;

// Функции рендера

function renderCatalog(): void {
  const cards = productsModel.getItems().map((item) => {
    const card = new CardCatalog(cloneTemplate<HTMLElement>("#card-catalog"), {
      onClick: () => events.emit("card:select", item),
    });

    return card.render(item);
  });

  gallery.render({ catalog: cards });
}

function renderPreview(product: IProduct): void {
  const buttonText =
    product.price === null
      ? "Недоступно"
      : basketModel.has(product.id)
        ? "Удалить из корзины"
        : "Купить";

  const buttonDisabled = product.price === null;

  const preview = new CardPreview(cloneTemplate<HTMLElement>("#card-preview"), {
    onClick: () => events.emit("product:toggle", product),
  });

  currentModal = "product";
  modal.render({
    content: preview.render({
      ...product,
      buttonText,
      buttonDisabled,
    }),
  });
}

function renderBasket(): void {
  const cards = basketModel.getItems().map((item, index) => {
    const card = new CardBasket(cloneTemplate<HTMLElement>("#card-basket"), {
      onClick: () => events.emit("basket:remove", { id: item.id }),
    });

    return card.render({
      index: index + 1,
      title: item.title,
      price: item.price,
    });
  });

  const basket = new BasketView(events, cloneTemplate<HTMLElement>("#basket"));

  currentModal = "basket";
  modal.render({
    content: basket.render({
      items: cards,
      total: basketModel.getTotal(),
    }),
  });
}

function renderOrderForm(): void {
  const buyerData = buyerModel.getData();
  const errors = buyerModel.validate();

  const form = new OrderForm(events, cloneTemplate<HTMLFormElement>("#order"));

  currentModal = "order";
  modal.render({
    content: form.render({
      payment: buyerData.payment,
      address: buyerData.address,
      valid: !errors.payment && !errors.address,
      errors: [errors.payment, errors.address].filter(Boolean).join("; "),
    }),
  });
}

function renderContactsForm(): void {
  const buyerData = buyerModel.getData();
  const errors = buyerModel.validate();

  const form = new ContactsForm(
    events,
    cloneTemplate<HTMLFormElement>("#contacts"),
  );

  currentModal = "contacts";
  modal.render({
    content: form.render({
      email: buyerData.email,
      phone: buyerData.phone,
      valid: !errors.email && !errors.phone,
      errors: [errors.email, errors.phone].filter(Boolean).join("; "),
    }),
  });
}

function renderSuccess(total: number): void {
  const success = new Success(events, cloneTemplate<HTMLElement>("#success"));

  currentModal = "success";
  modal.render({
    content: success.render({ total }),
  });
}

// События моделей

events.on("products:changed", () => {
  renderCatalog();
});

events.on<IProduct>("product:selected", (product) => {
  if (product) {
    renderPreview(product);
  }
});

events.on("basket:changed", () => {
  header.render({ counter: basketModel.getCount() });

  if (currentModal === "basket") {
    renderBasket();
  }

  if (currentModal === "product") {
    const selected = productsModel.getSelected();
    if (selected) {
      renderPreview(selected);
    }
  }
});

events.on("buyer:changed", () => {
  if (currentModal === "order") {
    renderOrderForm();
  }

  if (currentModal === "contacts") {
    renderContactsForm();
  }
});

events.on("modal:close", () => {
  currentModal = null;
});

// События представлений

events.on<IProduct>("card:select", (product) => {
  productsModel.setSelected(product);
});

events.on<IProduct>("product:toggle", (product) => {
  if (basketModel.has(product.id)) {
    basketModel.remove(product.id);
  } else {
    basketModel.add(product);
  }

  modal.close();
});

events.on<{ id: string }>("basket:remove", ({ id }) => {
  basketModel.remove(id);
});

events.on("basket:open", () => {
  renderBasket();
});

events.on("order:open", () => {
  renderOrderForm();
});

events.on<Partial<IBuyer>>("order:change", (data) => {
  buyerModel.setData(data);
});

events.on<{ payment: "card" | "cash" }>("payment:change", (data) => {
  buyerModel.setData(data);
});

events.on("order:submit", () => {
  const errors = buyerModel.validate();

  if (!errors.payment && !errors.address) {
    renderContactsForm();
  }
});

events.on<Partial<IBuyer>>("contacts:change", (data) => {
  buyerModel.setData(data);
});

events.on("contacts:submit", async () => {
  const errors = buyerModel.validate();

  if (!errors.email && !errors.phone) {
    const buyerData = buyerModel.getData();

    if (!buyerData.payment) return;

    const total = basketModel.getTotal();

    const orderData: IOrderRequest = {
      payment: buyerData.payment,
      address: buyerData.address,
      email: buyerData.email,
      phone: buyerData.phone,
      total,
      items: basketModel.getItems().map((item) => item.id),
    };

    try {
      await webLarekApi.createOrder(orderData);

      currentModal = null;
      basketModel.clear();
      buyerModel.clear();

      renderSuccess(total);
    } catch (err) {
      console.error("Ошибка оформления заказа:", err);
    }
  }
});

events.on("success:close", () => {
  modal.close();
});

// Инициализация

header.render({ counter: 0 });

webLarekApi
  .getProducts()
  .then((items) => {
    productsModel.setItems(items);
  })
  .catch((err) => {
    console.error("Ошибка загрузки товаров:", err);
  });
