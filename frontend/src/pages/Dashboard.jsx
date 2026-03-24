import React, { useContext, useEffect, useState } from 'react';
import { API_URL } from '../config';
import { AuthContext } from '../context/authContext';
import LogoutButton from '../components/LogoutButton';
import LowStockAlert from '../components/LowStockAlert';
import { validRoutes } from '../components/routes'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiBox, FiFileText, FiUsers, FiDollarSign, FiHome, FiSettings, FiTag, FiTruck } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [menu, setMenu] = useState([]);
  const [image, setImage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Icônes – taille légèrement réduite pour plus de compacité
  const menuIcons = {
    'Tableau de bord': <FiHome className="mr-3" size={18} />,
    'Utilisateurs': <FiUsers className="mr-3" size={18} />,
    'Clients': <FiUser className="mr-3" size={18} />,
    'Catégories': <FiTag className="mr-3" size={18} />,
    'Produits': <FiBox className="mr-3" size={18} />,
    'Facturation': <FiFileText className="mr-3" size={18} />,
    'Devis (Proforma)': <FiFileText className="mr-3" size={18} />,
    'Paramètres': <FiSettings className="mr-3" size={18} />,
    'Dépenses': <FiDollarSign className="mr-3" size={18} />,
    'Fournisseurs': <FiTruck className="mr-3" size={18} />,
    'Suivi facture client': <FiFileText className="mr-3" size={18} />
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user && user.image) {
      setImage(user.image);
    }

    let newMenu = [
      { name: 'Tableau de bord', path: '/dashboard' },
      { name: 'Facturation', path: '/dashboard/factures2' },
      { name: 'Devis (Proforma)', path: '/dashboard/proformas' },
      { name: 'Clients', path: '/dashboard/clients' },
      { name: 'Fournisseurs', path: '/dashboard/fournisseurs' },
      { name: 'Catégories', path: '/dashboard/categories' },
      { name: 'Produits', path: '/dashboard/produits' },
      { name: 'Suivi facture client', path: '/dashboard/clients-factures' },
      { name: 'Dépenses', path: '/dashboard/depenses' }
    ];

    if (user.role === 'SuperAdmin') {
      newMenu.push({ name: 'Utilisateurs', path: '/dashboard/users' });
    }

    newMenu.push({ name: 'Paramètres', path: '/dashboard/settings' });

    setMenu(newMenu);
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      const allowedRoutes = validRoutes[user.role];
      const isRouteValid = allowedRoutes.includes(location.pathname);

      if (isRouteValid) {
        localStorage.setItem('lastVisitedPath', location.pathname);
      } else {
        navigate('/dashboard');
      }
    }
  }, [location.pathname, user, navigate]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md lg:hidden focus:outline-none transition-all duration-200 hover:bg-blue-700 shadow-md"
      >
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:relative w-72 lg:w-64 bg-white text-gray-800 flex flex-col transform transition-all duration-300 ease-in-out border-r border-gray-200 ${isSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'
          } h-screen z-40 overflow-hidden`}
      >
        {/* Profil utilisateur - Section fixe en haut */}
        <div className="p-6 pb-2">
          <div className="flex items-center p-1.5 bg-blue-50 rounded-lg">
            {image ? (
              <img
                src={`${API_URL}/uploads/${image}`}
                alt="User"
                className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-blue-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3 border-2 border-blue-200">
                <FiUser className="text-blue-500" size={22} />
              </div>
            )}
            <div className="overflow-hidden">
              <h2 className="font-semibold text-base text-gray-800 truncate">
                {user?.nom} {user?.prenom}
              </h2>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Menu de navigation - Section défilante au milieu */}
        <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
          <nav>
            <ul className="space-y-1.5">
              {menu.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => {
                      closeSidebar();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-center p-2 text-sm rounded-lg transition-all duration-200 ${location.pathname === item.path
                      ? 'bg-blue-100 text-blue-600 font-medium'
                      : 'hover:bg-gray-100 text-gray-600'
                      }`}
                  >
                    {menuIcons[item.name]}
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Déconnexion - Section fixe en bas */}
        <div className="p-6 pt-4 border-t border-gray-100">
          <LogoutButton
            className="w-full flex items-center justify-center p-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            onClick={closeSidebar}
          />
        </div>
      </div>

      {/* Contenu principal - espacements réduits */}
      <div className="flex-1 overflow-y-auto h-screen bg-gray-50">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Alerte stock bas - marge réduite */}
          <div className="mb-4">
            <LowStockAlert />
          </div>

          {/* Page content - Removed the forced white card for more layout flexibility */}
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;