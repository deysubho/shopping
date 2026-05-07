import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';

import { useAdmin } from 'hooks/useAdmin';
import { Button, Loader } from 'components/common';

import styles from './index.module.scss';

const emptyVariant = () => ({
  tempId: uuid(),
  color: '',
  variantPrice: '',
  images: [{ id: uuid(), src: '' }],
  skus: [{ tempId: uuid(), size: '', quantity: '', order: 1 }],
});

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const { createProduct, isLoading } = useAdmin();

  const [productData, setProductData] = useState({
    model: '', type: '', collection: 'products', description: '',
    price: '', slug: '', fit: '',
  });
  const [variants, setVariants] = useState([emptyVariant()]);

  const handleProductChange = (e) => {
    setProductData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleVariantChange = (idx, field, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleImageChange = (vIdx, iIdx, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      const images = [...updated[vIdx].images];
      images[iIdx] = { ...images[iIdx], src: value };
      updated[vIdx] = { ...updated[vIdx], images };
      return updated;
    });
  };

  const handleSkuChange = (vIdx, sIdx, field, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      const skus = [...updated[vIdx].skus];
      skus[sIdx] = { ...skus[sIdx], [field]: value };
      updated[vIdx] = { ...updated[vIdx], skus };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createProduct({ productData, variants });
    navigate('/admin');
  };

  return (
    <>
      {isLoading && <Loader />}
      <section>
        <div className={`${styles.container} main-container`}>
          <h1 className={styles.title}>Add Product</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.section}>
              <h2>Product Info</h2>
              {['model', 'type', 'slug', 'description', 'fit'].map((field) => (
                <label key={field} className={styles.label}>
                  <span>{field}</span>
                  <input className={styles.input} name={field} value={productData[field]} onChange={handleProductChange} required={field !== 'fit'} />
                </label>
              ))}
              <label className={styles.label}>
                <span>price</span>
                <input className={styles.input} name="price" type="number" value={productData.price} onChange={handleProductChange} required />
              </label>
              <label className={styles.label}>
                <span>collection</span>
                <select className={styles.input} name="collection" value={productData.collection} onChange={handleProductChange}>
                  <option value="products">products</option>
                  <option value="t-shirts">t-shirts</option>
                  <option value="hoodies-sweatshirts">hoodies-sweatshirts</option>
                  <option value="accessories">accessories</option>
                </select>
              </label>
            </div>

            {variants.map((variant, vIdx) => (
              <div key={variant.tempId} className={styles.variant_section}>
                <div className={styles.variant_header}>
                  <h2>Variant {vIdx + 1}</h2>
                  {variants.length > 1 && (
                    <button type="button" className={styles.remove_btn} onClick={() => setVariants((p) => p.filter((_, i) => i !== vIdx))}>
                      Remove
                    </button>
                  )}
                </div>
                <label className={styles.label}>
                  <span>color</span>
                  <input className={styles.input} value={variant.color} onChange={(e) => handleVariantChange(vIdx, 'color', e.target.value)} required />
                </label>
                <label className={styles.label}>
                  <span>variant price</span>
                  <input className={styles.input} type="number" value={variant.variantPrice} onChange={(e) => handleVariantChange(vIdx, 'variantPrice', e.target.value)} required />
                </label>

                <h3 className={styles.sub_title}>Images</h3>
                {variant.images.map((img, iIdx) => (
                  <label key={img.id} className={styles.label}>
                    <span>image {iIdx + 1} src</span>
                    <input className={styles.input} value={img.src} onChange={(e) => handleImageChange(vIdx, iIdx, e.target.value)} placeholder="/src/assets/images/..." />
                  </label>
                ))}
                <button type="button" className={styles.add_btn} onClick={() => handleVariantChange(vIdx, 'images', [...variant.images, { id: uuid(), src: '' }])}>
                  + Add Image
                </button>

                <h3 className={styles.sub_title}>SKUs</h3>
                {variant.skus.map((sku, sIdx) => (
                  <div key={sku.tempId} className={styles.sku_row}>
                    <label className={styles.label}>
                      <span>size</span>
                      <input className={styles.input} value={sku.size} onChange={(e) => handleSkuChange(vIdx, sIdx, 'size', e.target.value)} placeholder="xs/s/m/l/xl or null" />
                    </label>
                    <label className={styles.label}>
                      <span>quantity</span>
                      <input className={styles.input} type="number" value={sku.quantity} onChange={(e) => handleSkuChange(vIdx, sIdx, 'quantity', e.target.value)} required />
                    </label>
                    {variant.skus.length > 1 && (
                      <button type="button" className={styles.remove_btn} onClick={() => handleSkuChange(vIdx, sIdx, '_remove', true)}>×</button>
                    )}
                  </div>
                ))}
                <button type="button" className={styles.add_btn} onClick={() => handleVariantChange(vIdx, 'skus', [...variant.skus, { tempId: uuid(), size: '', quantity: '', order: variant.skus.length + 1 }])}>
                  + Add SKU
                </button>
              </div>
            ))}

            <button type="button" className={styles.add_variant_btn} onClick={() => setVariants((p) => [...p, emptyVariant()])}>
              + Add Variant
            </button>

            <Button type="submit" className={styles.submit_btn}>Save Product</Button>
          </form>
        </div>
      </section>
    </>
  );
};

export default AdminAddProduct;
