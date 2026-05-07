import AuthProvider from 'context/auth/AuthProvider';
import CartProvider from 'context/cart/CartProvider';

const Provider = ({ children }) => {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
};

export default Provider;
