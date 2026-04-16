import React, { useContext, useEffect, useState } from 'react';
import { API_URL } from '../config';
import { AuthContext } from '../context/authContext';
import LogoutButton from '../components/LogoutButton';
import LowStockAlert from '../components/LowStockAlert';
import { validRoutes } from '../components/routes';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FiMenu, FiX, FiUser, FiBox, FiFileText, FiUsers, FiDollarSign,
  FiHome, FiSettings, FiTag, FiTruck, FiArchive, FiActivity
} from 'react-icons/fi';

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { name: 'Tableau de bord', path: '/dashboard', icon: FiHome, color: 'from-blue-500 to-indigo-500' },
    ]
  },
  {
    label: 'Commerce',
    items: [
      { name: 'Facturation', path: '/dashboard/factures2', icon: FiFileText, color: 'from-emerald-500 to-teal-500' },
      { name: 'Devis (Proforma)', path: '/dashboard/proformas', icon: FiFileText, color: 'from-cyan-500 to-blue-500' },
      { name: 'Suivi facture client', path: '/dashboard/clients-factures', icon: FiFileText, color: 'from-sky-500 to-cyan-500' },
      { name: 'Clients', path: '/dashboard/clients', icon: FiUser, color: 'from-violet-500 to-purple-500' },
    ]
  },
  {
    label: 'Stock & Produits',
    items: [
      { name: 'Produits', path: '/dashboard/produits', icon: FiBox, color: 'from-violet-600 to-indigo-600' },
      { name: 'Catégories', path: '/dashboard/categories', icon: FiTag, color: 'from-pink-500 to-rose-500' },
      { name: 'Fournisseurs', path: '/dashboard/fournisseurs', icon: FiTruck, color: 'from-orange-500 to-amber-500' },
      { name: 'Entrepôts', path: '/dashboard/entrepots', icon: FiArchive, color: 'from-teal-500 to-cyan-500' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { name: 'Dépenses', path: '/dashboard/depenses', icon: FiDollarSign, color: 'from-red-500 to-rose-500' },
    ]
  },
  {
    label: 'Admin',
    items: [
      { name: 'Utilisateurs', path: '/dashboard/users', icon: FiUsers, color: 'from-indigo-500 to-violet-500' },
      { name: 'Paramètres', path: '/dashboard/settings', icon: FiSettings, color: 'from-gray-500 to-slate-600' },
      { name: 'Historique', path: '/dashboard/logs', icon: FiActivity, color: 'from-indigo-600 to-blue-700' },
    ]
  }
];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [image, setImage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.image) setImage(user.image);
    
  }, [user, navigate]);

  const [hasAccess, setHasAccess] = useState(true);

  const checkAccess = (path) => {
    if (user?.role === 'SuperAdmin') return true;
    const allowed = user?.permissions || validRoutes[user?.role] || [];
    return allowed.some(p => {
      if (p === '/dashboard') {
         return path === '/dashboard' || path === '/dashboard/';
      }
      return path === p || path.startsWith(p + '/');
    });
  };

  useEffect(() => {
    if (user) {
      if (!checkAccess(location.pathname)) {
        setHasAccess(false);
      } else {
        setHasAccess(true);
        localStorage.setItem('lastVisitedPath', location.pathname);
      }
    }
  }, [location.pathname, user]);

  const groups = NAV_GROUPS

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-xl lg:hidden shadow-lg"
      >
        {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`fixed lg:relative w-72 lg:w-64 bg-slate-900 text-white flex flex-col transform transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      } h-screen z-40 overflow-hidden`}>

        {/* Brand / Logo area */}
        <div className="px-5 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <img src="/soa.png" alt="" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">GE-SOA</p>
              <p className="text-white/40 text-xs">Gestion de Grossiste</p>
            </div>
          </div>
        </div>

        {/* User profile */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {image ? (
              <img src={`${API_URL}/uploads/${image}`} alt="User"
                className="w-9 h-9 rounded-xl object-cover border-2 border-white/20" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center border border-white/10">
                <FiUser className="text-white/70" size={16} />
              </div>
            )}
            <div className="overflow-hidden">
              <p className="font-semibold text-sm text-white truncate">{user?.nom} {user?.prenom}</p>
              <p className="text-xs text-white/40 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin">
          {groups.map(group => (
            <div key={group.label} className="mb-4">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-1.5">{group.label}</p>
              <ul className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const hasLinkAccess = checkAccess(item.path);
                  return (
                    <li key={item.path}>
                      {hasLinkAccess ? (
                        <Link
                          to={item.path}
                          onClick={() => { closeSidebar(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                            isActive
                              ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg'
                              : 'text-white/50 hover:text-white hover:bg-white/8'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                            <Icon size={14} />
                          </div>
                          <span className="font-medium truncate flex-1">{item.name}</span>
                          {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60"></span>}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group opacity-50 grayscale cursor-not-allowed text-white/50">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5">
                            <Icon size={14} />
                          </div>
                          <span className="font-medium truncate flex-1">{item.name}</span>
                          <span className="ml-auto text-xs text-white/40">🔒</span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <LogoutButton
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/8 rounded-xl transition"
            onClick={closeSidebar}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto h-screen bg-gray-50">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mb-4">
            <LowStockAlert />
          </div>
          <div className="relative w-full min-h-[500px]">
            {!hasAccess ? (
               <div className="flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-gray-200/50 shadow-sm transition-all duration-500 min-h-[500px]">
                  <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-50 text-center max-w-sm transform scale-100 animate-fade-in-up">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <FiX className="text-3xl text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h3>
                    <p className="text-gray-500 mb-6 text-sm">Vous n'avez pas les permissions nécessaires pour afficher ou modifier cette page.</p>
                  </div>
               </div>
            ) : (
              <div className="transition-all duration-500">
                <Outlet />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;