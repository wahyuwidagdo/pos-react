import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useLocation } from 'react-router-dom';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      // Asumsi: Response Go Anda mengembalikan array langsung atau di dalam key 'categories'
      setCategories(response.data.data || response.data); 
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Gagal memuat data kategori.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- LOGIKA CREATE ---
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName) return;

    try {
      await api.post('/categories', { name: newCategoryName });
      setNewCategoryName('');
      fetchCategories(); // Refresh data
    } catch (err) {
      alert(`Gagal menambah kategori: ${err.response?.data?.error || 'Duplikasi atau server error'}`);
    }
  };
  
  // --- LOGIKA UPDATE ---
  const handleUpdateCategory = async (id) => {
    try {
      await api.put(`/categories/${id}`, { name: editingName });
      setEditingId(null); // Keluar dari mode edit
      fetchCategories(); // Refresh data
    } catch (err) {
      alert(`Gagal mengedit kategori: ${err.response?.data?.error || 'Server error'}`);
    }
  };
  
  // --- LOGIKA DELETE ---
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Anda yakin ingin menghapus kategori ini?")) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories(); // Refresh data
    } catch (err) {
      alert(`Gagal menghapus kategori: ${err.response?.data?.error || 'Server error'}`);
    }
  };

  if (loading) return <div>Memuat kategori...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Manajemen Kategori</h1>
      
      {/* Form Tambah Kategori */}
      <div style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
        <h3>Tambah Kategori Baru</h3>
        <form onSubmit={handleCreateCategory}>
          <input 
            type="text" 
            value={newCategoryName} 
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nama Kategori (misalnya: Minuman)"
            required
            style={{ padding: '8px', marginRight: '10px' }}
          />
          <button type="submit" style={{ padding: '8px 15px' }}>Tambah</button>
        </form>
      </div>

      {/* Daftar Kategori */}
      <h3>Daftar Kategori ({categories.length})</h3>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
        <thead>
          <tr>
            <th style={{ width: '50px' }}>ID</th>
            <th>Nama Kategori</th>
            <th style={{ width: '150px' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>
                {editingId === cat.id ? (
                  <input 
                    type="text" 
                    value={editingName} 
                    onChange={(e) => setEditingName(e.target.value)}
                    style={{ width: '90%' }}
                  />
                ) : (
                  cat.name
                )}
              </td>
              <td>
                {editingId === cat.id ? (
                  <>
                    <button onClick={() => handleUpdateCategory(cat.id)} style={{ marginRight: '5px' }}>Simpan</button>
                    <button onClick={() => setEditingId(null)}>Batal</button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditingName(cat.name);
                      }} 
                      style={{ marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDeleteCategory(cat.id)}>Hapus</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryPage;