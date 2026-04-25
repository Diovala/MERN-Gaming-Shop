import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { MyProvider } from './contexts/MyProvider.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import ProductList from './pages/ProductList.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Myprofile from './pages/Myprofile.jsx';
import Myorders from './pages/Myorders.jsx';
import './index.css';

// Component con để lấy location
function AppRoutes() {
  const location = useLocation();
  
  return (
    <>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 600px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/product/category/:cid" element={<ProductList />} />
          <Route path="/product/search/:keyword" element={<ProductList />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login location={location} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/myprofile" element={<Myprofile />} />
          <Route path="/myorders" element={<Myorders />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MyProvider>
        <AppRoutes />
      </MyProvider>
    </BrowserRouter>
  );
}

export default App;