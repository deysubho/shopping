import { useReducer, useEffect } from 'react';

import { KEYS, getItem, setItem } from 'db/config';
import { useAuthContext } from 'hooks/useAuthContext';
import CheckoutContext from './checkout-context';

const initialState = {
  checkoutIsReady: false,
  currentStep: 1,
  email: null,
  id: null,
  shippingAddress: { id: null },
  shippingOption: { standard: false, expedited: false },
  shippingCost: 0,
};

const checkoutReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'SELECT_STEP':
      return { ...state, currentStep: payload };
    case 'SELECT_PREVIOUS_STEP':
      return { ...state, currentStep: state.currentStep - 1 };
    case 'SUBMIT_SHIPPING_INFO':
      return { ...state, currentStep: state.currentStep + 1, email: payload.email, shippingAddress: payload.shippingAddress };
    case 'SELECT_SHIPPING_OPTION':
      return { ...state, shippingOption: payload };
    case 'SUBMIT_SHIPPING_OPTION':
      return { ...state, shippingCost: payload, currentStep: state.currentStep + 1 };
    case 'CREATE_CHECKOUT_SESSION':
      return { ...state, checkoutIsReady: true, id: payload.id, email: payload.email };
    case 'UPDATE_CHECKOUT_SESSION':
      return { ...state, checkoutIsReady: true, ...payload };
    default:
      return state;
  }
};

const CheckoutProvider = ({ children }) => {
  const { email, user } = useAuthContext();
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  useEffect(() => {
    const key = KEYS.carts + '_checkout_' + user.uid;
    const session = getItem(key);

    if (session) {
      dispatch({ type: 'UPDATE_CHECKOUT_SESSION', payload: { ...session, id: user.uid } });
    } else {
      const newSession = {
        email,
        shippingAddressId: null,
        shippingOption: { standard: false, expedited: false },
        shippingCost: 0,
      };
      setItem(key, newSession);
      dispatch({ type: 'CREATE_CHECKOUT_SESSION', payload: { id: user.uid, email } });
    }
  }, []);

  return (
    <CheckoutContext.Provider value={{ ...state, dispatch }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export default CheckoutProvider;
