import React, { useRef, useEffect, useState } from "react";
import { FaUser, FaBox, FaPlus, FaTrash, FaTimes, FaSave, FaFileAlt, FaComment, FaLock, FaLockOpen } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import SearchSelect from './SearchSelect';
import PriceInput from '../PriceInput';
import PasswordModal from '../PasswordModal';
import { toast } from 'react-toastify';

const FactureForm = ({
  nouvelleFacture,
  nouvelArticle,
  loading,
  clients,
  produits,
  handleChange,
  handleChangeArticle,
  handleAjouterArticle,
  handleSupprimerArticle,
  handleUpdateArticlePrice,
  handleAnnuler,
  handleSubmit,
  isEditMode,
  isProforma = false
}) => {
  const [isPriceUnlocked, setIsPriceUnlocked] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const articleListRef = useRef(null);
  const prevArticlesCount = useRef(nouvelleFacture.liste_articles.length);

  // Scroll to article list when an article is added
  useEffect(() => {
    if (nouvelleFacture.liste_articles.length > prevArticlesCount.current) {
      if (articleListRef.current) {
        articleListRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    prevArticlesCount.current = nouvelleFacture.liste_articles.length;
  }, [nouvelleFacture.liste_articles.length]);

  const handlePasswordConfirm = (password) => {

    if (password === import.meta.env.VITE_PASSCODE) {
      setIsPriceUnlocked(true);
      setIsAuthModalOpen(false);
      toast.success("Prix déverrouillés !");
    } else {
      toast.error("Mot de passe incorrect.");
    }
  };

  return (
    <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        {isEditMode ? (isProforma ? 'Modifier le Devis' : 'Modifier Facture') : (isProforma ? 'Nouveau Devis' : 'Nouvelle Facture')}
      </h2>

      <div className="mb-6 flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Type de Client:</label>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => handleChange({ target: { name: "isTempClient", value: false } })}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${!nouvelleFacture.isTempClient ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Client Permanent
          </button>
          <button
            type="button"
            onClick={() => handleChange({ target: { name: "isTempClient", value: true } })}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${nouvelleFacture.isTempClient ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Client Occasionnel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {!nouvelleFacture.isTempClient ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FaUser className="mr-2 text-blue-500" />
              Client Permanent
            </label>
            <SearchSelect
              value={nouvelleFacture.client_id}
              onChange={(value) => handleChange({ target: { name: "client_id", value } })}
              options={clients.map(client => ({
                value: client.id,
                label: `${client.nom} - ${client.email}`
              }))}
              placeholder="Rechercher un client..."
              loading={loading.clients}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FaUser className="mr-2 text-blue-500" />
              Nom du Client Occasionnel
            </label>
            <input
              type="text"
              name="temp_client_nom"
              value={nouvelleFacture.temp_client_nom}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Nom complet..."
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date de facturation</label>
          <input
            type="date"
            name="date_facture"
            value={nouvelleFacture.date_facture}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            required
          />
        </div>
      </div>

      {nouvelleFacture.isTempClient && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
            <input
              type="text"
              name="temp_client_adresse"
              value={nouvelleFacture.temp_client_adresse}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Adresse..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
            <input
              type="text"
              name="temp_client_telephone"
              value={nouvelleFacture.temp_client_telephone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Téléphone..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="temp_client_email"
              value={nouvelleFacture.temp_client_email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Email (facultatif)..."
            />
          </div>
        </div>
      )}

      {/* Nouveaux champs Objet et Commentaire */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FaFileAlt className="mr-2 text-blue-500" />
            Objet
          </label>
          <input
            type="text"
            name="Objet"
            value={nouvelleFacture.Objet || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Objet de la facture (facultatif)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FaComment className="mr-2 text-blue-500" />
            Autre commentaire
          </label>
          <textarea
            name="commentaire"
            value={nouvelleFacture.commentaire || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Commentaires supplémentaires (facultatif)"
          />
        </div>
      </div>



      {/* Ajout d'articles */}
      <div className="mb-6">
        <h3 ref={articleListRef} className="text-lg font-medium mb-4 flex items-center">
          <FaBox className="mr-2 text-blue-500" />
          Articles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Produit</label>
            <SearchSelect
              value={nouvelArticle.produit_id}
              onChange={(value) => {
                const selectedProduit = produits.find(p => p.id == value);
                if (selectedProduit) {
                  handleChangeArticle({ target: { name: "produit_id", value: selectedProduit.id } });
                  handleChangeArticle({ target: { name: "nom", value: selectedProduit.nom } });
                  // Initialize type_vente and price fields
                  const defaultType = 'carton';
                  handleChangeArticle({ target: { name: "type_vente", value: defaultType } });
                  handleChangeArticle({ target: { name: "unité", value: defaultType === 'carton' ? (selectedProduit.nom_unite_gros || 'Gros') : (selectedProduit.unité || 'Détail') } });
                  handleChangeArticle({ target: { name: "prix", value: defaultType === 'carton' ? selectedProduit.prix_carton : selectedProduit.prix_piece } });
                  handleChangeArticle({ target: { name: "prix_carton", value: selectedProduit.prix_carton } });
                  handleChangeArticle({ target: { name: "prix_piece", value: selectedProduit.prix_piece } });
                  handleChangeArticle({ target: { name: "prix_achat", value: selectedProduit.prix_achat } });
                  handleChangeArticle({ target: { name: "prix_achat_piece", value: selectedProduit.prix_achat_piece } });
                  handleChangeArticle({ target: { name: "pieces_par_carton", value: selectedProduit.pieces_par_carton } });
                  handleChangeArticle({ target: { name: "nom_unite_gros", value: selectedProduit.nom_unite_gros } });
                  handleChangeArticle({ target: { name: "unité_détail", value: selectedProduit.unité } });
                }
              }}
              options={produits.map(produit => {
                const cartons = Math.floor(produit.quantite / (produit.pieces_par_carton || 1));
                const pieces = produit.quantite % (produit.pieces_par_carton || 1);
                const stockStr = (produit.pieces_par_carton || 1) > 1
                  ? `${cartons} ${produit.nom_unite_gros || 'Gros'}, ${pieces} ${produit.unité || 'Détail'}`
                  : `${produit.quantite} ${produit.nom_unite_gros || 'Détail'}`;
                return {
                  value: produit.id,
                  label: `${produit.nom} - ${produit.nom_unite_gros || 'Gros'}:${new Intl.NumberFormat('fr-FR').format(produit.prix_carton)} FMG / ${produit.unité || 'Détail'}:${new Intl.NumberFormat('fr-FR').format(produit.prix_piece)} FMG (Stock: ${stockStr})`
                };
              })}
              placeholder="Rechercher un produit..."
              loading={loading.produits}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vente par</label>
            <select
              name="type_vente"
              value={nouvelArticle.type_vente || 'piece'}
              onChange={(e) => {
                const type = e.target.value;
                handleChangeArticle(e);
                // Update price automatically based on selection
                if (type === 'carton') {
                  if (nouvelArticle.prix_carton !== undefined) {
                    handleChangeArticle({ target: { name: "prix", value: nouvelArticle.prix_carton } });
                  }
                  handleChangeArticle({ target: { name: "unité", value: nouvelArticle.nom_unite_gros || 'Carton' } });
                } else if (type === 'piece') {
                  if (nouvelArticle.prix_piece !== undefined) {
                    handleChangeArticle({ target: { name: "prix", value: nouvelArticle.prix_piece } });
                  }
                  handleChangeArticle({ target: { name: "unité", value: nouvelArticle.unité_détail || 'Détail' } });
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="carton">{nouvelArticle.nom_unite_gros || 'Unité Gros'}</option>
              {nouvelArticle.pieces_par_carton > 1 && (
                <option value="piece">{nouvelArticle.unité_détail || 'Unité Détail'}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
            <input
              type="number"
              name="quantite"
              min="0"
              step="any"
              value={nouvelArticle.quantite}
              onChange={handleChangeArticle}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
              <span>Prix Unitaire</span>
              <button 
                type="button" 
                onClick={() => isPriceUnlocked ? setIsPriceUnlocked(false) : setIsAuthModalOpen(true)}
                className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded transition ${isPriceUnlocked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title={isPriceUnlocked ? "Verrouiller les prix" : "Déverrouiller pour modifier le prix"}
              >
                {isPriceUnlocked ? <><FaLockOpen size={10} /> Déverrouillé</> : <><FaLock size={10} /> Verrouillé</>}
              </button>
            </label>

            <PriceInput
              name="prix"
              value={nouvelArticle.prix}
              onChange={handleChangeArticle}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${isPriceUnlocked ? 'bg-white border-blue-300 ring-1 ring-blue-100' : 'bg-gray-100 border-gray-300'}`}
              disabled={!isPriceUnlocked}
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAjouterArticle}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-medium flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Ajouter
            </button>
          </div>
        </div>

        {nouvelleFacture.liste_articles.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Vente</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unité</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix Unitaire</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {nouvelleFacture.liste_articles.map((article, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{article.nom}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">{article.quantite}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center capitalize">{article.type_vente === 'carton' ? 'En gros' : 'En détail'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">{article.unité}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                        {isPriceUnlocked ? (
                          <PriceInput
                            value={article.prix}
                            onChange={(e) => handleUpdateArticlePrice(index, e.target.value)}
                            className="w-32 px-2 py-1 border border-blue-200 rounded text-center focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        ) : (
                          `${new Intl.NumberFormat('fr-FR').format(article.prix)} FMG`
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">{new Intl.NumberFormat('fr-FR').format(article.quantite * article.prix)} FMG</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleSupprimerArticle(index)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition"
                          title="Supprimer"
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-col items-end border-t pt-4">
              <div className="text-sm text-gray-600 mb-1">
                Sous-total: <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(nouvelleFacture.liste_articles.reduce((acc, art) => acc + (art.quantite * art.prix), 0))} FMG</span>
              </div>
              <div className="text-sm text-gray-600 mb-1 flex items-center">
                Remise:
                <PriceInput
                  name="remise"
                  value={nouvelleFacture.remise}
                  onChange={handleChange}
                  className="ml-2 w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition text-right"
                  placeholder="0"
                />
                <span className="ml-1">FMG</span>
              </div>
              <div className="text-lg font-bold text-gray-800 mt-2">
                Total Final: <span className="text-blue-600">{new Intl.NumberFormat('fr-FR').format(Math.max(0, nouvelleFacture.liste_articles.reduce((acc, art) => acc + (art.quantite * art.prix), 0) - (parseFloat(nouvelleFacture.remise) || 0)))} FMG</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Montant Payé */}
      {!isProforma && nouvelleFacture.liste_articles.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant Payé (FMG)</label>
            <PriceInput
              name="paiement"
              value={nouvelleFacture.paiement}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Entrez le montant reçu..."
            />
          </div>
          <div className="flex items-end">
            <div className={`w-full p-2 rounded-lg border font-bold text-center ${nouvelleFacture.paiement > nouvelleFacture.prix_total
              ? 'bg-red-100 border-red-500 text-red-700 animate-pulse'
              : nouvelleFacture.prix_total - nouvelleFacture.paiement <= 0
                ? 'bg-green-50 border-green-200 text-green-700'
                : nouvelleFacture.paiement > 0
                  ? 'bg-orange-50 border-orange-200 text-orange-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
              {nouvelleFacture.paiement > (nouvelleFacture.liste_articles.reduce((acc, art) => acc + (art.quantite * art.prix), 0) - (parseFloat(nouvelleFacture.remise) || 0))
                ? `⚠️ Attention: Montant dépasse le total (${new Intl.NumberFormat('fr-FR').format(nouvelleFacture.paiement - (nouvelleFacture.liste_articles.reduce((acc, art) => acc + (art.quantite * art.prix), 0) - (parseFloat(nouvelleFacture.remise) || 0)))} FMG en trop)`
                : (nouvelleFacture.liste_articles.reduce((acc, art) => acc + (art.quantite * art.prix), 0) - (parseFloat(nouvelleFacture.remise) || 0)) - nouvelleFacture.paiement <= 0
                  ? 'Facture Entièrement Payée ✅'
                  : `Reste à payer: ${new Intl.NumberFormat('fr-FR').format((nouvelleFacture.liste_articles.reduce((acc, art) => acc + (art.quantite * art.prix), 0) - (parseFloat(nouvelleFacture.remise) || 0)) - nouvelleFacture.paiement)} FMG`
              }
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleAnnuler}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium flex items-center"
        >
          <FaTimes className="mr-2" /> Annuler
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading.submit || nouvelleFacture.liste_articles.length === 0}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading.submit ? (
            <ClipLoader size={18} color="#ffffff" className="mr-2" />
          ) : (
            <FaSave className="mr-2" />
          )}
          {isEditMode ? (isProforma ? 'Modifier le Devis' : 'Modifier la Facture') : (isProforma ? 'Enregistrer le Devis' : 'Enregistrer la Facture')}
        </button>
      </div>

      <PasswordModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onConfirm={handlePasswordConfirm}
        message="Veuillez saisir le mot de passe administrateur pour modifier les prix de vente."
      />
    </div>
  );
};

export default FactureForm;