import { useState, useEffect } from 'react';
import api from '../api/axios';

const useFetchProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/products');
      // Asumsi: response.data berisi array produk
      setProducts(response.data.products); 
    } catch (err) {
      console.error("Error fetching products:", err);
      // Logic handle 401/logout sebaiknya ada di global interceptor
      setError("Gagal memuat data produk. Cek koneksi atau izin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, fetchProducts };
};

export default useFetchProducts;