import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useAdmin } from 'hooks/useAdmin';

import { Loader, ConfirmModal, CenterModal } from 'components/common';

import styles from './index.module.scss';

const AdminPage = () => {
  const { getAllProducts, deleteProduct, isLoading } = useAdmin();
  const [products, setProducts] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    setProducts(getAllProducts() || []);
  }, []);

  const handleDelete = async () => {
    await deleteProduct(confirmId);
    setConfirmId(null);
    setProducts(getAllProducts() || []);
  };

  return (
    <>
      {isLoading && <Loader />}
      <CenterModal close={() => setConfirmId(null)}>
        {confirmId && (
          <ConfirmModal
            handleConfirm={handleDelete}
            handleCancel={() => setConfirmId(null)}
            text="Are you sure you want to delete this product?"
          />
        )}
      </CenterModal>
      <section>
        <div className={`${styles.container} main-container`}>
          <div className={styles.header}>
            <h1>Admin Panel</h1>
            <Link to="/admin/products/add" className={styles.add_button}>
              + Add Product
            </Link>
          </div>
          {products && products.length === 0 && (
            <p className={styles.empty}>No products yet.</p>
          )}
          {products && products.length > 0 && (
            <div className={styles.list}>
              {products.map((product) => (
                <div key={product.id} className={styles.row}>
                  <div className={styles.info}>
                    <span className={styles.model}>{product.model} {product.type}</span>
                    <span className={styles.meta}>{product.collection} — ${product.price}</span>
                    <span className={styles.meta}>{product.variants.length} variant(s)</span>
                  </div>
                  <div className={styles.actions}>
                    <Link to={`/admin/products/${product.id}`} className={styles.edit_button}>
                      Edit
                    </Link>
                    <button
                      className={styles.delete_button}
                      onClick={() => setConfirmId(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default AdminPage;
