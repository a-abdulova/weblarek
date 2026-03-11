import { IBuyer, TBuyerErrors, TPayment } from "../../../types";

export class Buyer {
  private payment: TPayment | "" = "";
  private address = "";
  private email = "";
  private phone = "";

  setData(data: Partial<IBuyer>): void {
    if (data.payment !== undefined) this.payment = data.payment;
    if (data.address !== undefined) this.address = data.address;
    if (data.email !== undefined) this.email = data.email;
    if (data.phone !== undefined) this.phone = data.phone;
  }

  getData(): IBuyer {
    return {
      payment: this.payment as TPayment,
      address: this.address,
      email: this.email,
      phone: this.phone,
    };
  }

  clear(): void {
    this.payment = "";
    this.address = "";
    this.email = "";
    this.phone = "";
  }

  validate(): TBuyerErrors {
    const errors: TBuyerErrors = {};

    if (!this.payment) errors.payment = "Не выбран вид оплаты";
    if (!this.address.trim()) errors.address = "Необходимо указать адрес";
    if (!this.email.trim()) errors.email = "Укажите email";
    if (!this.phone.trim()) errors.phone = "Укажите телефон";

    return errors;
  }
}
