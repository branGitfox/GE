import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import {
  FaBox, FaInfoCircle, FaHashtag, FaDollarSign, FaSave, FaTimes,
  FaPlus, FaExclamationTriangle, FaTag, FaTruck, FaWarehouse, FaCheck
} from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import SearchSelect from '../factures/SearchSelect';
import PriceInput from '../PriceInput';

const ProduitForm = ({
  formData,
  editingProduit,
  isLoading,
  handleChange,
  setFormData,
  handleSubmit,
  handleCancel,
  formRef
}) => {
  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [entrepots, setEntrepots] = useState([]);
  const [unlinkedPurchases, setUnlinkedPurchases] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [hasDetail, setHasDetail] = useState(true);

  useEffect(() => {
    if (formData.pieces_par_carton > 1 || formData.stock_pieces > 0 || formData.prix_piece > 0) {
      setHasDetail(true);
    } else if (editingProduit && formData.pieces_par_carton === 1) {
      setHasDetail(false);
    }
  }, [formData.pieces_par_carton, editingProduit]);

  // Auto-calculer le prix d'achat à la pièce s'il est vide
  useEffect(() => {
    const ratio = parseFloat(formData.pieces_par_carton) || 1;
    const pAchatGros = parseFloat(formData.prix_achat) || 0;
    const pAchatPiece = parseFloat(formData.prix_achat_piece) || 0;

    if (hasDetail && ratio > 1 && pAchatGros > 0 && pAchatPiece === 0) {
      setFormData(prev => ({
        ...prev,
        prix_achat_piece: pAchatGros / ratio
      }));
    }
  }, [formData.prix_achat, formData.pieces_par_carton, hasDetail]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        };
        const [catRes, fourRes, entRes, unlinkedRes] = await Promise.all([
          axios.get(`${API_URL}/api/categories`, config),
          axios.get(`${API_URL}/api/fournisseurs`, config),
          axios.get(`${API_URL}/api/entrepots`, config),
          axios.get(`${API_URL}/api/produits/unlinked-purchases`, config)
        ]);
        setCategories(catRes.data);
        setFournisseurs(fourRes.data);
        setEntrepots(entRes.data);
        setUnlinkedPurchases(unlinkedRes.data);
      } catch (err) {
        console.error('Erreur chargement données formulaire:', err);
      }
    };
    fetchData();
  }, [editingProduit]);

  const handleImportPurchase = (purchase) => {
    setFormData(prev => ({
      ...prev,
      nom: purchase.nom,
      prix_achat: purchase.prix_achat,
      prix_achat_piece: purchase.prix_achat_piece || 0,
      nom_unite_gros: purchase.unite || 'Carton',
      unité: 'Pièce',
      stock_cartons: purchase.quantite,
      stock_pieces: 0,
      pieces_par_carton: 1,
      category_id: purchase.category_id || prev.category_id || '',
      fournisseur_ids: purchase.fournisseur_id ? [purchase.fournisseur_id] : prev.fournisseur_ids || [],
      importSourceId: purchase.id
    }));
    setHasDetail(false);
    setShowImportModal(false);
  };

  const toggleFournisseur = (id) => {
    const curr = formData.fournisseur_ids || [];
    const updated = curr.includes(id) ? curr.filter(f => f !== id) : [...curr, id];
    handleChange({ target: { name: 'fournisseur_ids', value: updated } });
  };

  const toggleEntrepot = (id) => {
    const curr = formData.entrepot_ids || [];
    const updated = curr.includes(id) ? curr.filter(e => e !== id) : [...curr, id];
    handleChange({ target: { name: 'entrepot_ids', value: updated } });
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1";

  return (
    <div
      ref={formRef}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            {editingProduit ? <FaSave className="text-white" /> : <FaPlus className="text-white" />}
          </div>
          <div>
            <h2 className="text-white font-bold text-base">
              {editingProduit ? 'Modifier le Produit' : 'Nouveau Produit'}
            </h2>
            <p className="text-white/70 text-xs">
              {editingProduit ? 'Modifiez les informations (les prix historiques sont préservés)' : 'Remplissez les informations du produit'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editingProduit && unlinkedPurchases.length > 0 && (
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="text-xs bg-white/20 text-white px-3 py-1.5 rounded-lg hover:bg-white/30 transition font-medium border border-white/30"
            >
              Importer achat
            </button>
          )}
          {editingProduit && (
            <button type="button" onClick={handleCancel} className="text-white/70 hover:text-white transition">
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* COL 1 – Infos de base */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Informations</p>

            {/* Catégorie */}
            <div>
              <label className={labelCls}><FaTag className="inline mr-1 text-violet-400" /> Catégorie</label>
              <SearchSelect
                value={formData.category_id || ''}
                onChange={(v) => handleChange({ target: { name: 'category_id', value: v } })}
                options={categories.map(c => ({ value: c.id, label: c.nom }))}
                placeholder="Catégorie..."
              />
            </div>

            {/* Nom produit */}
            <div>
              <label className={labelCls}><FaBox className="inline mr-1 text-violet-400" /> Nom du Produit *</label>
              <input type="text" name="nom" value={formData.nom} onChange={handleChange}
                placeholder="Nom du produit" required className={inputCls} />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}><FaInfoCircle className="inline mr-1 text-violet-400" /> Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                placeholder="Description..." rows="3" className={inputCls} />
            </div>

            {/* Unités */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Unité Gros</label>
                <input type="text" name="nom_unite_gros" value={formData.nom_unite_gros || ''} onChange={handleChange}
                  placeholder="Carton, Sac…" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Unité Détail</label>
                <input type="text" name="unité" value={formData.unité || ''} onChange={handleChange}
                  placeholder="Pièce, kg…" disabled={!hasDetail}
                  className={`${inputCls} ${!hasDetail ? 'bg-gray-50 text-gray-400' : ''}`} />
              </div>
            </div>

            {/* Checkbox détail */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${hasDetail ? 'bg-violet-600 border-violet-600' : 'border-gray-300'}`}
                onClick={() => {
                  const checked = !hasDetail;
                  setHasDetail(checked);
                  if (!checked) {
                    handleChange({ target: { name: 'pieces_par_carton', value: 1 } });
                    handleChange({ target: { name: 'stock_pieces', value: 0 } });
                    handleChange({ target: { name: 'prix_piece', value: 0 } });
                  } else if (formData.pieces_par_carton <= 1) {
                    handleChange({ target: { name: 'pieces_par_carton', value: '' } });
                  }
                }}>
                {hasDetail && <FaCheck className="text-white text-xs" />}
              </div>
              <span className="text-xs font-medium text-gray-600">Vente au détail ({formData.unité || 'Pièce'})</span>
            </label>
          </div>

          {/* COL 2 – Stock & Prix */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Stock & Prix de Vente</p>

            {/* Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}><FaHashtag className="inline mr-1 text-violet-400" /> {formData.nom_unite_gros || 'Gros'}</label>
                <input type="number" name="stock_cartons" value={formData.stock_cartons ?? ''} onChange={handleChange}
                  step="1" required disabled={!!editingProduit}
                  className={`${inputCls} ${editingProduit ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`} />
              </div>
              <div className={!hasDetail || !!editingProduit ? 'opacity-50 pointer-events-none' : ''}>
                <label className={labelCls}>{formData.unité || 'Détail'} (suppl.)</label>
                <input type="number" name="stock_pieces" value={formData.stock_pieces ?? ''} onChange={handleChange}
                  step="1" disabled={!!editingProduit}
                  className={`${inputCls} bg-gray-50 text-gray-500`} />
              </div>
            </div>

            {/* Pièces par carton */}
            {hasDetail && (
              <div>
                <label className={labelCls}>{formData.unité || 'Pièce'} par {formData.nom_unite_gros || 'Carton'}</label>
                <input type="number" name="pieces_par_carton" value={formData.pieces_par_carton || ''} onChange={handleChange}
                  min="2" step="1" required={hasDetail} className={inputCls} />
              </div>
            )}

            {/* Prix vente Gros */}
            <div>
              <label className={labelCls}><FaDollarSign className="inline mr-1 text-violet-400" /> Prix Vente ({formData.nom_unite_gros || 'Gros'})</label>
              <PriceInput
                name="prix_carton"
                value={formData.prix_carton || ''}
                onChange={handleChange}
                className={inputCls}
                placeholder="Prix en gros"
              />
            </div>

            {/* Prix vente Détail */}
              <div className={!hasDetail ? 'opacity-50 pointer-events-none' : ''}>
                <label className={labelCls}><FaDollarSign className="inline mr-1 text-violet-400" /> Prix Vente ({formData.unité || 'Détail'})</label>
                <PriceInput
                  name="prix_piece"
                  value={formData.prix_piece || ''}
                  onChange={handleChange}
                  className={inputCls}
                  required={hasDetail}
                  placeholder="Prix au détail"
                />
              </div>

            {/* Seuil alerte */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-3">
              <label className="block text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
                <FaExclamationTriangle className="inline mr-1" /> Seuil Alerte Stock
              </label>
              <input type="number" name="stock_threshold" value={formData.stock_threshold ?? ''} onChange={handleChange}
                step="1" placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-red-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 text-sm" />
              <p className="text-xs text-red-400 mt-1">🔔 Alerte si stock ≤ seuil (en {formData.nom_unite_gros || 'Gros'})</p>
            </div>
          </div>

          {/* COL 3 – Fournisseurs, Entrepôt, Prix Achat */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Fournisseurs & Logistique</p>

            {/* Multi-select Fournisseurs */}
            <div>
              <label className={labelCls}><FaTruck className="inline mr-1 text-violet-400" /> Fournisseurs (plusieurs possibles)</label>
              <div className="border border-gray-200 rounded-xl p-2 max-h-36 overflow-y-auto space-y-1 bg-gray-50">
                {fournisseurs.length === 0
                  ? <p className="text-xs text-gray-400 text-center py-2">Aucun fournisseur</p>
                  : fournisseurs.map(f => {
                    const sel = (formData.fournisseur_ids || []).includes(f.id);
                    return (
                      <button
                        key={f.id} type="button"
                        onClick={() => toggleFournisseur(f.id)}
                        className={`w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${sel ? 'bg-violet-100 text-violet-700 border border-violet-200' : 'text-gray-600 hover:bg-white border border-transparent'}`}
                      >
                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${sel ? 'bg-violet-600 border-violet-600' : 'border-gray-300'}`}>
                          {sel && <FaCheck className="text-white text-[8px]" />}
                        </span>
                        {f.nom}
                        {sel && (formData.fournisseur_ids || [])[0] === f.id && (
                          <span className="ml-auto text-[9px] bg-violet-600 text-white px-1.5 py-0.5 rounded-full">Principal</span>
                        )}
                      </button>
                    );
                  })
                }
              </div>
              {(formData.fournisseur_ids || []).length > 0 && (
                <p className="text-xs text-gray-400 mt-1">Le 1er sélectionné est le fournisseur principal</p>
              )}
            </div>

            {/* Multi-select Entrepôts */}
            <div>
              <label className={labelCls}><FaWarehouse className="inline mr-1 text-violet-400" /> Localisation (Entrepôt / Magasin)</label>
              <div className="border border-gray-200 rounded-xl p-2 max-h-28 overflow-y-auto space-y-1 bg-gray-50">
                {entrepots.length === 0
                  ? <p className="text-xs text-gray-400 text-center py-2">Aucun entrepôt créé</p>
                  : entrepots.map(e => {
                    const sel = (formData.entrepot_ids || []).includes(e.id);
                    return (
                      <button
                        key={e.id} type="button"
                        onClick={() => toggleEntrepot(e.id)}
                        className={`w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${sel ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-white border border-transparent'}`}
                      >
                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${sel ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                          {sel && <FaCheck className="text-white text-[8px]" />}
                        </span>
                        <span>{e.nom}</span>
                        <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full ${e.type === 'magasin' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'}`}>
                          {e.type}
                        </span>
                      </button>
                    );
                  })
                }
              </div>
            </div>

            {/* Prix achat */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-3">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">💰 Prix d'Achat</p>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{formData.nom_unite_gros || 'Gros'}</label>
                <PriceInput
                  name="prix_achat"
                  value={formData.prix_achat || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                  placeholder="Prix d'achat gros"
                />
              </div>
                <div className={!hasDetail ? 'opacity-50 pointer-events-none' : ''}>
                  <label className="text-xs text-gray-500 mb-1 block">{formData.unité || 'Détail'} (optionnel)</label>
                  <PriceInput
                    name="prix_achat_piece"
                    value={formData.prix_achat_piece || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                    placeholder="Calculé auto si vide"
                  />
                </div>
              <p className="text-xs text-amber-500">⚡ Utilisé pour les futurs mouvements de stock · Les prix antérieurs sont préservés</p>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
          <button type="button" onClick={handleCancel} disabled={isLoading}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition flex items-center gap-2">
            <FaTimes /> Annuler
          </button>
          <button type="submit" disabled={isLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
            {isLoading ? <ClipLoader size={16} color="#ffffff" /> : (editingProduit ? <FaSave /> : <FaPlus />)}
            {editingProduit ? 'Enregistrer' : 'Ajouter le Produit'}
          </button>
        </div>
      </form>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button onClick={() => setShowImportModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
            <h3 className="text-base font-bold mb-4 text-gray-800">Importer depuis un achat existant</h3>
            <div className="max-h-72 overflow-y-auto space-y-2">
              {unlinkedPurchases.map(p => (
                <div key={p.id} onClick={() => handleImportPurchase(p)}
                  className="p-3 border border-gray-100 rounded-xl hover:bg-violet-50 hover:border-violet-200 cursor-pointer transition flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{p.nom}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(p.created_at).toLocaleDateString()} · {p.quantite} {p.unite}
                      {p.fournisseur_nom && ` · ${p.fournisseur_nom}`}
                    </p>
                  </div>
                  <p className="font-bold text-violet-600 text-sm">{p.prix_achat.toLocaleString()} Ar</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProduitForm;