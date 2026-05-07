import { useState } from 'react';

import { useAuthContext } from './useAuthContext';
import { useCartContext } from './useCartContext';

import { addAllItemsQuantity } from 'helpers/item';
import { CustomError } from 'helpers/error/customError';
import { handleError } from 'helpers/error/handleError';

import { KEYS, getItem } from 'db/config';
import productsJson from 'data/products.json';

const getSkuStock = (productId, skuId) => {
  const adminProducts = getItem(KEYS.adminProducts) || [];
  const products = [...productsJson, ...adminProducts];
  const product = products.find((p) => p.id === productId);
  if (!product) return null;
  for (const variant of product.variants) {
    const sku = variant.skus.find((s) => s.id === skuId);
    if (sku) return sku;
  }
  return null;
};

export const useCart = () => {
  const { user } = useAuthContext();
  const { items, dispatch } = useCartContext();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState(false);
  const [error, setError] = useState(null);

  const saveCart = (updatedItems) => {
    if (addAllItemsQuantity(updatedItems) === 0) {
      dispatch({ type: 'DELETE_CART' });
    } else {
      dispatch({ type: 'UPDATE_CART', payload: updatedItems });
    }
  };

  const addItem = async (itemToAdd) => {
    if (isLoading) return;
    setLoadingItemId(itemToAdd.skuId);
    setError(null);
    setIsLoading(true);
    try {
      const sku = getSkuStock(itemToAdd.productId, itemToAdd.skuId);
      if (!sku) throw new CustomError('Item not found.');

      const availableQuantity = sku.quantity;
      const itemInCartIndex = items.findIndex((i) => i.skuId === itemToAdd.skuId);
      const itemInCart = items[itemInCartIndex];
      let updatedItems = [...items];

      if (availableQuantity <= 0) {
        if (itemInCart) {
          updatedItems = updatedItems.filter((i) => i.skuId !== itemToAdd.skuId);
        } else {
          throw new CustomError(`Size ${itemToAdd.size?.toUpperCase()} is out of stock!`);
        }
      } else if (itemInCart) {
        if (itemInCart.quantity >= availableQuantity) {
          throw new CustomError('All available stock is currently in cart!');
        }
        updatedItems[itemInCartIndex] = { ...itemInCart, quantity: itemInCart.quantity + 1 };
      } else {
        updatedItems.push({ ...itemToAdd, quantity: 1 });
      }

      saveCart(updatedItems);
      setLoadingItemId(null);
      setIsLoading(false);
    } catch (err) {
      setError(handleError(err));
      setLoadingItemId(null);
      setIsLoading(false);
    }
  };

  const removeItem = async (productId, skuId) => {
    setLoadingItemId(skuId);
    setError(null);
    setIsLoading(true);
    try {
      const itemInCartIndex = items.findIndex((i) => i.skuId === skuId);
      const itemInCart = items[itemInCartIndex];
      let updatedItems = [...items];

      if (itemInCart.quantity === 1) {
        updatedItems = items.filter((i) => i.skuId !== skuId);
      } else {
        updatedItems[itemInCartIndex] = { ...itemInCart, quantity: itemInCart.quantity - 1 };
      }

      saveCart(updatedItems);
      setLoadingItemId(null);
      setIsLoading(false);
    } catch (err) {
      setError(handleError(err));
      setLoadingItemId(null);
      setIsLoading(false);
    }
  };

  const deleteItem = async (skuId) => {
    setError(null);
    setIsLoading(true);
    try {
      const updatedItems = items.filter((i) => i.skuId !== skuId);
      saveCart(updatedItems);
      setIsLoading(false);
    } catch (err) {
      setError({ details: err.message });
      setIsLoading(false);
    }
  };

  const deleteCart = async () => {
    dispatch({ type: 'DELETE_CART' });
  };

  const activateCartCheck = () => {
    dispatch({ type: 'CHECK' });
  };

  return { addItem, removeItem, deleteItem, deleteCart, activateCartCheck, isLoading, loadingItemId, error };
};
