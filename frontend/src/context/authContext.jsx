import React, { createContext, useState, useContext, useEffect } from 'react';

export const AuthContext = createContext({
  user: null,
  setUser: () => null,
  isLoading: true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false); // Fin du chargement
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('userId', userData.id); // Stocke seulement l'ID de l'utilisateur
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId'); // Supprime l'ID de l'utilisateur
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    // Met à jour l'utilisateur dans le localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
