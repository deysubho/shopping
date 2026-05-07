import { useReducer, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { KEYS, getItem, setItem } from 'db/config';
import { useAuthContext } from 'hooks/useAuthContext';
import { updateCartAtLogin } from 'helpers/cart';

import CartContext from './cart-context';

const initialState = {
  items: [],
  cartIsReady: false,
  cartNeedsCheck: true,
  isLogin: true,
};

const cartReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'CART_IS_READY':
      return { ...state, cartIsReady: true, isLogin: false };
    case 'CART_NOT_READY':
      return { ...state, cartIsReady: false };
    case 'UPDATE_CART':
      return { ...state, items: payload, cartIsReady: true, isLogin: false };
    case 'DELETE_CART':
      return { ...initialState, cartIsReady: true };
    case 'CHECK':
      return { ...state, cartNeedsCheck: true };
    case 'NO_CHECK':
      return { ...state, cartNeedsCheck: false };
    case 'IS_LOGIN':
      return { ...state, isLogin: true };
    case 'IS_NOT_LOGIN':
      return { ...state, isLogin: false };
    default:
      return state;
  }
};

const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const location = useLocation();
  const { user } = useAuthContext();
  const firstLoad = useRef(true);

  useEffect(() => {
    if (user && state.isLogin) {
      dispatch({ type: 'CART_NOT_READY' });

      if (
        (location.pathname === '/cart' || location.pathname === '/checkout') &&
        firstLoad.current
      ) {
        dispatch({ type: 'NO_CHECK' });
      }
      firstLoad.current = false;

      const savedCart = getItem(KEYS.carts + '_' + user.uid) || [];

      let currentCartItems = savedCart;

      if (state.items.length > 0) {
        currentCartItems = updateCartAtLogin([...state.items, ...savedCart]);
      }

      if (currentCartItems.length > 0) {
        setItem(KEYS.carts + '_' + user.uid, currentCartItems);
        dispatch({ type: 'UPDATE_CART', payload: currentCartItems });
      } else {
        dispatch({ type: 'CART_IS_READY' });
      }
    }
  }, [user]);

  // persist cart to localStorage whenever items change
  useEffect(() => {
    if (user && state.cartIsReady) {
      if (state.items.length > 0) {
        setItem(KEYS.carts + '_' + user.uid, state.items);
      } else {
        localStorage.removeItem(KEYS.carts + '_' + user.uid);
      }
    }
  }, [state.items]);

  return (
    <CartContext.Provider value={{ ...state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
