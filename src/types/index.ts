export type ApiPostMethods = "POST" | "PUT" | "DELETE";

export interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(
    uri: string,
    data: object,
    method?: ApiPostMethods,
  ): Promise<T>;
}

export type TPayment = "card" | "cash";

export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

export interface IBuyer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}

export interface IProductsResponse {
  total: number;
  items: IProduct[];
}

export interface IOrderRequest extends IBuyer {
  total: number;
  items: string[];
}

export interface IOrderResponse {
  id: string;
  total: number;
}

export type TBuyerErrors = Partial<Record<keyof IBuyer, string>>;

export interface IHeaderView {
  counter: number;
}

export interface IGalleryView {
  catalog: HTMLElement[];
}

export interface IModalView {
  content: HTMLElement;
}

export interface ICardActions {
  onClick: () => void;
}

export interface ICardBasketView {
  index: number;
  title: string;
  price: number | null;
}

export interface IBasketView {
  items: HTMLElement[];
  total: number;
}

export interface IFormState {
  valid: boolean;
  errors: string;
}

export interface IOrderFormView extends IFormState {
  payment: TPayment | null;
  address: string;
}

export interface IContactsFormView extends IFormState {
  email: string;
  phone: string;
}

export interface ISuccessView {
  total: number;
}
