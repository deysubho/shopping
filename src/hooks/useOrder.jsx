import { useState } from 'react';
import { v4 as uuid } from 'uuid';

import { KEYS, getItem, setItem } from 'db/config';
import { useAuthContext } from './useAuthContext';
import { useCartContext } from './useCartContext';
import { useCheckoutContext } from './useCheckoutContext';
import { useCart } from './useCart';
import { useCheckout } from './useCheckout';
import { handleError } from 'helpers/error/handleError';

export const useOrder = () => {
  const { user } = useAuthContext();
  const { items } = useCartContext();
  const { email, shippingAddress, shippingOption, shippingCost } = useCheckoutContext();
  const { deleteCart } = useCart();
  const { deleteCheckoutSession } = useCheckout();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = async (paymentInfo, billingAddress) => {
    setError(null);
    setIsLoading(true);
    try {
      const orders = getItem(KEYS.orders) || [];
      orders.push({
        id: uuid(),
        createdAt: new Date().toISOString(),
        items,
        email,
        shippingAddress,
        shippingOption,
        shippingCost,
        paymentInfo,
        billingAddress,
        createdBy: user.uid,
      });
      setItem(KEYS.orders, orders);
      await deleteCart();
      await deleteCheckoutSession();
      setIsLoading(false);
    } catch (err) {
      setError(handleError(err));
      setIsLoading(false);
    }
  };

  const getOrders = async () => {
    try {
      const orders = getItem(KEYS.orders) || [];
      return orders
        .filter((o) => o.createdBy === user.uid)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    } catch (err) {
      setError(handleError(err));
    }
  };

  return { createOrder, getOrders, isLoading, error };
};
