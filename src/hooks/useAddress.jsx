import { useState } from 'react';
import { v4 as uuid } from 'uuid';

import { KEYS, getItem, setItem } from 'db/config';
import { useAuthContext } from 'hooks/useAuthContext';
import { handleError } from 'helpers/error/handleError';

export const useAddress = () => {
  const { user, addresses, dispatch } = useAuthContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveAddresses = (updatedAddresses) => {
    const users = getItem(KEYS.users) || [];
    const idx = users.findIndex((u) => u.user.uid === user.uid);
    if (idx >= 0) {
      users[idx].addresses = updatedAddresses;
      setItem(KEYS.users, users);
      const session = getItem(KEYS.session);
      setItem(KEYS.session, { ...session, addresses: updatedAddresses });
    }
    dispatch({ type: 'UPDATE_ADDRESSES', payload: updatedAddresses });
  };

  const createAddress = async ({ id = null, name, lastName, phoneNumber, address, zipCode, city, state, isMain = false }) => {
    setError(null);
    setIsLoading(true);
    try {
      const userAddresses = [...addresses];
      if (!isMain) isMain = userAddresses.length === 0;
      if (!id) id = uuid();

      const fmt = (s) => s.trim().replace(/\s+/g, ' ');
      const addressToAdd = {
        id, value: id,
        name: fmt(name), lastName: fmt(lastName), phoneNumber,
        address: fmt(address), zipCode: fmt(zipCode), city: fmt(city), state: fmt(state),
        isMain,
        label: `${fmt(name)} ${fmt(lastName)} - ${fmt(address)} - ${fmt(city)}, ${fmt(state)} ${fmt(zipCode)}`,
      };

      if (isMain && userAddresses.length > 0) {
        const mainIdx = userAddresses.findIndex((a) => a.isMain);
        if (mainIdx >= 0) userAddresses[mainIdx].isMain = false;
        userAddresses.unshift(addressToAdd);
      } else {
        userAddresses.push(addressToAdd);
      }

      userAddresses.forEach((a, i) => (a.displayOrder = i + 1));
      saveAddresses(userAddresses);
      setIsLoading(false);
      return addressToAdd;
    } catch (err) {
      setError(handleError(err));
      setIsLoading(false);
    }
  };

  const editAddress = async ({ name, lastName, phoneNumber, address, zipCode, city, state, isMain, id, displayOrder }) => {
    setError(null);
    setIsLoading(true);
    try {
      let userAddresses = [...addresses];
      const fmt = (s) => s.trim().replace(/\s+/g, ' ');

      if (!isMain) {
        const cur = userAddresses.find((a) => a.id === id);
        isMain = cur?.isMain || false;
      }

      const updatedAddress = {
        id, value: id, displayOrder,
        name: fmt(name), lastName: fmt(lastName), phoneNumber,
        address: fmt(address), zipCode: fmt(zipCode), city: fmt(city), state: fmt(state),
        isMain,
        label: `${fmt(name)} ${fmt(lastName)} - ${fmt(address)} - ${fmt(city)}, ${fmt(state)} ${fmt(zipCode)}`,
      };

      if (isMain) {
        userAddresses = userAddresses.filter((a) => a.id !== id);
        const mainIdx = userAddresses.findIndex((a) => a.isMain);
        if (mainIdx >= 0) userAddresses[mainIdx].isMain = false;
        userAddresses.unshift(updatedAddress);
        userAddresses.forEach((a, i) => (a.displayOrder = i + 1));
      } else {
        const idx = userAddresses.findIndex((a) => a.id === id);
        userAddresses[idx] = updatedAddress;
      }

      saveAddresses(userAddresses);
      setIsLoading(false);
    } catch (err) {
      setError(handleError(err));
      setIsLoading(false);
    }
  };

  const deleteAddress = async (id) => {
    setError(null);
    setIsLoading(true);
    try {
      let userAddresses = addresses.filter((a) => a.id !== id);
      if (userAddresses.length > 0) {
        userAddresses.forEach((a, i) => (a.displayOrder = i + 1));
        if (!userAddresses.find((a) => a.isMain)) userAddresses[0].isMain = true;
      }
      saveAddresses(userAddresses);
      setIsLoading(false);
    } catch (err) {
      setError(handleError(err));
      setIsLoading(false);
    }
  };

  return { createAddress, editAddress, deleteAddress, isLoading, error };
};
