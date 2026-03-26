import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { FiActivity, FiSearch, FiFilter, FiUser, FiClock, FiFileText, FiTag, FiBox } from 'react-icons/fi';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/logs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(response.data);
            setLoading(true);
        } catch (error) {
            console.error("Erreur lors de la récupération des logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (type) => {
        switch (type) {
            case 'add': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">Ajout</span>;
            case 'edit':
            case 'update': 
            case 'backup':
            case 'backup_import':
            case 'reset':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">Action Système</span>;
            case 'delete': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200">Suppression</span>;
            default: return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{type}</span>;
        }
    };

    const getEntityIcon = (type) => {
        switch (type) {
            case 'produit': return <FiBox className="text-indigo-500" />;
            case 'facture': return <FiFileText className="text-emerald-500" />;
            case 'client': return <FiUser className="text-violet-500" />;
            case 'category':
            case 'categorie': return <FiTag className="text-pink-500" />;
            case 'depense': return <FiFileText className="text-amber-500" />;
            case 'fournisseur': return <FiUser className="text-orange-500" />;
            case 'entrepot': return <FiBox className="text-blue-500" />;
            case 'user': return <FiUser className="text-red-500" />;
            case 'system': return <FiActivity className="text-indigo-500" />;
            default: return <FiActivity className="text-slate-400" />;
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (log.user_nom && log.user_nom.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterType === 'all' || 
                             (filterType === 'edit' && (log.action_type === 'edit' || log.action_type === 'update')) ||
                             log.action_type === filterType;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Historique d'activité</h1>
                    <p className="text-slate-500 text-sm">Suivez toutes les actions effectuées sur le système</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher..." 
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all w-64 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="relative">
                        <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select 
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer shadow-sm"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">Toutes les actions</option>
                            <option value="add">Ajouts</option>
                            <option value="edit">Modifications</option>
                            <option value="delete">Suppressions</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Heure</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Entité</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-6 h-16 bg-slate-50/50"></td>
                                    </tr>
                                ))
                            ) : filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                <FiClock className="text-slate-400" size={14} />
                                                {new Date(log.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                    {log.user_nom?.[0]}{log.user_prenom?.[0]}
                                                </div>
                                                <div className="text-sm font-semibold text-slate-700">
                                                    {log.user_nom} {log.user_prenom}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getActionBadge(log.action_type)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 capitalize">
                                                {getEntityIcon(log.entity_type)}
                                                {log.entity_type}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-700 leading-relaxed max-w-md">
                                                {log.description}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-slate-50 rounded-full">
                                                <FiActivity className="text-slate-300" size={32} />
                                            </div>
                                            <p className="text-slate-500 font-medium">Aucun historique trouvé</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Logs;
