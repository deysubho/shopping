import { useState } from 'react';
import { v4 as uuid } from 'uuid';

import { KEYS, getItem, setItem } from 'db/config';
import { useAuthContext } from './useAuthContext';
import { useCartContext } from './useCartContext';
import { handleError } from 'helpers/error/handleError';

export const useAuth = () => {
  const { dispatch: dispatchAuthAction } = useAuthContext();
  const { dispatch: dispatchCartAction } = useCartContext();

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultValue, setDefaultValue] = useState(false);

  const signUp = async ({ name, lastName, email, password }) => {
    setError(null);
    setIsLoading(true);
    setDefaultValue({ name, lastName, email });
    try {
      const users = getItem(KEYS.users) || [];
      if (users.find((u) => u.email === email)) {
        throw new Error('Email already in use.');
      }

      const user = { uid: uuid(), isAnonymous: false };
      const userData = {
        user,
        name,
        lastName,
        email,
        password,
        phoneNumber: null,
        addresses: [],
        isVerified: true,
        isAdmin: false,
        authIsReady: true,
      };

      users.push(userData);
      setItem(KEYS.users, users);
      setItem(KEYS.session, userData);

      dispatchAuthAction({ type: 'LOGIN', payload: userData });
    } catch (err) {
      setError(handleError(err));
      setIsLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    setError(null);
    setIsLoading(true);
    setDefaultValue({ email });
    try {
      dispatchCartAction({ type: 'IS_LOGIN' });
      const users = getItem(KEYS.users) || [];
      const found = users.find((u) => u.email === email && u.password === password);
      if (!found) throw new Error('Invalid email or password.');

      setItem(KEYS.session, found);
      dispatchAuthAction({ type: 'LOGIN', payload: found });
    } catch (err) {
      setError(handleError(err));
      dispatchCartAction({ type: 'IS_NOT_LOGIN' });
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    setIsLoading(true);
    try {
      localStorage.removeItem(KEYS.session);
      dispatchCartAction({ type: 'DELETE_CART' });
      dispatchAuthAction({ type: 'LOGOUT' });
    } catch (err) {
      setError(handleError(err));
      setIsLoading(false);
    }
  };

  return { signUp, login, logout, isLoading, error, defaultValue };
};
