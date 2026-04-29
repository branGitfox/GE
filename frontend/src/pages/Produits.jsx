import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { FaSearch, FaPlus, FaList, FaBox, FaChartBar, FaExclamationTriangle } from 'react-icons/fa';
import ProduitForm from '../components/produits/ProduitForm';
import ProduitTable from '../components/produits/ProduitTable';
import ConfirmModal from '../components/ConfirmModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EMPTY_FORM = {
    nom: '', description: '', stock_cartons: 0, stock_pieces: 0,
    prix_carton: 0, prix_piece: 0, pieces_par_carton: 1, prix_achat: 0,
    prix_achat_piece: 0, unité: 'Pièce', nom_unite_gros: 'Carton',
    category_id: '', fournisseur_id: '', fournisseur_ids: [], entrepot_ids: [],
    importSourceId: null, stock_threshold: 0
};

const Produits = () => {
    const [produits, setProduits] = useState([]);
    const [filteredProduits, setFilteredProduits] = useState([]);
    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem('produitFormDataDraft');
        return saved ? JSON.parse(saved) : EMPTY_FORM;
    });
    const [editingProduit, setEditingProduit] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add'

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [produitToDelete, setProduitToDelete] = useState(null);
    const [isImportConflictModalOpen, setIsImportConflictModalOpen] = useState(false);
    const [pendingImportData, setPendingImportData] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    const formRef = useRef(null);
    const topRef = useRef(null);

    useEffect(() => { fetchProduits(); }, []);

    useEffect(() => {
        if (topRef.current) topRef.current.scrollIntoView({ behavior: 'auto' });
    }, []);

    useEffect(() => {
        if (!editingProduit) {
            localStorage.setItem('produitFormDataDraft', JSON.stringify(formData));
        }
    }, [formData, editingProduit]);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        const results = produits.filter(p =>
            p.nom.toLowerCase().includes(lower) ||
            (p.description || '').toLowerCase().includes(lower) ||
            String(p.quantite).includes(searchTerm) ||
            String(p.prix_carton).includes(searchTerm)
        );
        setFilteredProduits(results);
        setCurrentPage(1);
    }, [searchTerm, produits]);

    const fetchProduits = async () => {
        try {
            const r = await axios.get(`${API_URL}/api/produits`);
            setProduits(r.data || []);
            setFilteredProduits(r.data || []);
        } catch (e) {
            console.error('Erreur récupération produits:', e);
            setProduits([]);
            setFilteredProduits([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const quantiteTotale =
            (parseFloat(formData.stock_cartons || 0) * parseFloat(formData.pieces_par_carton || 1)) +
            parseFloat(formData.stock_pieces || 0);

        if (parseFloat(formData.prix_carton || 0) <= 0) {
            toast.error(`Le prix de vente (${formData.nom_unite_gros || 'Gros'}) doit être > 0`);
            setIsLoading(false); return;
        }
        if (formData.pieces_par_carton > 1 && parseFloat(formData.prix_piece || 0) <= 0) {
            toast.error(`Le prix détail (${formData.unité || 'Détail'}) doit être > 0`);
            setIsLoading(false); return;
        }

        const dataToSend = {
            ...formData,
            quantite: quantiteTotale,
            // Ensure backward compat: send first fournisseur_id as single field too
            fournisseur_id: (formData.fournisseur_ids || []).length > 0 ? formData.fournisseur_ids[0] : formData.fournisseur_id || ''
        };

        try {
            const url = editingProduit
                ? `${API_URL}/api/produits/${editingProduit}`
                : `${API_URL}/api/produits`;
            const method = editingProduit ? 'put' : 'post';

            await axios[method](url, dataToSend, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            toast.success(editingProduit ? 'Produit modifié ✅' : 'Produit ajouté ✅');
            setFormData(EMPTY_FORM);
            localStorage.removeItem('produitFormDataDraft');
            setEditingProduit(null);
            fetchProduits();
            setSearchTerm('');
            setActiveTab('list');
        } catch (error) {
            if (error.response?.status === 409 && formData.importSourceId) {
                setPendingImportData(dataToSend);
                setIsImportConflictModalOpen(true);
                setIsLoading(false); return;
            }
            toast.error(error.response?.data?.message || error.message || "Erreur lors de l'opération");
        } finally {
            setIsLoading(false);
        }
    };

    const confirmImportConflict = async () => {
        setIsImporting(true);
        try {
            await axios.post(`${API_URL}/api/produits`, { ...pendingImportData, updateExisting: true }, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Stock mis à jour via importation ✅');
            setFormData(EMPTY_FORM);
            localStorage.removeItem('produitFormDataDraft');
            fetchProduits();
            setActiveTab('list');
        } catch (err) {
            toast.error('Erreur lors de la mise à jour');
        } finally {
            setIsImporting(false);
            setIsImportConflictModalOpen(false);
            setPendingImportData(null);
        }
    };

    const handleEdit = (produit) => {
        setEditingProduit(produit.id);
        setFormData({
            nom: produit.nom,
            description: produit.description || '',
            stock_cartons: Math.floor(produit.quantite / (produit.pieces_par_carton || 1)),
            stock_pieces: produit.quantite % (produit.pieces_par_carton || 1),
            prix_carton: produit.prix_carton || 0,
            prix_piece: produit.prix_piece || 0,
            pieces_par_carton: produit.pieces_par_carton || 1,
            prix_achat: produit.prix_achat || 0,
            prix_achat_piece: produit.prix_achat_piece || 0,
            unité: produit.unité || 'Pièce',
            nom_unite_gros: produit.nom_unite_gros || 'Carton',
            category_id: produit.category_id || '',
            fournisseur_id: produit.fournisseur_id || '',
            fournisseur_ids: (produit.fournisseurs_list || []).map(f => f.id),
            entrepot_ids: (produit.entrepots_list || []).map(e => e.id),
            stock_threshold: produit.stock_threshold || 0
        });
        setActiveTab('add');
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleDelete = (id) => { setProduitToDelete(id); setIsConfirmModalOpen(true); };

    const confirmDelete = async () => {
        if (!produitToDelete) return;
        setIsLoading(true);
        try {
            await axios.delete(`${API_URL}/api/produits/${produitToDelete}`);
            toast.success('Produit supprimé ✅');
            fetchProduits();
        } catch (err) {
            toast.error(`Erreur suppression: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsLoading(false);
            setIsConfirmModalOpen(false);
            setProduitToDelete(null);
        }
    };

    const handleCancel = () => {
        setFormData(EMPTY_FORM);
        localStorage.removeItem('produitFormDataDraft');
        setEditingProduit(null);
        setActiveTab('list');
    };

    // Quick stats
    const totalProduits = produits.length;
    const ruptureCount = produits.filter(p => p.quantite <= 0).length;
    const lowStockCount = produits.filter(p => {
        const ratio = p.pieces_par_carton || 1;
        const cartons = ratio > 1 ? Math.floor(p.quantite / ratio) : p.quantite;
        return p.stock_threshold > 0 && cartons <= p.stock_threshold && p.quantite > 0;
    }).length;

    return (
        <div ref={topRef}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Hero Header */}
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-2xl p-6 mb-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <FaBox className="text-white/80" /> Gestion des Produits
                        </h1>
                        <p className="text-white/70 text-sm mt-1">Gérez votre catalogue, votre stock et vos fournisseurs</p>
                    </div>
                    {/* Quick Stats */}
                    <div className="flex gap-3 flex-wrap">
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 text-center">
                            <p className="text-2xl font-bold text-white">{totalProduits}</p>
                            <p className="text-white/70 text-xs">Produits</p>
                        </div>
                        {ruptureCount > 0 && (
                            <div className="bg-red-500/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-red-300/30 text-center">
                                <p className="text-2xl font-bold text-white">{ruptureCount}</p>
                                <p className="text-white/70 text-xs">Rupture</p>
                            </div>
                        )}
                        {lowStockCount > 0 && (
                            <div className="bg-amber-500/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-amber-300/30 text-center">
                                <p className="text-2xl font-bold text-white">{lowStockCount}</p>
                                <p className="text-white/70 text-xs flex items-center gap-1"><FaExclamationTriangle size={10} /> Faible</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-5">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'list' ? 'bg-white text-violet-700 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/20'}`}
                    >
                        <FaList size={13} /> Liste des Produits
                    </button>
                    <button
                        onClick={() => { setActiveTab('add'); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'add' ? 'bg-white text-violet-700 shadow-md' : 'text-white/80 hover:text-white hover:bg-white/20'}`}
                    >
                        <FaPlus size={13} />
                        {editingProduit ? 'Modifier Produit' : 'Ajouter un Produit'}
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'list' ? (
                <div>
                    {/* Search bar */}
                    <div className="mb-4 flex items-center gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                type="text"
                                placeholder="Rechercher un produit…"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition shadow-sm"
                            />
                        </div>
                        <span className="text-xs text-gray-400 font-medium">
                            {filteredProduits.length} produit{filteredProduits.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {filteredProduits.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <FaBox className="text-gray-200 text-5xl mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">
                                {searchTerm ? 'Aucun produit correspond à votre recherche.' : 'Aucun produit. Commencez par en ajouter un.'}
                            </p>
                            {!searchTerm && (
                                <button onClick={() => setActiveTab('add')}
                                    className="mt-4 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition shadow-md">
                                    <FaPlus className="inline mr-2" /> Ajouter un produit
                                </button>
                            )}
                        </div>
                    ) : (
                        <ProduitTable
                            filteredProduits={filteredProduits}
                            currentPage={currentPage}
                            itemsPerPage={itemsPerPage}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                            isLoading={isLoading}
                            onPageChange={setCurrentPage}
                            fetchProduits={fetchProduits}
                        />
                    )}
                </div>
            ) : (
                <ProduitForm
                    formData={formData}
                    editingProduit={editingProduit}
                    isLoading={isLoading}
                    handleChange={handleChange}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    formRef={formRef}
                />
            )}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => { setIsConfirmModalOpen(false); setProduitToDelete(null); }}
                onConfirm={confirmDelete}
                title="Supprimer le produit"
                message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
                isLoading={isLoading}
            />
            <ConfirmModal
                isOpen={isImportConflictModalOpen}
                onClose={() => { setIsImportConflictModalOpen(false); setPendingImportData(null); }}
                onConfirm={confirmImportConflict}
                title="Produit Existant"
                message="Ce produit existe déjà. Voulez-vous ajouter la quantité importée au stock existant ?"
                isLoading={isImporting}
            />
        </div>
    );
};

export default Produits;