import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import POS from './pages/POS.jsx';
import Reports from './pages/Reports.jsx';
import Products from './pages/Products.jsx';
import Categories from './pages/Categories.jsx';
import Settings from './pages/Settings.jsx';
import Inventory from './pages/Inventory.jsx';
import CashFlow from './pages/CashFlow.jsx';
import Transactions from './pages/Transactions.jsx';
import useAuthStore from './store/useAuthStore';
import { Center, Text, Stack, Button } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';

// Simple Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Role-based Route Guard
const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();
  const userRole = user?.role?.toLowerCase() || '';

  if (!allowedRoles.some(r => r === userRole)) {
    return (
      <Center h="60vh">
        <Stack align="center" gap="md">
          <IconLock size={48} color="gray" />
          <Text size="xl" fw={700} c="dimmed">Access Denied</Text>
          <Text c="dimmed" size="sm">You don&apos;t have permission to access this page.</Text>
          <Button variant="light" component="a" href="/pos">Go to POS</Button>
        </Stack>
      </Center>
    );
  }
  return children;
};

// Default landing page based on role
const RoleBasedHome = () => {
  const { user } = useAuthStore();
  const role = user?.role?.toLowerCase() || '';

  if (role === 'cashier' || role === 'kasir') {
    return <Navigate to="/pos" replace />;
  }
  return <Dashboard />;
};


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<RoleBasedHome />} />
          <Route path="pos" element={<POS />} />
          <Route path="products" element={
            <RoleRoute allowedRoles={['admin', 'manager']}>
              <Products />
            </RoleRoute>
          } />
          <Route path="categories" element={
            <RoleRoute allowedRoles={['admin', 'manager']}>
              <Categories />
            </RoleRoute>
          } />
          <Route path="reports" element={
            <RoleRoute allowedRoles={['admin', 'manager']}>
              <Reports />
            </RoleRoute>
          } />
          <Route path="inventory" element={
            <RoleRoute allowedRoles={['admin', 'manager']}>
              <Inventory />
            </RoleRoute>
          } />
          <Route path="cash-flow" element={
            <RoleRoute allowedRoles={['admin', 'manager']}>
              <CashFlow />
            </RoleRoute>
          } />
          <Route path="transactions" element={
            <RoleRoute allowedRoles={['admin', 'manager']}>
              <Transactions />
            </RoleRoute>
          } />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;