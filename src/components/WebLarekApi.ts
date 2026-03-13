import {
  IApi,
  IProduct,
  IProductsResponse,
  IOrderRequest,
  IOrderResponse,
} from "../types";

export class WebLarekApi {
  constructor(private api: IApi) {}

  async getProducts(): Promise<IProduct[]> {
    const res = await this.api.get<IProductsResponse>("/product/");
    return res.items;
  }

  async createOrder(order: IOrderRequest): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>("/order/", order);
  }
}
