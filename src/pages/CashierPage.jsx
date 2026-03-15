import React, { useState } from 'react';
import useFetchProducts from '../hooks/useFetchProducts';
import useCartStore from '../store/useCartStore'; // Import Store Zustand
import api from '../api/axiosInstance'; // Untuk request transaksi

const CashierPage = () => {
  // Hooks dari Zustand dan Custom Hook
  const { products, loading, error } = useFetchProducts();
  const { cartItems, total, addItem, removeItem, clearCart } = useCartStore();
  
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [transactionMessage, setTransactionMessage] = useState('');

  // --- LOGIKA TRANSAKSI ---

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Keranjang belanja kosong!");
      return;
    }
    if (paymentAmount < total) {
      alert("Jumlah pembayaran kurang dari total!");
      return;
    }

    // Format request sesuai kebutuhan backend Go (TransactionRequest)
    const requestBody = {
        payment_method: "cash",
        cash: parseFloat(paymentAmount),
        discount: 0,
      items: cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    //   total_paid: parseFloat(paymentAmount),
    };

    try {
      // POST ke endpoint transaksi Go (Token JWT otomatis terkirim)
      const response = await api.post('/transactions', requestBody);
      
      const change = response.data.change || (paymentAmount - total); // Ambil kembalian dari BE jika ada
      
      setTransactionMessage(`Pembayaran berhasil! Total Kembalian: ${change.toLocaleString('id-ID')}`);
      clearCart(); // Kosongkan keranjang setelah sukses
      setPaymentAmount(0);
      
      // Refresh produk untuk update stok (Opsional, tapi disarankan)
      // Perlu menambahkan fetchProducts ke return value dari useFetchProducts
      // refreshProducts(); 
      
    } catch (err) {
      console.error("Gagal melakukan transaksi:", err.response?.data);
      const errorMessage = err.response?.data?.error || "Transaksi Gagal. Cek stok atau koneksi.";
      setTransactionMessage(`Error: ${errorMessage}`);
    }
  };

  const changeDue = paymentAmount > total ? paymentAmount - total : 0;

  // --- RENDERING ---

  if (loading) return <div>Memuat produk...</div>;
  if (error) return <div>Error memuat data: {error}</div>;

  return (
    <div style={{ display: 'flex', height: '90vh', padding: '10px' }}>
      
      {/* Kolom Kiri: Daftar Produk */}
      <div style={{ flex: 2, paddingRight: '20px', borderRight: '1px solid #ccc' }}>
        <h2>Daftar Produk</h2>
        {products.map(product => (
          <div 
            key={product.id} 
            onClick={() => addItem(product, 1)} // KLIK untuk menambah ke keranjang
            style={{ 
              border: '1px solid #eee', 
              padding: '10px', 
              margin: '5px 0', 
              cursor: 'pointer',
              backgroundColor: product.stock === 0 ? '#fdd' : '#fff'
            }}
          >
            <p><strong>{product.name}</strong> - {product.price.toLocaleString('id-ID')}</p>
            <small>SKU: {product.sku} | Stok: {product.stock}</small>
            {product.stock === 0 && <span style={{color: 'red'}}> (HABIS)</span>}
          </div>
        ))}
      </div>

      {/* Kolom Kanan: Keranjang & Checkout */}
      <div style={{ flex: 1, paddingLeft: '20px' }}>
        <h2>Keranjang Belanja</h2>
        {transactionMessage && <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid green', color: 'green' }}>{transactionMessage}</div>}

        {cartItems.length === 0 ? (
          <p>Keranjang kosong. Klik produk di sebelah kiri.</p>
        ) : (
          <div>
            {cartItems.map(item => (
              <div key={item.id} style={{ borderBottom: '1px dotted #ccc', padding: '5px 0' }}>
                <p>{item.name} x {item.quantity} 
                  <small style={{ float: 'right' }}>{(item.price * item.quantity).toLocaleString('id-ID')}</small>
                </p>
                <button onClick={() => removeItem(item.id)} style={{ fontSize: '10px', padding: '2px 5px' }}>Hapus</button>
              </div>
            ))}

            <h3 style={{ marginTop: '20px' }}>Total: {total.toLocaleString('id-ID')}</h3>
            
            {/* Input Pembayaran */}
            <div style={{ marginTop: '20px' }}>
              <label>Uang Tunai Diterima:</label>
              <input 
                type="number" 
                value={paymentAmount} 
                onChange={(e) => setPaymentAmount(e.target.value)} 
                style={{ width: '100%', padding: '10px', margin: '5px 0' }}
              />
            </div>

            {paymentAmount > total && (
              <h4 style={{ color: 'blue' }}>Kembalian: {changeDue.toLocaleString('id-ID')}</h4>
            )}

            <button 
              onClick={handleCheckout} 
              disabled={paymentAmount < total || cartItems.length === 0}
              style={{ padding: '10px 20px', width: '100%', backgroundColor: 'green', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              Proses Pembayaran
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierPage;