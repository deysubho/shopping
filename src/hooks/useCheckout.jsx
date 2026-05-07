import { useState } from 'react';

import { KEYS, getItem, setItem } from 'db/config';
import { useCheckoutContext } from './useCheckoutContext';
import { useAuthContext } from './useAuthContext';
import { useAddress } from './useAddress';

export const useCheckout = () => {
  const { dispatch } = useCheckoutContext();
  const { user } = useAuthContext();
  const { createAddress } = useAddress();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sessionKey = () => KEYS.carts + '_checkout_' + user.uid;

  const updateSession = (data) => {
    const current = getItem(sessionKey()) || {};
    setItem(sessionKey(), { ...current, ...data });
  };

  const selectPreviousStep = () => dispatch({ type: 'SELECT_PREVIOUS_STEP' });

  const selectStep = (index) => dispatch({ type: 'SELECT_STEP', payload: index });

  const submitShippingInfo = async (userInput) => {
    setError(null);
    setIsLoading(true);
    try {
      const { email, ...shippingAddress } = userInput;

      if (shippingAddress.value === 'new') {
        await createAddress({ ...shippingAddress });
      }

      updateSession({ email, shippingAddressId: shippingAddress.id });

      dispatch({ type: 'SUBMIT_SHIPPING_INFO', payload: { email, shippingAddress } });
      setIsLoading(false);
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
  };

  const selectShippingOption = (option) => {
    const selectedOption = option === 'standard'
      ? { standard: true, expedited: false }
      : { standard: false, expedited: true };
    dispatch({ type: 'SELECT_SHIPPING_OPTION', payload: selectedOption });
  };

  const submitShippingOption = async ({ shippingOption, shippingCost = 0 }) => {
    setError(null);
    setIsLoading(true);
    try {
      updateSession({ shippingOption, shippingCost });
      dispatch({ type: 'SUBMIT_SHIPPING_OPTION', payload: shippingCost });
      setIsLoading(false);
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
  };

  const deleteCheckoutSession = async () => {
    localStorage.removeItem(sessionKey());
  };

  return { selectPreviousStep, selectStep, submitShippingInfo, selectShippingOption, submitShippingOption, deleteCheckoutSession, isLoading, error };
};
