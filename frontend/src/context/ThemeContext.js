import React, { createContext, useContext, useState } from 'react';

// Créer le contexte du thème
const ThemeContext = createContext();

// Hook personnalisé pour utiliser le contexte du thème
export const useTheme = () => useContext(ThemeContext);

// Composant qui fournit le contexte du thème
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // "light" ou "dark"

  // Fonction pour changer le thème
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
