import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layout & Pages
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Label from './pages/Label';
import Brands from './pages/Brands';
import Categories from './pages/Categories';
import Stock from './pages/Stock';
import StockForm from './pages/StockForm';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Root Route */}
      <Route path="/" element={<Navigate to="/dashboard/label" replace />} />

      {/* Auth Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="label" replace />} />
        <Route path="label" element={<Label />} />
        <Route path="brands" element={<Brands />} />
        <Route path="category" element={<Categories />} />
        <Route path="stock" element={<Stock />} />
        <Route path="stock/new" element={<StockForm />} />
        <Route path="stock/edit/:id" element={<StockForm />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#171717',
              color: '#fff',
              border: '1px solid #262626',
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
