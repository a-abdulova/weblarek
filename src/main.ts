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
import { IBuyer, IOrderRequest, IProduct, TPayment } from "./types";

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

const previewCard = new CardPreview(
  cloneTemplate<HTMLElement>("#card-preview"),
  {
    onClick: () => events.emit("product:toggle"),
  },
);

const basketView = new BasketView(
  events,
  cloneTemplate<HTMLElement>("#basket"),
);

const orderForm = new OrderForm(
  events,
  cloneTemplate<HTMLFormElement>("#order"),
);

const contactsForm = new ContactsForm(
  events,
  cloneTemplate<HTMLFormElement>("#contacts"),
);

const successView = new Success(events, cloneTemplate<HTMLElement>("#success"));

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

function updatePreviewCard(): void {
  const product = productsModel.getSelected();
  if (!product) return;

  const buttonText =
    product.price === null
      ? "Недоступно"
      : basketModel.has(product.id)
        ? "Удалить из корзины"
        : "Купить";

  const buttonDisabled = product.price === null;

  previewCard.render({
    ...product,
    buttonText,
    buttonDisabled,
  });
}

function openPreview(): void {
  updatePreviewCard();
  modal.render({
    content: previewCard.render(),
  });
}

function updateBasketView(): void {
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

  basketView.render({
    items: cards,
    total: basketModel.getTotal(),
  });

  header.render({
    counter: basketModel.getCount(),
  });
}

function openBasket(): void {
  modal.render({
    content: basketView.render(),
  });
}

function updateOrderFormView(): void {
  const buyerData = buyerModel.getData();
  const errors = buyerModel.validate();

  orderForm.render({
    payment: buyerData.payment,
    address: buyerData.address,
    valid: !errors.payment && !errors.address,
    errors: [errors.payment, errors.address].filter(Boolean).join("; "),
  });
}

function openOrderForm(): void {
  modal.render({
    content: orderForm.render(),
  });
}

function updateContactsFormView(): void {
  const buyerData = buyerModel.getData();
  const errors = buyerModel.validate();

  contactsForm.render({
    email: buyerData.email,
    phone: buyerData.phone,
    valid: !errors.email && !errors.phone,
    errors: [errors.email, errors.phone].filter(Boolean).join("; "),
  });
}

function openContactsForm(): void {
  modal.render({
    content: contactsForm.render(),
  });
}

function openSuccess(total: number): void {
  successView.render({ total });

  modal.render({
    content: successView.render(),
  });
}

// События моделей

events.on("products:changed", () => {
  renderCatalog();
});

events.on("product:selected", () => {
  const product = productsModel.getSelected();
  if (product) {
    openPreview();
  }
});

events.on("basket:changed", () => {
  updateBasketView();

  if (productsModel.getSelected()) {
    updatePreviewCard();
  }
});

events.on("buyer:changed", () => {
  updateOrderFormView();
  updateContactsFormView();
});

// События представлений

events.on<IProduct>("card:select", (product) => {
  productsModel.setSelected(product);
});

events.on("product:toggle", () => {
  const product = productsModel.getSelected();
  if (!product) return;

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
  openBasket();
});

events.on("order:open", () => {
  openOrderForm();
});

events.on<Partial<IBuyer>>("order:change", (data) => {
  const address = typeof data.address === "string" ? data.address : "";
  buyerModel.setData({ address });
});

events.on<{ payment: TPayment }>("payment:change", (data) => {
  buyerModel.setData(data);
});

events.on("order:submit", () => {
  openContactsForm();
});

events.on<Partial<IBuyer>>("contacts:change", (data) => {
  const email = typeof data.email === "string" ? data.email : "";
  const phone = typeof data.phone === "string" ? data.phone : "";

  buyerModel.setData({ email, phone });
});

events.on("contacts:submit", async () => {
  const buyerData = buyerModel.getData();

  if (!buyerData.payment) return;

  const orderData: IOrderRequest = {
    payment: buyerData.payment,
    address: buyerData.address,
    email: buyerData.email,
    phone: buyerData.phone,
    total: basketModel.getTotal(),
    items: basketModel.getItems().map((item) => item.id),
  };

  try {
    const result = await webLarekApi.createOrder(orderData);

    basketModel.clear();
    buyerModel.clear();

    openSuccess(result.total);
  } catch (err) {
    console.error("Ошибка оформления заказа:", err);
  }
});

events.on("success:close", () => {
  modal.close();
});

// Инициализация
header.render({ counter: 0 });
updateBasketView();
updateOrderFormView();
updateContactsFormView();

webLarekApi
  .getProducts()
  .then((items) => {
    productsModel.setItems(items);
  })
  .catch((err) => {
    console.error("Ошибка загрузки товаров:", err);
  });
