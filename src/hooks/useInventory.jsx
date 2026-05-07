import { useState } from 'react';

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

export const useInventory = () => {
  const { dispatch } = useCartContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkInventory = async (items) => {
    setError(null);
    setIsLoading(true);
    try {
      let updatedItems = [...items];
      let stockDifference = false;

      for (const item of items) {
        const sku = getSkuStock(item.productId, item.skuId);
        const availableQuantity = sku ? sku.quantity : 0;

        if (availableQuantity <= 0) {
          stockDifference = true;
          updatedItems = updatedItems.filter((i) => i.skuId !== item.skuId);
        } else if (availableQuantity < item.quantity) {
          stockDifference = true;
          const idx = updatedItems.findIndex((i) => i.skuId === item.skuId);
          updatedItems[idx] = { ...updatedItems[idx], quantity: availableQuantity };
        }
      }

      if (addAllItemsQuantity(updatedItems) === 0) {
        dispatch({ type: 'DELETE_CART' });
      } else if (stockDifference) {
        dispatch({ type: 'UPDATE_CART', payload: updatedItems });
      }

      if (stockDifference) {
        throw new CustomError('Available stock is limited. Quantities in cart have been updated!');
      }

      setIsLoading(false);
    } catch (err) {
      setError(handleError(err));
      setIsLoading(false);
    }
  };

  return { checkInventory, isLoading, error };
};

export default useInventory;
