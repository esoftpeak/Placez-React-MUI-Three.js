import { Utils } from '../../../blue/core/utils';

export const generateId = (data) =>
  data.reduce((acc, current) => Math.max(acc, current.ProductID), 0) + 1;

export const insertItem = (data) => (item) => {
  item.id = Utils.guid();
  item.inEdit = false;
  data.unshift(item);
  return data;
};

export const getItems = (data) => () => {
  return data;
};

export const updateItem = (data) => (item) => {
  const index = data.findIndex((record) => record.id === item.id);
  data[index] = item;
  return data;
};

export const deleteItem = (data) => (item) => {
  const index = data.findIndex((record) => record.id === item.id);
  data.splice(index, 1);
  return data;
};
