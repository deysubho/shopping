import { useState, useEffect } from 'react';

import { useCollection } from 'hooks/useCollection';
import { ProductCard, Loader } from 'components/common';

import styles from './index.module.scss';

export const HomePage = () => {
  const { getCollection, isLoading } = useCollection();
  const [products, setProducts] = useState(null);

  useEffect(() => {
    (async () => {
      const variants = await getCollection({ sortBy: { field: 'createdAt', direction: 'asc' } });
      setProducts(variants);
    })();
  }, []);

  return (
    <section className={styles.section}>
      {!products && <Loader />}
      {products && (
        <div className={`main-container ${styles.container}`}>
          <div className={styles.grid}>
            {products.map((p) => (
              <div key={p.id} className={styles.card}>
                <ProductCard
                  productId={p.productId}
                  variantId={p.variantId}
                  model={p.model}
                  color={p.color}
                  discount={p.discount}
                  currentPrice={p.price}
                  actualPrice={p.actualPrice}
                  type={p.type}
                  slides={p.slides}
                  images={p.images}
                  numberOfVariants={p.numberOfVariants}
                  skus={p.skus}
                  isSoldOut={p.isSoldOut}
                  allVariants={p.allVariants}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default HomePage;
