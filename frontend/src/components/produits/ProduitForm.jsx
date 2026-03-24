import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { FaBox, FaInfoCircle, FaHashtag, FaDollarSign, FaSave, FaTimes, FaPlus, FaCheck, FaExclamationTriangle, FaTag, FaTruck } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import SearchSelect from '../factures/SearchSelect';

const ProduitForm = ({
  formData,
  editingProduit,
  isLoading,
  message,
  success,
  handleChange,
  setFormData,
  handleSubmit,
  handleCancel,
  formRef
}) => {
  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [unlinkedPurchases, setUnlinkedPurchases] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [hasDetail, setHasDetail] = useState(true);

  // Sync hasDetail with pieces_par_carton on edit or import
  useEffect(() => {
    if (formData.pieces_par_carton > 1 || formData.stock_pieces > 0 || formData.prix_piece > 0) {
      setHasDetail(true);
    } else if (editingProduit && formData.pieces_par_carton === 1) {
      setHasDetail(false);
    }
  }, [formData.pieces_par_carton, editingProduit]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error("Erreur chargement catégories:", error);
      }
    };
    const fetchFournisseurs = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/fournisseurs`);
        setFournisseurs(response.data);
      } catch (error) {
        console.error("Erreur chargement fournisseurs:", error);
      }
    };
    fetchCategories();
    fetchFournisseurs();
    fetchUnlinkedPurchases();
  }, [editingProduit]);

  const fetchUnlinkedPurchases = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/produits/unlinked-purchases`);
      setUnlinkedPurchases(res.data);
    } catch (err) {
      console.error("Erreur chargement achats non liés:", err);
    }
  };

  const handleImportPurchase = (purchase) => {
    // Correctly update all fields at once
    setFormData(prev => ({
      ...prev,
      nom: purchase.nom,
      prix_achat: purchase.prix_achat,
      prix_achat_piece: purchase.prix_achat_piece || 0,
      nom_unite_gros: purchase.unite || 'Carton',
      unité: 'Pièce', // Default détail name
      stock_cartons: purchase.quantite,
      stock_pieces: 0,
      pieces_par_carton: 1,
      category_id: purchase.category_id || prev.category_id || '',
      fournisseur_id: purchase.fournisseur_id || prev.fournisseur_id || '',
      importSourceId: purchase.id
    }));
    setHasDetail(false); // Default to no detail for generic imports
    setShowImportModal(false);
  };


  return (
    <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto relative">
      <form onSubmit={handleSubmit} ref={formRef}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-700">
              {editingProduit ? 'Modifier Produit' : 'Ajouter un Nouveau Produit'}
            </h2>
            {!editingProduit && unlinkedPurchases.length > 0 && (
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-md hover:bg-orange-200 transition font-medium"
              >
                Importer un achat
              </button>
            )}
          </div>
          {editingProduit && (
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <FaTimes className="inline mr-1" /> Annuler
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaTag className="mr-2 text-blue-500" /> Catégorie
              </label>
              <SearchSelect
                value={formData.category_id || ''}
                onChange={(value) => handleChange({ target: { name: 'category_id', value } })}
                options={categories.map(cat => ({
                  value: cat.id,
                  label: cat.nom
                }))}
                placeholder="Sélectionner une catégorie"
              />
            </div>
            <div>
              <label htmlFor="fournisseur_id" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaTruck className="mr-2 text-blue-500" /> Fournisseur
              </label>
              <SearchSelect
                value={formData.fournisseur_id || ''}
                onChange={(value) => handleChange({ target: { name: 'fournisseur_id', value } })}
                options={fournisseurs.map(f => ({
                  value: f.id,
                  label: f.nom
                }))}
                placeholder="Sélectionner un fournisseur"
              />
            </div>
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaBox className="mr-2 text-blue-500" /> Nom du Produit
              </label>
              <input
                type="text"
                name="nom"
                placeholder="Nom du produit"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nom_unite_gros" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaBox className="mr-2 text-blue-500" /> Unité de Gros
                </label>
                <input
                  type="text"
                  name="nom_unite_gros"
                  placeholder="ex: Carton, Sac, Boite"
                  value={formData.nom_unite_gros || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="unité" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaBox className="mr-2 text-blue-500" /> Unité de Détail
                </label>
                <input
                  type="text"
                  name="unité"
                  placeholder="ex: Pièce, kg, Litre"
                  value={formData.unité || ''}
                  onChange={handleChange}
                  disabled={!hasDetail}
                  className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${!hasDetail ? 'bg-gray-50 text-gray-400' : ''}`}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 py-2">
              <input
                type="checkbox"
                id="hasDetail"
                checked={hasDetail}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setHasDetail(checked);
                  if (!checked) {
                    handleChange({ target: { name: 'pieces_par_carton', value: 1 } });
                    handleChange({ target: { name: 'stock_pieces', value: 0 } });
                    handleChange({ target: { name: 'prix_piece', value: 0 } });
                  } else {
                    if (formData.pieces_par_carton <= 1) {
                      handleChange({ target: { name: 'pieces_par_carton', value: '' } });
                    }
                  }
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="hasDetail" className="text-sm font-medium text-gray-700">
                Gérer également la vente au détail ({formData.unité || 'Pièce'})
              </label>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaInfoCircle className="mr-2 text-blue-500" /> Description
              </label>
              <textarea
                name="description"
                placeholder="Description du produit"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <label htmlFor="stock_cartons" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaBox className="mr-2 text-blue-500" /> Quantité ({formData.nom_unite_gros || 'Gros'})
                </label>
                 <input
                   type="number"
                   name="stock_cartons"
                   placeholder={formData.nom_unite_gros || 'Gros'}
                   value={formData.stock_cartons === undefined ? '' : formData.stock_cartons}
                   onChange={handleChange}
                   required
                   min="0"
                   step="1"
                   disabled={!!editingProduit}
                   className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${!!editingProduit ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                 />
               </div>
               <div className={`w-1/2 ${(!hasDetail || !!editingProduit) ? 'opacity-50 pointer-events-none' : ''}`}>
                 <label htmlFor="stock_pieces" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                   <FaHashtag className="mr-2 text-blue-500" /> {formData.unité || 'Détail'} (suppl.)
                 </label>
                 <input
                   type="number"
                   name="stock_pieces"
                   placeholder={formData.unité || 'Détail'}
                   value={formData.stock_pieces === undefined ? '' : formData.stock_pieces}
                   onChange={handleChange}
                   min="0"
                   step="1"
                   disabled={!!editingProduit}
                   className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${(!hasDetail || !!editingProduit) ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                 />
              </div>
            </div>
            <div className={!hasDetail ? 'hidden' : ''}>
              <label htmlFor="pieces_par_carton" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaBox className="mr-2 text-blue-500" /> {formData.unité || 'Détail'} par {formData.nom_unite_gros || 'Gros'}
              </label>
              <input
                type="number"
                name="pieces_par_carton"
                placeholder={`Nombre de ${formData.unité || 'Détail'} dans 1 ${formData.nom_unite_gros || 'Gros'}`}
                value={formData.pieces_par_carton || ''}
                onChange={handleChange}
                required={hasDetail}
                min="1"
                step="1"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label htmlFor="prix_carton" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaDollarSign className="mr-2 text-blue-500" /> Prix de vente ({formData.nom_unite_gros || 'Gros'})
              </label>
              <input
                type="number"
                name="prix_carton"
                placeholder={`Prix de vente d'un ${formData.nom_unite_gros || 'Gros'}`}
                value={formData.prix_carton || ''}
                onChange={handleChange}
                required
                min="0.01"
                step="1"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div className={!hasDetail ? 'hidden' : ''}>
              <label htmlFor="prix_piece" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaDollarSign className="mr-2 text-blue-500" /> Prix de vente ({formData.unité || 'Détail'})
              </label>
              <input
                type="number"
                name="prix_piece"
                placeholder={`Prix de vente d'un ${formData.unité || 'Détail'}`}
                value={formData.prix_piece || ''}
                onChange={handleChange}
                required={hasDetail}
                min="0.01"
                step="1"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
              <div className="border border-red-200 rounded-lg p-3 bg-red-50 mt-4">
                <label htmlFor="stock_threshold" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaExclamationTriangle className="mr-2 text-red-500" /> Seuil de stock ({formData.nom_unite_gros || 'Gros'})
                </label>
                <input
                  type="number"
                  name="stock_threshold"
                  placeholder="Seuil pour notification"
                  value={formData.stock_threshold === undefined ? '' : formData.stock_threshold}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
                />
                <p className="text-xs text-red-600 mt-2">🔔 Notification si stock inférieur ou égal à ce seuil (en {formData.nom_unite_gros || 'Gros'})</p>
              </div>
              <div className="border border-orange-200 rounded-lg p-3 bg-orange-50 mt-4">
              <label htmlFor="prix_achat" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaDollarSign className="mr-2 text-orange-500" /> Prix d'Achat ({formData.nom_unite_gros || 'Gros'})
              </label>
              <input
                type="number"
                name="prix_achat"
                placeholder={`Coût d'achat pour 1 ${formData.nom_unite_gros || 'Gros'}`}
                value={formData.prix_achat || ''}
                onChange={handleChange}
                min="0"
                step="1"
                required
                className="w-full px-4 py-2 rounded-lg border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition mb-3"
              />
              <div className={!hasDetail ? 'hidden' : ''}>
                <label htmlFor="prix_achat_piece" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaDollarSign className="mr-2 text-orange-500" /> Prix d'Achat ({formData.unité || 'Détail'})
                </label>
                <input
                  type="number"
                  name="prix_achat_piece"
                  placeholder={`Optionnel (Sinon calculé: Gros / Pièces)`}
                  value={formData.prix_achat_piece || ''}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 rounded-lg border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>
              <p className="text-xs text-orange-600 mt-2">⚡ Sera utilisé pour les futurs mouvements de stock dans l'historique</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium flex items-center"
            disabled={isLoading}
          >
            <FaTimes className="mr-2" /> Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition font-medium flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <ClipLoader size={18} color="#ffffff" className="mr-2" />
            ) : (
              <>
                {editingProduit ? (
                  <FaSave className="mr-2" />
                ) : (
                  <FaPlus className="mr-2" />
                )}
                {editingProduit ? 'Enregistrer' : 'Ajouter'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal d'Importation */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
            <h3 className="text-lg font-bold mb-4">Choisir un achat à importer</h3>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {unlinkedPurchases.map(purchase => (
                <div
                  key={purchase.id}
                  onClick={() => handleImportPurchase(purchase)}
                  className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{purchase.nom}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(purchase.created_at).toLocaleDateString()} - {purchase.quantite} {purchase.unite}
                      {purchase.fournisseur_nom && ` • ${purchase.fournisseur_nom}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{purchase.prix_achat.toLocaleString()} Ar</p>
                  </div>
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