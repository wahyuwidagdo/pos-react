import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3000/api/v1'; // <-- SESUAIKAN DENGAN PORT GO ANDA

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Bersihkan error sebelumnya

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });

      // 1. Ambil Token dari response Go
      const token = response.data.token; 
      
      // 2. Simpan Token ke Local Storage
      localStorage.setItem('token', token); 
      
      // 3. Arahkan ke Halaman Utama
      navigate('/'); 

    } catch (err) {
      // Handle error (misalnya 401 Unauthorized dari Go)
      const errorMessage = err.response?.data?.error || 'Kredensial tidak valid atau server bermasalah.';
      setError(errorMessage);
    }
  };

  return (
    <div>
      <h2>Halaman Login POS</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;