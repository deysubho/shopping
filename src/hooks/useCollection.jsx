import { useState } from 'react';
import { v4 as uuid } from 'uuid';

import { KEYS, getItem } from 'db/config';
import productsJson from 'data/products.json';
import { formatDiscountNumber } from 'helpers/format';

const buildVariants = (product) => {
  return product.variants.map((variant) => {
    const variantSkus = variant.skus.map((sku) => ({
      size: sku.size,
      skuId: sku.id,
      quantity: sku.quantity,
    }));

    const isSoldOut = variantSkus.every((s) => s.quantity === 0);

    const slides = variant.images.map((img) => ({
      ...img,
      url: `${product.slug}-${variant.color}`,
    }));

    return {
      variantId: variant.id,
      productId: product.id,
      price: variant.variantPrice,
      actualPrice: product.price,
      model: product.model,
      type: product.type,
      slug: product.slug,
      collection: product.collection,
      fit: product.fit,
      description: product.description,
      createdAt: product.createdAt,
      color: variant.color,
      images: variant.images,
      slides,
      skus: variantSkus,
      numberOfVariants: product.variants.length,
      isSoldOut,
      discount: formatDiscountNumber({ currentPrice: variant.variantPrice, actualPrice: product.price }),
    };
  });
};

export const useCollection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error] = useState(null);
  const [hasMore] = useState(false);

  const getCollection = async ({
    collectionName = 'products',
    sortBy = { field: 'createdAt', direction: 'asc' },
  } = {}) => {
    setIsLoading(true);

    const adminProducts = getItem(KEYS.adminProducts) || [];
    const products = [...productsJson, ...adminProducts];

    let filtered = collectionName === 'products'
      ? products
      : products.filter((p) => p.collection === collectionName);

    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sortBy.field];
      const bVal = b[sortBy.field];
      if (sortBy.direction === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    const allVariants = filtered.flatMap((product) => {
      const variants = buildVariants(product);
      return variants.map((v) => ({
        ...v,
        id: uuid(),
        allVariants: variants,
      }));
    });

    setIsLoading(false);
    return allVariants;
  };

  return { getCollection, isLoading, hasMore, error };
};
