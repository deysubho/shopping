import { useReducer, useEffect } from 'react';
import { v4 as uuid } from 'uuid';

import { KEYS, getItem, setItem } from 'db/config';
import AuthContext from './auth-context';

const initialState = {
  user: null,
  name: null,
  lastName: null,
  email: null,
  phoneNumber: null,
  addresses: [],
  isVerified: false,
  isAdmin: false,
  authIsReady: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_IS_READY':
    case 'LOGIN':
      return { ...action.payload, authIsReady: true };
    case 'ANONYMOUS_AUTH_IS_READY':
      return { ...initialState, user: action.payload.user, authIsReady: true };
    case 'LOGOUT':
      return { ...initialState };
    case 'UPDATE_USER':
      return { ...state, ...action.payload };
    case 'UPDATE_ADDRESSES':
      return { ...state, addresses: action.payload };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const session = getItem(KEYS.session);
    if (session) {
      dispatch({ type: 'AUTH_IS_READY', payload: session });
    } else {
      // anonymous user — reuse same uid across refreshes
      let anonUser = getItem(KEYS.session + '_anon');
      if (!anonUser) {
        anonUser = { uid: uuid(), isAnonymous: true };
        setItem(KEYS.session + '_anon', anonUser);
      }
      dispatch({ type: 'ANONYMOUS_AUTH_IS_READY', payload: { user: anonUser } });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
