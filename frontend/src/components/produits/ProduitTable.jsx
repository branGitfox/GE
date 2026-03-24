import React, { useState } from 'react';
import { FaBox, FaEdit, FaTrash, FaPlus, FaMinus, FaCheck, FaTimes, FaTag, FaEye, FaEllipsisV } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config';
import { ClipLoader } from 'react-spinners';
import Pagination from './Pagination';
import ProduitHistoriqueModal from './ProduitHistoriqueModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProduitTable = ({
  filteredProduits,
  currentPage,
  itemsPerPage,
  handleEdit,
  handleDelete,
  isLoading,
  onPageChange,
  fetchProduits
}) => {
  const [modalProduit, setModalProduit] = useState(null);
  // mode can be null, 'add', or 'remove'
  const [mode, setMode] = useState({});
  const [quantiteInput, setQuantiteInput] = useState({});
  const [prixAchatInput, setPrixAchatInput] = useState({});
  const [actionUnite, setActionUnite] = useState({});
  const [localLoading, setLocalLoading] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdownId(prev => prev === id ? null : id);
  };

  const openMode = (produitId, newMode, initialPrix) => {
    setMode(prev => ({ ...prev, [produitId]: prev[produitId] === newMode ? null : newMode }));
    setQuantiteInput(prev => ({ ...prev, [produitId]: '1' }));
    setPrixAchatInput(prev => ({ ...prev, [produitId]: initialPrix || 0 }));
    setActionUnite(prev => ({ ...prev, [produitId]: 'carton' }));
  };

  const cancelMode = (produitId) => {
    setMode(prev => ({ ...prev, [produitId]: null }));
  };

  const handleQuantiteChange = (produitId, value) => {
    // Conserver la valeur brute pour permettre la saisie libre
    setQuantiteInput(prev => ({ ...prev, [produitId]: value }));
  };

  const submitQuantite = async (produit, action) => {
    const produitId = produit.id;
    try {
      setLocalLoading(prev => ({ ...prev, [produitId]: true }));

      const rawQuantite = parseFloat(String(quantiteInput[produitId]).replace(',', '.'));
      if (isNaN(rawQuantite) || rawQuantite <= 0) {
        throw new Error('Veuillez entrer une quantité valide (> 0)');
      }

      const isCarton = actionUnite[produitId] === 'carton' || actionUnite[produitId] === undefined;
      const multiplier = isCarton ? (produit.pieces_par_carton || 1) : 1;
      const quantiteTotalPieces = rawQuantite * multiplier;
      const quantiteCartons = isCarton ? rawQuantite : (rawQuantite / (produit.pieces_par_carton || 1));

      // 1. Mettre à jour le stock dans produits
      const endpoint = action === 'add'
        ? `${API_URL}/api/produits/${produitId}/add`
        : `${API_URL}/api/produits/${produitId}/remove`;

      // 1. Mettre à jour le stock
      const response = await axios.put(endpoint, {
        quantite: quantiteTotalPieces,
        rawQuantite: rawQuantite,
        prix_achat: parseFloat(prixAchatInput[produitId]) || 0,
        unite: isCarton ? (produit.nom_unite_gros || 'Gros') : (produit.unité || 'Détail')
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur inconnue du serveur');
      }

      await fetchProduits();
      cancelMode(produitId);

      toast.success(action === 'add' ? 'Stock augmenté ✅' : 'Stock réduit ✅', {
        position: 'top-right', autoClose: 3000
      });

    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || 'Erreur lors de la mise à jour du stock',
        { position: 'top-right', autoClose: 3000 }
      );
    } finally {
      setLocalLoading(prev => ({ ...prev, [produitId]: false }));
    }
  };

  const totalPages = Math.ceil(filteredProduits.length / itemsPerPage);
  const currentItems = filteredProduits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredProduits.length}
        onPageChange={onPageChange}
      />

      <div className="overflow-auto max-h-[600px]">
        <table className="min-w-full divide-y divide-gray-200 border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="sticky top-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Produit</th>
              <th className="sticky top-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Unité</th>
              <th className="sticky top-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Stock (Gros & Détail)</th>
              <th className="sticky top-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Détails Gros</th>
              <th className="sticky top-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Prix Vente</th>
              <th className="sticky top-0 z-10 bg-gray-50 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider shadow-[0_1px_0_0_rgba(0,0,0,0.05)]"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((produit) => (
              <React.Fragment key={produit.id}>
                <tr className={`transition ${openDropdownId === produit.id ? 'bg-indigo-50/50 relative z-10' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaBox className="text-blue-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{produit.nom}</div>
                        <div className="text-xs text-gray-400 mt-1 max-w-[150px] truncate" title={produit.description}>{produit.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{produit.nom_unite_gros}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${produit.quantite > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {produit.pieces_par_carton > 1 ? (
                          `${Math.floor(produit.quantite / produit.pieces_par_carton)} ${produit.nom_unite_gros || 'carton'}(s) et ${produit.quantite % produit.pieces_par_carton} ${produit.unité || 'pièce'}(s)`
                        ) : (
                          `${produit.quantite} ${produit.nom_unite_gros || 'pièce'}(s)`
                        )}
                      </span>

                      {/* Formulaire inline + ou - */}
                      {(mode[produit.id] === 'add' || mode[produit.id] === 'remove') && (
                        <div className={`mt-2 flex flex-col items-start gap-2 p-2 rounded-lg ${mode[produit.id] === 'add' ? 'bg-green-50' : 'bg-red-50'}`}>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${mode[produit.id] === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                              {mode[produit.id] === 'add' ? '+' : '-'}
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={quantiteInput[produit.id] !== undefined ? quantiteInput[produit.id] : '1'}
                              onChange={(e) => handleQuantiteChange(produit.id, e.target.value)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                              disabled={localLoading[produit.id]}
                            />
                             <select
                               value={actionUnite[produit.id] || 'carton'}
                               onChange={(e) => setActionUnite(prev => ({ ...prev, [produit.id]: e.target.value }))}
                               className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                               disabled={localLoading[produit.id]}
                             >
                               <option value="carton">{produit.nom_unite_gros || 'Unité Gros'}</option>
                               {produit.pieces_par_carton > 1 && (
                                 <option value="piece">{produit.unité || 'Unité Détail'}</option>
                               )}
                             </select>
                           </div>
                           {mode[produit.id] === 'add' && (
                             <div className="flex items-center gap-2">
                               <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Prix Achat:</span>
                               <input
                                 type="number" step="1"
                                 min="0"
                                 value={prixAchatInput[produit.id] !== undefined ? prixAchatInput[produit.id] : '0'}
                                 onChange={(e) => setPrixAchatInput(prev => ({ ...prev, [produit.id]: e.target.value }))}
                                 className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-bold text-emerald-600 bg-white"
                                 placeholder="Prix achat"
                                 disabled={localLoading[produit.id]}
                               />
                             </div>
                           )}
                          <div className="flex w-full justify-end gap-1">
                            <button
                              onClick={() => submitQuantite(produit, mode[produit.id])}
                              className="p-1 px-2 text-white bg-green-500 hover:bg-green-600 rounded flex items-center gap-1 transition text-xs"
                              disabled={localLoading[produit.id]}
                              title="Confirmer"
                            >
                              {localLoading[produit.id] ? (
                                <ClipLoader size={12} color="#ffffff" />
                              ) : (
                                <><FaCheck size={12} /> Confirmer</>
                              )}
                            </button>
                            <button
                              onClick={() => cancelMode(produit.id)}
                              className="p-1 px-2 text-white bg-red-500 hover:bg-red-600 rounded flex items-center gap-1 transition text-xs"
                              title="Annuler"
                            >
                              <FaTimes size={12} /> Annuler
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {produit.pieces_par_carton > 1 ? (
                      `${produit.pieces_par_carton} ${produit.unité}/${produit.nom_unite_gros}`
                    ) : (
                      `Unité Simple`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex flex-col gap-1">
                    <span><span className="font-semibold text-gray-700">{produit.nom_unite_gros || 'Unité'}:</span> {produit.prix_carton} FMG</span>
                    {produit.pieces_par_carton > 1 && (
                      <span><span className="font-semibold text-gray-700">{produit.unité || 'Détail'}:</span> {produit.prix_piece} FMG</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => toggleDropdown(produit.id)}
                      className={`p-2 rounded-full transition ${openDropdownId === produit.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 bg-gray-100 hover:text-gray-700 hover:bg-gray-200'}`}
                      title="Actions & Détails"
                    >
                      <FaEllipsisV />
                    </button>
                  </td>
                </tr>
                {openDropdownId === produit.id && (
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <td colSpan="6" className="p-0">
                      <div className="px-6 py-6 flex flex-col lg:flex-row gap-6">
                        {/* Informations Panel */}
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FaTag className="text-indigo-500" /> Détails du Produit
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
                            <div>
                              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Catégorie</span>
                              <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{produit.categorie_nom || 'NC'}</span>
                            </div>
                            <div>
                              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fournisseur</span>
                              <span className="text-sm font-medium text-slate-700">{produit.fournisseur_nom || 'Non renseigné'}</span>
                            </div>
                            <div>
                              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Achat (Gros)</span>
                              <span className="text-sm font-bold text-emerald-600">{parseFloat(produit.prix_achat || 0).toLocaleString('fr-FR')} Fmg</span>
                            </div>
                            <div>
                              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Achat (Détail)</span>
                              <span className="text-sm font-bold text-emerald-600">{parseFloat(produit.prix_achat_piece || 0).toLocaleString('fr-FR')} Fmg</span>
                            </div>
                            <div className="col-span-2 md:col-span-4 mt-2">
                              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</span>
                              <p className="text-sm text-slate-600 leading-relaxed">{produit.description || 'Aucune description disponible.'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Actions Panel */}
                        <div className="w-full lg:w-72 flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => { setModalProduit(produit); setOpenDropdownId(null); }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-all"
                          >
                            <FaEye /> Historique & Détails
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                               onClick={() => { openMode(produit.id, 'add', actionUnite[produit.id] === 'piece' ? produit.prix_achat_piece : produit.prix_achat); setOpenDropdownId(null); }}
                               className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl transition-all"
                            >
                               <FaPlus /> Stock
                            </button>
                            <button
                              onClick={() => { openMode(produit.id, 'remove'); setOpenDropdownId(null); }}
                              className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition-all"
                            >
                              <FaMinus /> Retirer
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                            <button
                              onClick={() => { handleEdit(produit); setOpenDropdownId(null); }}
                              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all"
                              disabled={isLoading}
                            >
                              <FaEdit /> Modifier
                            </button>
                            <button
                              onClick={() => { handleDelete(produit.id); setOpenDropdownId(null); }}
                              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              disabled={isLoading}
                            >
                              <FaTrash /> Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>


      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredProduits.length}
        onPageChange={onPageChange}
      />

      {/* Modal historique */}
      {modalProduit && (
        <ProduitHistoriqueModal
          produit={modalProduit}
          onClose={() => setModalProduit(null)}
        />
      )}
    </div>
  );
};

export default ProduitTable;