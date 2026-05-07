// Local storage keys
export const KEYS = {
  users: 'local_users',
  session: 'local_session',
  carts: 'local_carts',
  orders: 'local_orders',
  newsletter: 'local_newsletter',
  adminProducts: 'local_admin_products',
};

export const getItem = (key) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
};

export const setItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
