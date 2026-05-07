import { useState } from 'react';

import { KEYS, getItem, setItem } from 'db/config';
import { useAuthContext } from './useAuthContext';
import { handleError } from 'helpers/error/handleError';

export const useProfile = () => {
  const { user, dispatch } = useAuthContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const editProfile = async ({ name, lastName, phoneNumber = null }) => {
    setError(null);
    setIsLoading(true);
    try {
      const users = getItem(KEYS.users) || [];
      const idx = users.findIndex((u) => u.user.uid === user.uid);
      if (idx >= 0) {
        users[idx] = { ...users[idx], name, lastName, phoneNumber };
        setItem(KEYS.users, users);
        const session = getItem(KEYS.session);
        setItem(KEYS.session, { ...session, name, lastName, phoneNumber });
      }

      dispatch({ type: 'UPDATE_USER', payload: { name, lastName, phoneNumber } });
      setIsLoading(false);
    } catch (err) {
      setError(handleError(err));
      setIsLoading(false);
    }
  };

  return { editProfile, isLoading, error };
};
