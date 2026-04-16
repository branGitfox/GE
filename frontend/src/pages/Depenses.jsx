import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import {
  FaPlus, FaEdit, FaTrash, FaMoneyBillWave, FaShoppingCart,
  FaTimes, FaExclamationTriangle, FaChevronLeft, FaChevronRight, FaTruck, FaSearch
} from 'react-icons/fa';
import SearchSelect from '../components/factures/SearchSelect';
import PriceInput from '../components/PriceInput';
import ConfirmModal from '../components/ConfirmModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const ITEMS_PER_PAGE = 100;
const Depenses = () => {
  const [depenses, setDepenses] = useState([]);
  const [produitAchats, setProduitAchats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'depense'|'achat', id, nom }
  const [formData, setFormData] = useState({ id: null, nom: '', montant: '', description: '', date: '', type: 'depense', quantite: '', prix_achat: '', unite: 'piece', fournisseur_id: '' });
  const [fournisseurs, setFournisseurs] = useState([]);
  const [produits, setProduits] = useState([]);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [quantiteAjoutee, setQuantiteAjoutee] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination states
  const [depensePage, setDepensePage] = useState(1);
  const [achatPage, setAchatPage] = useState(1);
  const [searchTermDepense, setSearchTermDepense] = useState('');
  const [searchTermAchat, setSearchTermAchat] = useState('');
  const [activeTab, setActiveTab] = useState('diverses'); // 'diverses' or 'approvisionnement'
  const [entrepots, setEntrepots] = useState([]);


  // Calculer le coût total cumulé par produit
  const getEnrichedAchats = () => {
    const byProduct = {};
    const sortedAchats = [...produitAchats].sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
    
    const enriched = {};
    sortedAchats.forEach(achat => {
      const key = achat.produit_id || achat.nom;
      if (!byProduct[key]) byProduct[key] = { cumulative: 0 };
      
      const currentCout = parseFloat(achat.total_cout || 0);
      const previousTotal = byProduct[key].cumulative;
      byProduct[key].cumulative += currentCout;
      
      enriched[achat.id || (achat.nom + achat.created_at)] = {
          running_total: byProduct[key].cumulative,
          previous_total: previousTotal
      };
    });
    return enriched;
  };

  const enrichedDataMap = getEnrichedAchats();
  const DEPENSES_URL = `${API_URL}/api/depenses`;

  useEffect(() => {
    fetchDepenses();
    fetchProduitAchats();
    fetchFournisseurs();
    fetchProduits();
    fetchEntrepots();
  }, []);

  const fetchEntrepots = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/entrepots`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setEntrepots(response.data);
    } catch (error) {
      console.error('Erreur chargement entrepots:', error);
    }
  };

  const fetchProduits = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/produits`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setProduits(response.data);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/fournisseurs`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setFournisseurs(response.data);
    } catch (error) {
      console.error('Erreur chargement fournisseurs:', error);
    }
  };

  const fetchDepenses = async () => {
    try {
      const response = await axios.get(DEPENSES_URL, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setDepenses(response.data);
      setDepensePage(1);
    } catch (error) {
      console.error('Erreur lors de la récupération des dépenses:', error);
      toast.error('Erreur lors du chargement des dépenses.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProduitAchats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/produit-achat/stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setProduitAchats(response.data);
      setAchatPage(1);
    } catch (error) {
      console.error('Erreur chargement produits achat:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.type === 'achat') {
        if (selectedProduit) {
          // Mise à jour d'un produit existant (Approvisionnement)
          const isDetail = formData.unite === (selectedProduit.unité || 'Détail') && selectedProduit.pieces_par_carton > 1;
          const ratio = selectedProduit.pieces_par_carton || 1;
          const quantiteEnPieces = isDetail ? (parseFloat(quantiteAjoutee) || 0) : ((parseFloat(quantiteAjoutee) || 0) * ratio);

          const prixSaisi = parseFloat(formData.prix_achat) || 0;
          const prixGrosNormalise = isDetail ? (prixSaisi * ratio) : prixSaisi;
          const prixDetailCalc = isDetail ? prixSaisi : (prixSaisi / ratio);

          const updateData = {
            nom: formData.nom,
            description: formData.description || 'Approvisionnement via Dépenses',
            quantite: quantiteEnPieces, // Envoyer en PIECES car le backend fait += sur le champ stock (en unités/pièces)
            prix_achat: prixGrosNormalise,
            prix_achat_piece: prixDetailCalc,
            prix_carton: selectedProduit.prix_carton,
            prix_piece: selectedProduit.prix_piece,
            unite: formData.unite,
            date: formData.date,
            fournisseur_id: formData.fournisseur_id,
            entrepot_id: formData.entrepot_id,
            updateExisting: true,
            pieces_par_carton: selectedProduit.pieces_par_carton,
            historique_achat: {
              quantite: parseFloat(quantiteAjoutee) || 0,
              prix_achat: prixSaisi,
              unite: formData.unite,
              entrepot_id: formData.entrepot_id
            }
          };
          await axios.post(`${API_URL}/api/produits`, updateData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          toast.success('Approvisionnement enregistré et stock mis à jour.');
        } else {
          // Nouvel achat (nouveau produit)
          const achatData = {
            nom: formData.nom,
            description: formData.description || 'Achat via Dépenses',
            quantite: parseFloat(formData.quantite),
            prix_achat: parseFloat(formData.prix_achat),
            prix_achat_piece: parseFloat(formData.prix_achat_piece) || 0,
            prix_vente: 0,
            unite: formData.unite,
            date: formData.date,
            fournisseur_id: formData.fournisseur_id,
            entrepot_id: formData.entrepot_id
          };
          await axios.post(`${API_URL}/api/produit-achat`, achatData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          toast.success('Achat de produit enregistré.');
        }
      } else {
        if (isEditing) {
          await axios.put(`${DEPENSES_URL}/${formData.id}`, formData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          toast.success('Dépense mise à jour avec succès.');
        } else {
          await axios.post(DEPENSES_URL, formData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          toast.success('Dépense ajoutée avec succès.');
        }
      }
      setShowModal(false);
      fetchDepenses();
      fetchProduitAchats();
      fetchProduits(); // Rafraîchir la liste des produits pour le prochain achat
      resetForm();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement: ", error);
  toast.error("Erreur lors de l'enregistrement.");
    }
  };

  const resetForm = () => {
    setFormData({ id: null, nom: '', montant: '', description: '', date: new Date().toLocaleDateString('en-CA'), type: 'depense', quantite: '', prix_achat: '', unite: 'Carton', fournisseur_id: '', entrepot_id: '' });
    setSelectedProduit(null);
    setQuantiteAjoutee('');
    setIsEditing(false);
  };

  const openModalForNew = (type) => {
    resetForm();
    if (type === 'achat') {
      setActiveTab('approvisionnement');
      // Scroll to form if needed
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setFormData({ ...formData, type: type || 'depense', date: new Date().toLocaleDateString('en-CA') });
      setShowModal(true);
    }
  };

  const handleEdit = (item) => {
    if (item.produit_id) {
      // It's an achat (product purchase)
      setActiveTab('approvisionnement');
      // For now, we don't have a "fill form for edit" for achats in the new tab 
      // but we could implement it. The user mostly asked for "ajout de stock".
      // But let's at least switch tab.
    } else {
      setFormData({
        ...item,
        type: 'depense',
        date: new Date(item.date).toLocaleDateString('en-CA')
      });
      setIsEditing(true);
      setShowModal(true);
    }
  };

  // Suppression d'une dépense
  const handleDeleteClick = (depense) => {
    setItemToDelete({ type: 'depense', id: depense.id, nom: depense.nom });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (itemToDelete.type === 'depense') {
        await axios.delete(`${DEPENSES_URL}/${itemToDelete.id}`);
        toast.success('Dépense supprimée.');
        fetchDepenses();
      } else if (itemToDelete.type === 'achat') {
        // Suppression d'un seul achat spécifique par son ID
        await axios.delete(`${API_URL}/api/produit-achat/${itemToDelete.id}`);
        toast.success(`Achat supprimé.`);
        fetchProduitAchats();
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const filteredDepenses = depenses.filter(d =>
    (d.nom || '').toLowerCase().includes(searchTermDepense.toLowerCase()) ||
    (d.description || '').toLowerCase().includes(searchTermDepense.toLowerCase()) ||
    (d.fournisseur_nom || '').toLowerCase().includes(searchTermDepense.toLowerCase())
  );

  const filteredAchats = produitAchats.filter(p =>
    (p.nom || '').toLowerCase().includes(searchTermAchat.toLowerCase()) ||
    (p.fournisseur_nom || '').toLowerCase().includes(searchTermAchat.toLowerCase())
  );

  const totalDepenses = filteredDepenses.reduce((sum, d) => sum + parseFloat(d.montant || 0), 0);
  const totalAchats = filteredAchats.reduce((sum, p) => sum + parseFloat(p.total_cout || 0), 0);
  const totalGeneral = totalDepenses + totalAchats;

  // Pagination helpers
  const paginate = (items, page) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const formatStock = (totalGros, ratio, grosUnite, detailUnite) => {
    if (!ratio || ratio <= 1) return `${parseFloat(totalGros).toLocaleString('fr-FR')} ${grosUnite}`;
    const totalInPieces = Math.round(totalGros * ratio);
    const cartons = Math.floor(totalInPieces / ratio);
    const pieces = totalInPieces % ratio;
    let result = `${cartons} ${grosUnite}${cartons > 1 ? 's' : ''}`;
    if (pieces > 0) {
      result += ` et ${pieces} ${detailUnite}${pieces > 1 ? 's' : ''}`;
    }
    return result;
  };

  const totalPagesDepenses = Math.ceil(filteredDepenses.length / ITEMS_PER_PAGE);
  const totalPagesAchats = Math.ceil(filteredAchats.length / ITEMS_PER_PAGE);

  const paginatedDepenses = paginate(filteredDepenses, depensePage);
  const paginatedAchats = paginate(filteredAchats, achatPage);

  const renderPagination = (currentPage, totalPages, setPage) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-colors ${currentPage === 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-white'
            }`}
        >
          <FaChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium text-gray-700">
          Page {currentPage} sur {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-white'
            }`}
        >
          <FaChevronRight size={18} />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FaMoneyBillWave className="text-white/80" /> Gestion des Dépenses
            </h1>
            <p className="text-white/70 text-sm mt-1">Suivez toutes vos dépenses, frais fixes et coûts d'achats produits</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 text-center">
              <p className="text-lg font-bold text-white leading-none">{totalGeneral.toLocaleString('fr-FR')} Fmg</p>
              <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider mt-1">Total Général</p>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé Total */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 flex items-center transform transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-indigo-50 rounded-full mr-4">
            <FaMoneyBillWave className="text-indigo-600 text-xl" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dépenses Diverses</p>
            <h3 className="text-xl font-bold text-indigo-700">{totalDepenses.toLocaleString('fr-FR')} Fmg</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-orange-100 flex items-center transform transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-orange-50 rounded-full mr-4">
            <FaShoppingCart className="text-orange-600 text-xl" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Coût Achats Produits</p>
            <h3 className="text-xl font-bold text-orange-700">{totalAchats.toLocaleString('fr-FR')} Fmg</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-red-100 flex items-center transform transition-transform hover:scale-[1.02]">
          <div className="p-3 bg-red-50 rounded-full mr-4">
            <FaMoneyBillWave className="text-red-600 text-xl" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Général</p>
            <h3 className="text-xl font-bold text-red-700">{totalGeneral.toLocaleString('fr-FR')} Fmg</h3>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex p-1 bg-gray-200/50 backdrop-blur-sm rounded-2xl mb-8 w-fit mx-auto border border-gray-200 shadow-inner">
        <button
          onClick={() => setActiveTab('diverses')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'diverses' 
              ? 'bg-white text-indigo-600 shadow-md ring-1 ring-black/5' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
          }`}
        >
          <FaMoneyBillWave /> Dépenses Diverses
        </button>
        <button
          onClick={() => setActiveTab('approvisionnement')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'approvisionnement' 
              ? 'bg-white text-orange-600 shadow-md ring-1 ring-black/5' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
          }`}
        >
          <FaShoppingCart /> Approvisionnement
        </button>
      </div>

      {activeTab === 'diverses' ? (
        <>
          {/* === Section Dépenses Diverses === */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4 mt-4">
            <h2 className="text-2xl font-black text-gray-800 flex items-center shrink-0 tracking-tight">
              <FaMoneyBillWave className="mr-3 text-indigo-600" />
              Historique des Dépenses
            </h2>
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher une dépense..."
                value={searchTermDepense}
                onChange={(e) => {
                  setSearchTermDepense(e.target.value);
                  setDepensePage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all shadow-sm text-sm"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => openModalForNew('depense')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all duration-200 flex items-center gap-2 font-black text-xs uppercase tracking-widest"
              >
                <FaPlus /> Nouvelle Dépense
              </button>
            </div>
          </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-10">
        <div className="overflow-auto max-h-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="sticky top-0 z-10 bg-gray-50 p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Date</th>
                <th className="sticky top-0 z-10 bg-gray-50 p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Nom / Catégorie</th>
                <th className="sticky top-0 z-10 bg-gray-50 p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Fournisseur</th>
                <th className="sticky top-0 z-10 bg-gray-50 p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Description</th>
                <th className="sticky top-0 z-10 bg-gray-50 p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Montant</th>
                <th className="sticky top-0 z-10 bg-gray-50 p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedDepenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">Aucune dépense trouvée.</td>
                </tr>
              ) : (
                paginatedDepenses.map((depense) => (
                  <tr key={depense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">{new Date(depense.date).toLocaleDateString()}</td>
                    <td className="p-4 text-sm font-semibold text-gray-800">{depense.nom}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {depense.fournisseur_nom ? (
                        <span className="flex items-center gap-1"><FaTruck className="text-blue-500" /> {depense.fournisseur_nom}</span>
                      ) : '—'}
                    </td>
                    <td className="p-4 text-sm text-gray-500 max-w-xs truncate">{depense.description || '—'}</td>
                    <td className="p-4 text-sm font-bold text-indigo-600">{parseFloat(depense.montant).toLocaleString()} Fmg</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(depense)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(depense)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {depenses.length > 0 && (
                <tr className="bg-indigo-50 font-medium">
                  <td colSpan="3" className="p-4 text-right text-indigo-800">Sous-total :</td>
                  <td className="p-4 text-indigo-800 font-bold">{totalDepenses.toLocaleString('fr-FR')} Fmg</td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {renderPagination(depensePage, totalPagesDepenses, setDepensePage)}
      </div>

        </>
      ) : (
        <div className="animate-fade-in">
          {/* === Section Approvisionnement (Formulaire Intégré) === */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                <FaShoppingCart size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight leading-none">Nouvel Approvisionnement</h2>
                <p className="text-gray-400 text-xs mt-1 font-bold uppercase tracking-widest">Ajouter du stock à un produit existant ou nouveau</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Produit */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Rechercher un Produit</label>
                    <SearchSelect
                      value={formData.nom}
                      options={produits.map(p => ({ value: p.nom, label: p.nom, ...p }))}
                      onChange={(val, opt) => {
                        if (opt) {
                          const ratio = opt.pieces_par_carton || 1;
                          const stockEnGros = opt.quantite / ratio;
                          setSelectedProduit(opt);
                          setFormData({
                            ...formData,
                            type: 'achat',
                            nom: opt.nom,
                            prix_achat: opt.prix_achat || 0,
                            unite: opt.nom_unite_gros || 'Carton',
                            fournisseur_id: opt.fournisseur_id || '',
                            quantite: stockEnGros 
                          });
                          setQuantiteAjoutee('');
                        } else {
                          setSelectedProduit(null);
                          setFormData({ ...formData, type: 'achat', nom: '' });
                        }
                      }}
                      placeholder="Tapez le nom du produit..."
                      allowCustom={false}
                    />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quantité & Unité */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col gap-4">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      {selectedProduit ? 'Quantité à ajouter' : 'Quantité totale'}
                    </label>
                    <div className="relative">
                      <input
                        type="number" step="1"
                        min={1}
                        name={selectedProduit ? 'quantiteAjoutee' : 'quantite'}
                        value={selectedProduit ? quantiteAjoutee : formData.quantite}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (selectedProduit) {
                            setQuantiteAjoutee(val);
                            const ratio = selectedProduit.pieces_par_carton || 1;
                            const stockInitialGros = selectedProduit.quantite / ratio;
                            const isDetail = formData.unite === (selectedProduit.unité || 'Détail');
                            const valInGros = isDetail ? ((parseFloat(val) || 0) / ratio) : (parseFloat(val) || 0);
                            setFormData({ ...formData, quantite: stockInitialGros + valInGros });
                          } else {
                            handleInputChange(e);
                          }
                        }}
                        className="w-full bg-white border-2 border-transparent rounded-xl px-5 py-3 text-lg focus:outline-none focus:border-orange-500 transition-all font-black text-orange-600 shadow-sm"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Unité</label>
                    {selectedProduit && selectedProduit.pieces_par_carton > 1 ? (
                      <select
                        name="unite"
                        value={formData.unite}
                        onChange={(e) => {
                          const newUnite = e.target.value;
                          const ratio = selectedProduit.pieces_par_carton || 1;
                          let newPrixAchat = selectedProduit.prix_achat || 0;
                          const isDetail = newUnite === (selectedProduit.unité || 'Détail');
                          if (isDetail) newPrixAchat = newPrixAchat / ratio;

                          const stockInitialGros = selectedProduit.quantite / ratio;
                          const valInGros = isDetail ? ((parseFloat(quantiteAjoutee) || 0) / ratio) : (parseFloat(quantiteAjoutee) || 0);

                          setFormData({ 
                            ...formData, 
                            unite: newUnite, 
                            prix_achat: newPrixAchat,
                            quantite: stockInitialGros + valInGros
                          });
                        }}
                        className="w-full bg-white border-2 border-transparent rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-orange-500 transition-all font-bold shadow-sm"
                      >
                        <option value={selectedProduit.nom_unite_gros || 'Carton'}>{selectedProduit.nom_unite_gros || 'Carton'}</option>
                        <option value={selectedProduit.unité || 'Détail'}>{selectedProduit.unité || 'Détail'}</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="unite"
                        list="unite-suggestions-tab"
                        value={formData.unite}
                        onChange={handleInputChange}
                        className="w-full bg-white border-2 border-transparent rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-orange-500 transition-all font-bold shadow-sm"
                        placeholder="Ex: Sac, Boite..."
                      />
                    )}
                    <datalist id="unite-suggestions-tab">
                      <option value="Carton" /><option value="Sac" /><option value="Détail" /><option value="Gros" /><option value="kg" />
                    </datalist>
                  </div>
                </div>

                {/* Prix & Fournisseur */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col gap-4">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Prix d'Achat ({formData.unite})</label>
                    <PriceInput
                      name="prix_achat"
                      value={formData.prix_achat}
                      onChange={handleInputChange}
                      className="w-full bg-white border-2 border-transparent rounded-xl px-5 py-3 text-lg focus:outline-none focus:border-orange-500 transition-all font-black text-emerald-600 shadow-sm"
                      required
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Fournisseur</label>
                    <SearchSelect
                      value={formData.fournisseur_id || ''}
                      onChange={(value) => setFormData({ ...formData, fournisseur_id: value })}
                      options={fournisseurs.map(f => ({ value: f.id, label: f.nom }))}
                      placeholder="Choisir..."
                    />
                  </div>
                </div>

                {/* Entrepot & Recap */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col gap-4">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Entrepôt / Magasin</label>
                    <SearchSelect
                      value={formData.entrepot_id || ''}
                      onChange={(value) => setFormData({ ...formData, entrepot_id: value })}
                      options={entrepots.map(e => ({ value: e.id, label: e.nom }))}
                      placeholder="Destination..."
                    />
                  </div>
                  
                  {selectedProduit && (
                    <div className="mt-auto bg-orange-600 rounded-xl p-4 shadow-lg shadow-orange-200">
                      <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">Nouveau Stock Total</p>
                      <p className="text-sm font-black text-white leading-tight">
                        {formatStock(formData.quantite, selectedProduit.pieces_par_carton || 1, selectedProduit.nom_unite_gros || 'Gros', selectedProduit.unité || 'Détail')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-3.5 rounded-2xl bg-gray-100 text-gray-500 font-black hover:bg-gray-200 transition-all uppercase tracking-widest text-[10px]"
                >
                  Réinitialiser
                </button>
                <button
                  type="submit"
                  disabled={!selectedProduit}
                  className={`px-10 py-3.5 rounded-2xl font-black shadow-lg transition-all uppercase tracking-widest text-[10px] ${
                    !selectedProduit 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-200 hover:shadow-orange-300 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  Confirmer l'Approvisionnement
                </button>
              </div>
            </form>
          </div>

          {/* === Section Historique des Achats === */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
            <h2 className="text-2xl font-black text-gray-800 flex items-center shrink-0 tracking-tight">
              <FaShoppingCart className="mr-3 text-orange-500" />
              Historique des Achats
            </h2>
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Chercher dans l'historique..."
                value={searchTermAchat}
                onChange={(e) => {
                  setSearchTermAchat(e.target.value);
                  setAchatPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all shadow-sm text-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-10">
            <div className="overflow-auto max-h-[600px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-orange-50/50 border-b border-orange-100">
                  <tr>
                    <th className="sticky top-0 z-10 bg-orange-50/50 p-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="sticky top-0 z-10 bg-orange-50/50 p-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Produit</th>
                    <th className="sticky top-0 z-10 bg-orange-50/50 p-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Fournisseur(s)</th>
                    <th className="sticky top-0 z-10 bg-orange-50/50 p-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Entrepôt / Magasin</th>
                    <th className="sticky top-0 z-10 bg-orange-50/50 p-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Quantité</th>
                    <th className="sticky top-0 z-10 bg-orange-50/50 p-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">P.U Achat</th>
                    <th className="sticky top-0 z-10 bg-orange-50/50 p-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Coût Total</th>
                    <th className="sticky top-0 z-10 bg-orange-50/50 p-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedAchats.length === 0 ? (
                    <tr><td colSpan="8" className="p-10 text-center text-gray-400 font-medium italic">Aucun achat enregistré.</td></tr>
                  ) : (
                    paginatedAchats.map((produit, index) => (
                      <tr key={index} className="hover:bg-orange-50/30 transition-colors">
                        <td className="p-5 text-xs font-bold text-gray-400 whitespace-nowrap">
                          {produit.created_at ? new Date(produit.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                        </td>
                        <td className="p-5 text-sm font-black text-gray-800">
                          {produit.nom}
                          {produit.description && produit.description !== 'Achat via Dépenses' && produit.description !== 'Approvisionnement' && (
                            <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter italic">{produit.description}</div>
                          )}
                        </td>
                        <td className="p-5 text-xs font-bold text-gray-600">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <FaTruck className="text-orange-400 opacity-50 shrink-0" />
                            {produit.fournisseur_nom || '—'}
                          </div>
                        </td>
                        <td className="p-5 text-xs font-bold text-gray-500 italic">
                          {produit.entrepot_nom || '—'}
                        </td>
                        <td className="p-5 text-sm text-right font-black text-gray-700">
                          {parseFloat(produit.total_quantite).toLocaleString()} <span className="text-[10px] text-gray-400 uppercase ml-1 font-bold">{produit.unite}</span>
                        </td>
                        <td className="p-5 text-sm text-right font-black text-emerald-600">
                          {parseFloat(produit.prix_achat).toLocaleString()} <span className="text-[10px] text-gray-300 font-bold ml-0.5">Fmg</span>
                        </td>
                        <td className="p-5 text-sm text-right font-black text-orange-600">
                          {parseFloat(produit.total_cout).toLocaleString()} <span className="text-[10px] text-orange-300 font-bold ml-0.5">Fmg</span>
                        </td>
                        <td className="p-5 text-center">
                          <button
                            onClick={() => { setItemToDelete({ type: 'achat', id: produit.id, nom: produit.nom }); setShowDeleteModal(true); }}
                            className="p-2.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <FaTrash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {renderPagination(achatPage, totalPagesAchats, setAchatPage)}
          </div>
        </div>
      )}

      {/* Modal d'ajout/édition */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-indigo-900/10 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative animate-fade-in-down my-auto border border-white/50">
            <button
              onClick={() => { setShowModal(false); resetForm(); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-rose-500 transition-all bg-gray-100/50 hover:bg-rose-50 rounded-full p-1.5 z-10"
            >
              <FaTimes size={18} />
            </button>
            
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2.5 rounded-xl ${isEditing ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {formData.type === 'achat' ? <FaShoppingCart size={20} /> : <FaMoneyBillWave size={20} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-800 leading-none">
                    {isEditing ? 'Modifier la Dépense' : 'Nouvelle Dépense'}
                  </h2>
                  <p className="text-gray-400 text-xs mt-1 font-medium uppercase tracking-wider">
                    {formData.type === 'achat' ? 'Achat de produit' : 'Frais de fonctionnement'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                      Nom / Catégorie <span className="text-red-500">*</span>
                    </label>
                    {formData.type === 'achat' ? (
                      <SearchSelect
                        value={formData.nom}
                        options={produits.map(p => ({ value: p.nom, label: p.nom, ...p }))}
                        onChange={(val, opt) => {
                          if (opt) {
                            const ratio = opt.pieces_par_carton || 1;
                            const stockEnGros = opt.quantite / ratio;
                            setSelectedProduit(opt);
                            setFormData({
                              ...formData,
                              nom: opt.nom,
                              prix_achat: opt.prix_achat || 0,
                              unite: opt.nom_unite_gros || 'Carton',
                              fournisseur_id: opt.fournisseur_id || '',
                              quantite: stockEnGros // Stock actuel
                            });
                            setQuantiteAjoutee('');
                          } else {
                            setSelectedProduit(null);
                            setFormData({ ...formData, nom: '' });
                          }
                        }}
                        placeholder="Chercher un produit..."
                        allowCustom={false}
                      />
                    ) : (
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-0 border-b-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-0 focus:border-indigo-500/50 focus:bg-white transition-all shadow-sm font-medium"
                        placeholder="Ex: Loyer, Électricité..."
                        required
                      />
                    )}
                  </div>
                  {formData.type === 'depense' ? (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                        Montant (Ar) <span className="text-red-500">*</span>
                      </label>
                      <PriceInput
                        name="montant"
                        value={formData.montant}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-0 border-b-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-0 focus:border-indigo-500/50 focus:bg-white transition-all shadow-sm font-bold text-indigo-600"
                        required
                        placeholder="0"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                        Prix d'achat unitaire ({formData.unite}) <span className="text-red-500">*</span>
                      </label>
                      <PriceInput
                        name="prix_achat"
                        value={formData.prix_achat}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-0 border-b-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-0 focus:border-indigo-500/50 focus:bg-white transition-all shadow-sm font-bold text-emerald-600"
                        placeholder="0"
                        required
                      />
                    </div>
                  )}
                </div>

                {formData.type === 'achat' && (
                  <div className="grid grid-cols-2 gap-5">
                    {selectedProduit && (
                      <div className="col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50/30 p-4 rounded-2xl border border-blue-100/50 flex flex-col gap-1 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-widest">Stock actuel :</span>
                        <strong className="text-xl font-black text-blue-800 tracking-tight">
                          {selectedProduit ? (
                            formatStock(
                              selectedProduit.quantite / (selectedProduit.pieces_par_carton || 1),
                              selectedProduit.pieces_par_carton || 1,
                              selectedProduit.nom_unite_gros || 'Gros',
                              selectedProduit.unité || 'Détail'
                            )
                          ) : (
                            `${formData.quantite} ${formData.unite}`
                          )}
                        </strong>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                        {selectedProduit ? 'Quantité à ajouter' : 'Quantité'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number" step="1"
                        name={selectedProduit ? 'quantiteAjoutee' : 'quantite'}
                        value={selectedProduit ? quantiteAjoutee : formData.quantite}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (selectedProduit) {
                            setQuantiteAjoutee(val);
                            const ratio = selectedProduit.pieces_par_carton || 1;
                            const stockInitialGros = selectedProduit.quantite / ratio;
                            const isDetail = formData.unite === (selectedProduit.unité || 'Détail');
                            const valInGros = isDetail ? ((parseFloat(val) || 0) / ratio) : (parseFloat(val) || 0);
                            setFormData({ ...formData, quantite: stockInitialGros + valInGros });
                          } else {
                            handleInputChange(e);
                          }
                        }}
                        className="w-full bg-gray-50 border-0 border-b-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-0 focus:border-indigo-500/50 focus:bg-white transition-all shadow-sm font-medium"
                        required
                      />
                    </div>
                    {selectedProduit && (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                          Nouveau Total
                        </label>
                        <div className="w-full bg-indigo-600 border border-indigo-500 rounded-xl px-4 py-3 text-white font-black text-sm tracking-tight shadow-lg shadow-indigo-200/50">
                          {formatStock(
                            formData.quantite,
                            selectedProduit.pieces_par_carton || 1,
                            selectedProduit.nom_unite_gros || 'Gros',
                            selectedProduit.unité || 'Détail'
                          )}
                        </div>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                        Unité
                      </label>
                      {selectedProduit && selectedProduit.pieces_par_carton > 1 ? (
                        <select
                          name="unite"
                          value={formData.unite}
                          onChange={(e) => {
                            const newUnite = e.target.value;
                            const ratio = selectedProduit.pieces_par_carton || 1;
                            let newPrixAchat = selectedProduit.prix_achat || 0;
                            const isDetail = newUnite === (selectedProduit.unité || 'Détail');

                            if (isDetail) {
                              newPrixAchat = newPrixAchat / ratio;
                            }

                            const stockInitialGros = selectedProduit.quantite / ratio;
                            const valInGros = isDetail ? ((parseFloat(quantiteAjoutee) || 0) / ratio) : (parseFloat(quantiteAjoutee) || 0);

                            setFormData({ 
                              ...formData, 
                              unite: newUnite, 
                              prix_achat: newPrixAchat,
                              quantite: stockInitialGros + valInGros
                            });
                          }}
                          className="w-full bg-gray-50 border-0 border-b-2 border-gray-100 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-0 focus:border-indigo-500/50 focus:bg-white transition-all shadow-sm font-medium"
                        >
                          <option value={selectedProduit.nom_unite_gros || 'Carton'}>{selectedProduit.nom_unite_gros || 'Carton'}</option>
                          <option value={selectedProduit.unité || 'Détail'}>{selectedProduit.unité || 'Détail'}</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          name="unite"
                          list="unite-suggestions"
                          value={formData.unite}
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 border-0 border-b-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-0 focus:border-indigo-500/50 focus:bg-white transition-all shadow-sm font-medium"
                          placeholder="Ex: Sac, Boite..."
                        />
                      )}
                      
                      {!selectedProduit && (
                        <datalist id="unite-suggestions">
                          <option value="Détail" /><option value="Gros" /><option value="Sac" /><option value="Boite" /><option value="kg" />
                        </datalist>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {!selectedProduit && formData.type === 'achat' && (
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                        Prix d'achat unitaire (Détail)
                      </label>
                      <PriceInput
                        name="prix_achat_piece"
                        value={formData.prix_achat_piece}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-0 border-b-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-0 focus:border-indigo-500/50 focus:bg-white transition-all shadow-sm font-medium"
                        placeholder="Optionnel"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                      Fournisseur
                    </label>
                    <SearchSelect
                      value={formData.fournisseur_id || ''}
                      onChange={(value) => setFormData({ ...formData, fournisseur_id: value })}
                      options={fournisseurs.map(f => ({
                        value: f.id,
                        label: f.nom
                      }))}
                      placeholder="Sélectionner..."
                      disabled={!!selectedProduit}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-0 border-b-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-0 focus:border-indigo-500/50 focus:bg-white transition-all shadow-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Description (Optionnel)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border-0 border-b-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-0 focus:border-indigo-500/50 focus:bg-white transition-all shadow-sm font-medium"
                    placeholder="Détails supplémentaires..."
                    rows="2"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 px-6 py-4 rounded-2xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className={`flex-[1.5] px-6 py-4 rounded-2xl text-white font-black shadow-lg transition-all uppercase tracking-widest text-xs ${
                      isEditing 
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                    }`}
                  >
                    {isEditing ? 'Enregistrer les modifications' : 'Confirmer la dépense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer ${itemToDelete?.type === 'depense' ? 'cette dépense' : `cet achat de "${itemToDelete?.nom}"`} ? Cette action est irréversible.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Depenses;