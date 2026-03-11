import './scss/styles.scss';
import { apiProducts } from './utils/data';

import { Products } from './components/base/models/Products';
import { Basket } from './components/base/models/Basket';
import { Buyer } from './components/base/models/Buyer';
import { API_URL } from './utils/constants';
import { Api } from './components/base/Api';
import { WebLarekApi } from './utils/WebLarekApi';

const productsModel = new Products();
const basketModel = new Basket();
const buyerModel = new Buyer();

productsModel.setItems(apiProducts.items);

const firstId = apiProducts.items[0]?.id;
const p1 = apiProducts.items[0];
const p2 = apiProducts.items[1];

// ===== Products =====
console.log('Массив товаров из каталога: ', productsModel.getItems());
if (firstId) console.log('Товар из каталога по id: ', productsModel.getById(firstId));

console.log('Выбранный товар (до setSelected): ', productsModel.getSelected());
productsModel.setSelected(apiProducts.items[0] ?? null);
console.log('Выбранный товар (после setSelected): ', productsModel.getSelected());

// ===== Basket =====
console.log('Корзина (пустая), товары: ', basketModel.getItems());
console.log('Корзина (пустая), количество: ', basketModel.getCount());
console.log('Корзина (пустая), сумма: ', basketModel.getTotal());

if (p1) basketModel.add(p1);
if (p2) basketModel.add(p2);
if (p1) basketModel.add(p1);

console.log('Корзина (после add), товары: ', basketModel.getItems());
console.log('Корзина (после add), количество: ', basketModel.getCount());
console.log('Корзина (после add), сумма: ', basketModel.getTotal());

if (p1) console.log('Корзина, есть ли товар p1: ', basketModel.has(p1.id));

if (p1) basketModel.remove(p1.id);
console.log('Корзина (после remove p1), товары: ', basketModel.getItems());

basketModel.clear();
console.log('Корзина (после clear), товары: ', basketModel.getItems());
console.log('Корзина (после clear), количество: ', basketModel.getCount());
console.log('Корзина (после clear), сумма: ', basketModel.getTotal());

// ===== Buyer =====
console.log('Покупатель, ошибки на пустых полях: ', buyerModel.validate());

buyerModel.setData({ payment: 'card', address: 'Москва, ул. Пушкина, д. 1' });
console.log('Покупатель, ошибки после payment+address: ', buyerModel.validate());

buyerModel.setData({ email: 'test@test.ru', phone: '+7 (900) 123-45-67' });
console.log('Покупатель, ошибки после email+phone: ', buyerModel.validate());

console.log('Покупатель, данные (getData): ', buyerModel.getData());

buyerModel.clear();
console.log('Покупатель, ошибки после clear: ', buyerModel.validate());

// ===== Catalogue =====
const apiClient = new Api(API_URL);
const webLarekApi = new WebLarekApi(apiClient);

webLarekApi.getProducts()
  .then((items) => {
    productsModel.setItems(items);
    console.log('Каталог товаров с сервера: ', productsModel.getItems());
  })
  .catch((err) => {
    console.error('Ошибка загрузки товаров:', err);
  });

