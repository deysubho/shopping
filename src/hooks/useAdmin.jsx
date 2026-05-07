import { useState } from 'react';
import { v4 as uuid } from 'uuid';

import { KEYS, getItem, setItem } from 'db/config';

const getProducts = () => getItem(KEYS.adminProducts) || [];

export const useAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllProducts = () => {
    return getProducts();
  };

  const getProduct = async (productId) => {
    setIsLoading(true);
    try {
      const products = getProducts() || [];
      const product = products.find((p) => p.id === productId) || null;
      setIsLoading(false);
      return product;
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
  };

  const createProduct = async ({ productData, variants }) => {
    setError(null);
    setIsLoading(true);
    try {
      const products = getProducts() || [];
      const productId = uuid();

      const formattedVariants = variants.map((variant) => ({
        id: uuid(),
        color: variant.color.trim().toLowerCase(),
        images: variant.images || [],
        variantPrice: Number(variant.variantPrice),
        skus: (variant.skus || []).map((sku) => ({
          id: uuid(),
          order: sku.order || null,
          quantity: Number(sku.quantity) || 0,
          size: sku.size || null,
          value: sku.value || '',
        })),
      }));

      const newProduct = {
        id: productId,
        collection: productData.collection,
        fit: productData.fit || '',
        description: productData.description.trim().toLowerCase(),
        model: productData.model.trim().toLowerCase(),
        price: Number(productData.price),
        slug: productData.slug.trim().toLowerCase(),
        type: productData.type.trim().toLowerCase(),
        createdAt: new Date().toISOString(),
        variants: formattedVariants,
      };

      products.push(newProduct);
      setItem(KEYS.adminProducts, products);
      setIsLoading(false);
      return newProduct;
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
  };

  const editProduct = async ({ productId, productData, variants }) => {
    setError(null);
    setIsLoading(true);
    try {
      const products = getProducts() || [];
      const idx = products.findIndex((p) => p.id === productId);
      if (idx < 0) throw new Error('Product not found.');

      const formattedVariants = variants.map((variant) => ({
        id: variant.id || uuid(),
        color: variant.color.trim().toLowerCase(),
        images: variant.images || [],
        variantPrice: Number(variant.variantPrice),
        skus: (variant.skus || []).map((sku) => ({
          id: sku.id || uuid(),
          order: sku.order || null,
          quantity: Number(sku.quantity) || 0,
          size: sku.size || null,
          value: sku.value || '',
        })),
      }));

      products[idx] = {
        ...products[idx],
        collection: productData.collection,
        fit: productData.fit || '',
        description: productData.description.trim().toLowerCase(),
        model: productData.model.trim().toLowerCase(),
        price: Number(productData.price),
        slug: productData.slug.trim().toLowerCase(),
        type: productData.type.trim().toLowerCase(),
        variants: formattedVariants,
      };

      setItem(KEYS.adminProducts, products);
      setIsLoading(false);
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
  };

  const deleteVariant = async ({ productId, variantId }) => {
    setError(null);
    setIsLoading(true);
    try {
      const products = getProducts() || [];
      const idx = products.findIndex((p) => p.id === productId);
      if (idx < 0) throw new Error('Product not found.');

      const updatedVariants = products[idx].variants.filter((v) => v.id !== variantId);

      if (updatedVariants.length === 0) {
        products.splice(idx, 1);
      } else {
        products[idx].variants = updatedVariants;
      }

      setItem(KEYS.adminProducts, products);
      setIsLoading(false);
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    setError(null);
    setIsLoading(true);
    try {
      const products = (getProducts() || []).filter((p) => p.id !== productId);
      setItem(KEYS.adminProducts, products);
      setIsLoading(false);
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
  };

  return {
    getAllProducts,
    getProduct,
    createProduct,
    editProduct,
    deleteVariant,
    deleteProduct,
    isLoading,
    error,
  };
};
