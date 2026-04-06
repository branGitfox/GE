import React, { useState } from 'react';
import { FaBox, FaEdit, FaTrash, FaPlus, FaMinus, FaCheck, FaTimes, FaTag, FaEye, FaEllipsisV, FaTruck, FaWarehouse } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config';
import { ClipLoader } from 'react-spinners';
import Pagination from './Pagination';
import PriceInput from '../PriceInput';
import ProduitHistoriqueModal from './ProduitHistoriqueModal';
import { toast } from 'react-toastify';

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
  const [mode, setMode] = useState({});
  const [quantiteInput, setQuantiteInput] = useState({});
  const [prixAchatInput, setPrixAchatInput] = useState({});
  const [actionUnite, setActionUnite] = useState({});
  const [localLoading, setLocalLoading] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const toggleDropdown = (id) => setOpenDropdownId(prev => prev === id ? null : id);

  const openMode = (produitId, newMode, initialPrix) => {
    setMode(prev => ({ ...prev, [produitId]: prev[produitId] === newMode ? null : newMode }));
    setQuantiteInput(prev => ({ ...prev, [produitId]: '1' }));
    setPrixAchatInput(prev => ({ ...prev, [produitId]: initialPrix || 0 }));
    setActionUnite(prev => ({ ...prev, [produitId]: 'carton' }));
  };

  const cancelMode = (produitId) => setMode(prev => ({ ...prev, [produitId]: null }));

  const submitQuantite = async (produit, action) => {
    const produitId = produit.id;
    try {
      setLocalLoading(prev => ({ ...prev, [produitId]: true }));
      const rawQuantite = parseFloat(String(quantiteInput[produitId]).replace(',', '.'));
      if (isNaN(rawQuantite) || rawQuantite <= 0) throw new Error('Quantité invalide (> 0)');

      const isCarton = actionUnite[produitId] === 'carton' || !actionUnite[produitId];
      const multiplier = isCarton ? (produit.pieces_par_carton || 1) : 1;
      const quantiteTotalPieces = rawQuantite * multiplier;

      const endpoint = action === 'add'
        ? `${API_URL}/api/produits/${produitId}/add`
        : `${API_URL}/api/produits/${produitId}/remove`;

      const response = await axios.put(endpoint, {
        quantite: quantiteTotalPieces,
        rawQuantite,
        prix_achat: parseFloat(prixAchatInput[produitId]) || 0,
        unite: isCarton ? (produit.nom_unite_gros || 'Gros') : (produit.unité || 'Détail')
      }, { headers: { 'Content-Type': 'application/json' } });

      if (!response.data.success) throw new Error(response.data.message || 'Erreur serveur');

      await fetchProduits();
      cancelMode(produitId);
      toast.success(action === 'add' ? '✅ Stock augmenté' : '✅ Stock réduit', { position: 'top-right', autoClose: 2500 });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Erreur mise à jour stock', { position: 'top-right' });
    } finally {
      setLocalLoading(prev => ({ ...prev, [produitId]: false }));
    }
  };

  const totalPages = Math.ceil(filteredProduits.length / itemsPerPage);
  const currentItems = filteredProduits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStockBadge = (produit) => {
    const ratio = produit.pieces_par_carton || 1;
    const cartons = ratio > 1 ? Math.floor(produit.quantite / ratio) : produit.quantite;
    const threshold = produit.stock_threshold || 0;
    const isLow = cartons <= threshold && threshold > 0;
    const isEmpty = produit.quantite <= 0;

    if (isEmpty) return { color: 'bg-red-100 text-red-700 border-red-200', label: 'Rupture' };
    if (isLow) return { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Stock faible' };
    return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'En stock' };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <Pagination currentPage={currentPage} totalPages={totalPages} itemsPerPage={itemsPerPage}
        totalItems={filteredProduits.length} onPageChange={onPageChange} />

      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50/80">
              {['Produit', 'Stock', 'Unité', 'Prix Vente', 'Fournisseurs', ''].map((h, i) => (
                <th key={i} className={`px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentItems.map((produit) => {
              const badge = getStockBadge(produit);
              const ratio = produit.pieces_par_carton || 1;
              const cartons = ratio > 1 ? Math.floor(produit.quantite / ratio) : produit.quantite;
              const pieces = ratio > 1 ? produit.quantite % ratio : 0;
              const isOpen = openDropdownId === produit.id;

              return (
                <React.Fragment key={produit.id}>
                  <tr className={`transition-colors ${isOpen ? 'bg-violet-50/40' : 'hover:bg-gray-50/60'}`}>
                    {/* Produit */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                          <FaBox className="text-violet-500 text-sm" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{produit.nom}</p>
                          <p className="text-xs text-gray-400 mt-0.5 max-w-[180px] truncate">{produit.categorie_nom || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.color}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {ratio > 1
                            ? `${cartons} ${produit.nom_unite_gros || 'carton'}(s)${pieces > 0 ? ` + ${pieces.toString().replace('.', ',')} ${produit.unité || 'pcs'}` : ''}`
                            : `${produit.quantite.toString().replace('.', ',')} ${produit.nom_unite_gros || 'u.'}`}
                        </div>
                        <span className={`text-[10px] font-medium ${badge.color.includes('red') ? 'text-red-500' : badge.color.includes('amber') ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {badge.label}
                        </span>

                        {/* Inline +/- form */}
                        {(mode[produit.id] === 'add' || mode[produit.id] === 'remove') && (
                          <div className={`mt-2 p-3 rounded-xl border ${mode[produit.id] === 'add' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs font-bold ${mode[produit.id] === 'add' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {mode[produit.id] === 'add' ? '+' : '−'}
                              </span>
                              <input type="number" min="0" step="any"
                                value={quantiteInput[produit.id] ?? '1'}
                                onChange={e => setQuantiteInput(p => ({ ...p, [produit.id]: e.target.value }))}
                                className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm text-center"
                                disabled={localLoading[produit.id]} />
                              <select value={actionUnite[produit.id] || 'carton'}
                                onChange={e => setActionUnite(p => ({ ...p, [produit.id]: e.target.value }))}
                                className="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white"
                                disabled={localLoading[produit.id]}>
                                <option value="carton">{produit.nom_unite_gros || 'Gros'}</option>
                                {ratio > 1 && <option value="piece">{produit.unité || 'Détail'}</option>}
                              </select>
                            </div>
                            {mode[produit.id] === 'add' && (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] text-emerald-600 font-semibold">Prix achat:</span>
                                <PriceInput
                                  name={produit.id.toString()}
                                  value={prixAchatInput[produit.id] ?? 0}
                                  onChange={e => setPrixAchatInput(p => ({ ...p, [produit.id]: e.target.value }))}
                                  className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-xs"
                                  disabled={localLoading[produit.id]}
                                />
                              </div>
                            )}
                            <div className="flex gap-1.5">
                              <button onClick={() => submitQuantite(produit, mode[produit.id])} disabled={localLoading[produit.id]}
                                className="flex-1 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition">
                                {localLoading[produit.id] ? <ClipLoader size={10} color="#fff" /> : <><FaCheck /> OK</>}
                              </button>
                              <button onClick={() => cancelMode(produit.id)}
                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg text-xs transition">
                                <FaTimes />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Unité */}
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {ratio > 1 ? `${ratio} ${produit.unité}/${produit.nom_unite_gros}` : produit.nom_unite_gros || '—'}
                    </td>

                    {/* Prix Vente */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-gray-800">
                          {parseFloat(produit.prix_carton || 0).toLocaleString('fr-FR')} <span className="text-xs font-normal text-gray-400">Fmg/{produit.nom_unite_gros || 'u.'}</span>
                        </span>
                        {ratio > 1 && (
                          <span className="text-xs text-gray-500">
                            {parseFloat(produit.prix_piece || 0).toLocaleString('fr-FR')} Fmg/{produit.unité || 'pcs'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Fournisseurs */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(produit.fournisseurs_list || []).length > 0
                          ? (produit.fournisseurs_list || []).map(f => (
                            <span key={f.id} className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-full font-medium">
                              {f.nom}
                            </span>
                          ))
                          : <span className="text-xs text-gray-400 italic">Non renseigné</span>
                        }
                      </div>
                    </td>

                    {/* Actions toggle */}
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => toggleDropdown(produit.id)}
                        className={`p-2 rounded-xl transition ${isOpen ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        <FaEllipsisV size={12} />
                      </button>
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {isOpen && (
                    <tr className="bg-violet-50/30 border-b border-violet-100">
                      <td colSpan="6" className="px-5 py-5">
                        <div className="flex flex-col lg:flex-row gap-5">
                          {/* Info panel */}
                          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                              <FaTag className="text-violet-400" /> Détails du Produit
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Catégorie</p>
                                <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">{produit.categorie_nom || 'N/C'}</span>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Prix Achat (Gros)</p>
                                <span className="text-sm font-bold text-emerald-600">{parseFloat(produit.prix_achat || 0).toLocaleString('fr-FR')} Fmg</span>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Prix Achat (Détail)</p>
                                <span className="text-sm font-bold text-emerald-600">{parseFloat(produit.prix_achat_piece || 0).toLocaleString('fr-FR')} Fmg</span>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Seuil Alerte</p>
                                <span className="text-xs font-semibold text-red-600">{produit.stock_threshold || 0} {produit.nom_unite_gros}</span>
                              </div>

                              {/* Entrepôts */}
                              {(produit.entrepots_list || []).length > 0 && (
                                <div className="col-span-2">
                                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                                    <FaWarehouse className="text-blue-400" /> Localisations
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {(produit.entrepots_list || []).map(e => (
                                      <span key={e.id} className={`text-xs px-2 py-0.5 rounded-full font-medium border ${e.type === 'magasin' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
                                        {e.nom} ({e.type})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="col-span-2 md:col-span-4">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Description</p>
                                <p className="text-xs text-gray-600 leading-relaxed">{produit.description || 'Aucune description.'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Action panel */}
                          <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
                            <button onClick={() => { setModalProduit(produit); setOpenDropdownId(null); }}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition">
                              <FaEye /> Historique & Détails
                            </button>
                            <div className="grid grid-cols-2 gap-2">
                              <button onClick={() => { openMode(produit.id, 'add', produit.prix_achat); setOpenDropdownId(null); }}
                                className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl transition">
                                <FaPlus size={11} /> Stock
                              </button>
                              <button onClick={() => { openMode(produit.id, 'remove'); setOpenDropdownId(null); }}
                                className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition">
                                <FaMinus size={11} /> Retirer
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                              <button onClick={() => { handleEdit(produit); setOpenDropdownId(null); }} disabled={isLoading}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition">
                                <FaEdit size={12} /> Modifier
                              </button>
                              <button onClick={() => { handleDelete(produit.id); setOpenDropdownId(null); }} disabled={isLoading}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition">
                                <FaTrash size={12} /> Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} itemsPerPage={itemsPerPage}
        totalItems={filteredProduits.length} onPageChange={onPageChange} />

      {modalProduit && <ProduitHistoriqueModal produit={modalProduit} onClose={() => setModalProduit(null)} />}
    </div>
  );
};

export default ProduitTable;