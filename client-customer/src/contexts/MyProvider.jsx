import { createContext, useState, useEffect, useContext } from 'react';

// ✅ Khai báo context ngay trong file này
export const MyContext = createContext();

export const MyProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCart([]);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const exist = prev.find(item => item._id === product._id);
      if (exist) {
        return prev.map(item => 
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, qty) => {
    if (qty < 1) return removeFromCart(productId);
    setCart(prev => prev.map(item => 
      item._id === productId ? { ...item, quantity: qty } : item
    ));
  };

  const clearCart = () => setCart([]);

  return (
    <MyContext.Provider value={{ 
      token, user, cart, 
      login, logout, 
      addToCart, removeFromCart, updateQuantity, clearCart 
    }}>
      {children}
    </MyContext.Provider>
  );
};