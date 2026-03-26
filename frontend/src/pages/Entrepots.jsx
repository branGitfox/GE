import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { FaWarehouse, FaStore, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSearch } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmModal from '../components/ConfirmModal';

const EMPTY = { nom: '', type: 'entrepôt', description: '' };

const Entrepots = () => {
    const [entrepots, setEntrepots] = useState([]);
    const [formData, setFormData] = useState(EMPTY);
    const [editing, setEditing] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [confirmId, setConfirmId] = useState(null);

    useEffect(() => { fetchEntrepots(); }, []);

    const fetchEntrepots = async () => {
        try {
            const r = await axios.get(`${API_URL}/api/entrepots`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setEntrepots(r.data);
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nom.trim()) { toast.error('Le nom est requis'); return; }
        setIsLoading(true);
        try {
            if (editing) {
                await axios.put(`${API_URL}/api/entrepots/${editing}`, formData);
                toast.success('Entrepôt mis à jour ✅');
            } else {
                await axios.post(`${API_URL}/api/entrepots`, formData);
                toast.success('Entrepôt créé ✅');
            }
            setFormData(EMPTY);
            setEditing(null);
            fetchEntrepots();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Erreur');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (e) => {
        setEditing(e.id);
        setFormData({ nom: e.nom, type: e.type, description: e.description || '' });
    };

    const handleDelete = async () => {
        if (!confirmId) return;
        setIsLoading(true);
        try {
            await axios.delete(`${API_URL}/api/entrepots/${confirmId}`);
            toast.success('Entrepôt supprimé ✅');
            fetchEntrepots();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Erreur suppression');
        } finally {
            setIsLoading(false); setConfirmId(null);
        }
    };

    const filtered = entrepots.filter(e =>
        e.nom.toLowerCase().includes(search.toLowerCase()) ||
        e.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Hero Header */}
            <div className="bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 rounded-2xl p-6 mb-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <FaWarehouse className="text-white/80" /> Entrepôts & Magasins
                        </h1>
                        <p className="text-white/70 text-sm mt-1">Gérez les localisations de vos produits et le stock centralisé</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 text-center">
                            <p className="text-xl font-bold text-white leading-none">{entrepots.length}</p>
                            <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider mt-1">Sites</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                            {editing ? <FaEdit className="text-white text-sm" /> : <FaPlus className="text-white text-sm" />}
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-sm">{editing ? 'Modifier' : 'Nouveau'}</h2>
                            <p className="text-white/60 text-xs">{editing ? 'Modifier les informations' : 'Créer un entrepôt ou magasin'}</p>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nom *</label>
                            <input type="text" value={formData.nom} onChange={e => setFormData(p => ({ ...p, nom: e.target.value }))}
                                placeholder="Ex: Entrepôt Central, Boutique Nord…" required
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['entrepôt', 'magasin'].map(t => (
                                    <button key={t} type="button" onClick={() => setFormData(p => ({ ...p, type: t }))}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${formData.type === t ? (t === 'entrepôt' ? 'bg-teal-50 border-teal-400 text-teal-700' : 'bg-amber-50 border-amber-400 text-amber-700') : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                                        {t === 'entrepôt' ? <FaWarehouse size={13} /> : <FaStore size={13} />}
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                            <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                placeholder="Description optionnelle…" rows="3"
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none" />
                        </div>
                        <div className="flex gap-2 pt-1">
                            {editing && (
                                <button type="button" onClick={() => { setEditing(null); setFormData(EMPTY); }}
                                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition flex items-center gap-1">
                                    <FaTimes size={11} /> Annuler
                                </button>
                            )}
                            <button type="submit" disabled={isLoading}
                                className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl text-sm font-semibold transition shadow-md flex items-center justify-center gap-2">
                                {editing ? <FaSave size={13} /> : <FaPlus size={13} />}
                                {editing ? 'Enregistrer' : 'Créer'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Search */}
                    <div className="relative max-w-sm">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition shadow-sm" />
                    </div>

                    {filtered.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                            <FaWarehouse className="text-4xl text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">{search ? 'Aucun résultat.' : 'Aucun entrepôt créé.'}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filtered.map(e => (
                                <div key={e.id}
                                    className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col gap-3 hover:shadow-md transition ${e.type === 'magasin' ? 'border-amber-100' : 'border-teal-100'}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${e.type === 'magasin' ? 'bg-amber-100' : 'bg-teal-100'}`}>
                                                {e.type === 'magasin' ? <FaStore className="text-amber-600" /> : <FaWarehouse className="text-teal-600" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{e.nom}</p>
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.type === 'magasin' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'}`}>
                                                    {e.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => startEdit(e)}
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                                                <FaEdit size={13} />
                                            </button>
                                            <button onClick={() => setConfirmId(e.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                                <FaTrash size={13} />
                                            </button>
                                        </div>
                                    </div>
                                    {e.description && <p className="text-xs text-gray-500 leading-relaxed">{e.description}</p>}
                                    <div className={`text-xs font-semibold px-2 py-1 rounded-lg self-start ${e.type === 'magasin' ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-teal-600'}`}>
                                        {e.nb_produits || 0} produit{e.nb_produits !== 1 ? 's' : ''} affecté{e.nb_produits !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={!!confirmId}
                onClose={() => setConfirmId(null)}
                onConfirm={handleDelete}
                title="Supprimer l'entrepôt"
                message="Êtes-vous sûr de vouloir supprimer cet entrepôt ?"
                isLoading={isLoading}
            />
        </div>
    );
};

export default Entrepots;
