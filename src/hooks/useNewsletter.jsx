import { useState } from 'react';

import { KEYS, getItem, setItem } from 'db/config';

export const useNewsletter = () => {
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const subscribeToNewsletter = async ({ email }) => {
    setError(null);
    try {
      const list = getItem(KEYS.newsletter) || [];
      if (list.includes(email)) {
        setSuccess({ message: 'You have already joined!' });
      } else {
        list.push(email);
        setItem(KEYS.newsletter, list);
        setSuccess({ message: 'Thanks for joining!' });
      }
    } catch (err) {
      setError({ message: err.message });
    }
  };

  return { subscribeToNewsletter, success, error };
};
