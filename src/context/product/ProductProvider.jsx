import { useReducer, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

import { KEYS, getItem } from 'db/config';
import productsJson from 'data/products.json';
import ProductContext from './product-context';

const initialState = {
  productIsReady: false,
  selectedProduct: null,
  selectedVariant: null,
  selectedSkuId: '',
  selectedSize: '',
  singleSize: null,
};

const productReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'CLEAR_PRODUCT':
      return { ...initialState };
    case 'SET_PRODUCT':
      return { ...state, productIsReady: true, selectedProduct: payload.product, selectedVariant: payload.variant };
    case 'SELECT_VARIANT':
      return { ...state, selectedVariant: payload, selectedSkuId: '', selectedSize: '' };
    case 'SELECT_SIZE':
      return { ...state, selectedSkuId: payload.skuId, selectedSize: payload.value };
    case 'SINGLE_SIZE':
      return { ...state, singleSize: { quantity: payload.quantity }, selectedSkuId: payload.selectedSkuId };
    default:
      return state;
  }
};

const ProductProvider = ({ children }) => {
  const { id: slugId } = useParams();
  const { pathname, state: slugState } = useLocation();
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(productReducer, initialState);

  const getProduct = () => {
    const adminProducts = getItem(KEYS.adminProducts) || [];
    const products = [...productsJson, ...adminProducts];
    const slugArr = slugId.split('-');
    const selectedColor = slugArr.pop();
    const formattedSlug = slugArr.join('-');

    const product = products.find((p) => p.slug === formattedSlug);
    if (!product) return { product: null, variant: null };

    const variants = product.variants.map((v) => ({
      ...v,
      variantId: v.id,
      sizes: v.skus.map((s) => ({ skuId: s.id, value: s.size, quantity: s.quantity })),
    }));

    const selectedVariant = variants.find((v) => v.color === selectedColor);
    if (!selectedVariant) return { product: null, variant: null };

    return {
      product: { ...product, productId: product.id, variants },
      variant: selectedVariant,
    };
  };

  useEffect(() => {
    if (slugState) {
      navigate({ pathname, state: null });
    } else {
      if (state.productIsReady) dispatch({ type: 'CLEAR_PRODUCT' });

      const { product, variant } = getProduct();

      if (variant?.sizes?.length === 1) {
        dispatch({
          type: 'SINGLE_SIZE',
          payload: { selectedSkuId: variant.sizes[0].skuId, quantity: variant.sizes[0].quantity },
        });
      }

      dispatch({ type: 'SET_PRODUCT', payload: { product, variant } });
    }
  }, [slugId, slugState]);

  return (
    <ProductContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductProvider;
