import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import {
  FiMail,
  FiPhone,
  FiFileText,
  FiArrowLeft,
  FiSearch,
  FiUser,
  FiCalendar,
  FiTag,
  FiMessageCircle,
  FiCreditCard,
  FiPackage,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiDollarSign,
  FiX
} from 'react-icons/fi';
import PDFButton from '../components/PDFButton';
import Pagination from '../components/factures/Pagination';
import ConfirmModal from '../components/ConfirmModal';

const ITEMS_PER_PAGE = 20;

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// Format Ariary
const formatAriary = (amount) => {
  if (!amount && amount !== 0) return '0 Fmg';
  return `${Number(amount).toLocaleString('fr-FR')} Fmg`;
};

const ClientsWithFactures = () => {
  const [clients, setClients] = useState([]);
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [facturePage, setFacturePage] = useState(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedFactureForPayment, setSelectedFactureForPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [remiseAmount, setRemiseAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [factureToConvert, setFactureToConvert] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientsRes, facturesRes] = await Promise.all([
        axios.get(`${API_URL}/api/clients`),
        axios.get(`${API_URL}/api/factures`),
      ]);
      setClients(clientsRes.data);
      setFactures(facturesRes.data);
    } catch (err) {
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fusion clients + clients temporaires
  const clientsAvecFactures = [
    ...clients.filter((client) =>
      factures.some((f) => f.client_id === client.id)
    ),
    ...factures
      .filter((f) => !f.client_id && f.temp_client_nom)
      .map((f) => ({
        id: `temp_${f.id}`,
        nom: f.temp_client_nom,
        email: f.temp_client_email,
        telephone: f.temp_client_telephone,
        adresse: f.temp_client_adresse,
        isTemp: true,
      })),
  ];

  // Filtre par recherche
  const filteredClients = clientsAvecFactures.filter((client) =>
    client.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone?.includes(searchTerm)
  );

  // Réinitialiser la page lors d'une nouvelle recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getFacturesForClient = (client) => {
    if (client.isTemp) {
      return factures.filter(
        (f) => !f.client_id && f.temp_client_nom === client.nom
      );
    }
    return factures.filter((f) => f.client_id === client.id);
  };

  const handleBack = () => {
    setSelectedClient(null);
    setFacturePage(1);
  };

  const handleConvertToFacture = async (factureId) => {
    setFactureToConvert(factureId);
    setIsConvertModalOpen(true);
  };

  const confirmConvert = async () => {
    if (!factureToConvert) return;
    setProcessing(true);
    try {
      await axios.put(`${API_URL}/api/factures/${factureToConvert}/convert`);
      await fetchData();
      alert("Devis converti en facture avec succès !");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la conversion.");
    } finally {
      setProcessing(false);
      setIsConvertModalOpen(false);
      setFactureToConvert(null);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
      alert("Veuillez entrer un montant valide.");
      return;
    }
    setProcessing(true);
    try {
      await axios.put(`${API_URL}/api/factures/${selectedFactureForPayment.id}/pay`, {
        montant: paymentAmount || 0,
        remise: remiseAmount || 0
      });
      setIsPaymentModalOpen(false);
      setSelectedFactureForPayment(null);
      setPaymentAmount('');
      setRemiseAmount('');
      await fetchData();
      alert("Paiement enregistré avec succès !");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'enregistrement du paiement.");
    } finally {
      setProcessing(false);
    }
  };

  // -------------------- LOADING --------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiFileText className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <p className="mt-6 text-xl font-medium text-gray-700">Chargement...</p>
        </div>
      </div>
    );
  }

  // -------------------- ERROR --------------------
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center max-w-lg border border-red-100">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center text-red-600 text-4xl mb-6">
            ⚠️
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Oups !</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // -------------------- MAIN RENDER --------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        {selectedClient ? (
          /* -------------------- DÉTAIL CLIENT -------------------- */
          <div className="max-w-6xl mx-auto">
            {/* Bouton retour */}
            <button
              onClick={handleBack}
              className="group mb-6 inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Retour à la liste des clients
            </button>

            {/* Carte client */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {selectedClient.nom?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedClient.nom}</h2>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                      {selectedClient.email && (
                        <span className="flex items-center gap-1">
                          <FiMail className="text-indigo-500" /> {selectedClient.email}
                        </span>
                      )}
                      {selectedClient.telephone && (
                        <span className="flex items-center gap-1">
                          <FiPhone className="text-indigo-500" /> {selectedClient.telephone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 justify-end">
                  {/* Total facturé */}
                  <div className="bg-indigo-50 rounded-lg px-4 py-2 text-center">
                    <p className="text-xs text-indigo-600 font-medium">Total facturé</p>
                    <p className="text-xl font-bold text-indigo-700">
                      {formatAriary(getFacturesForClient(selectedClient).reduce((acc, f) => acc + Number(f.prix_total || 0), 0))}
                    </p>
                    <p className="text-xs text-gray-500">{getFacturesForClient(selectedClient).length} document(s)</p>
                  </div>
                  {/* Total payé */}
                  <div className="bg-emerald-50 rounded-lg px-4 py-2 text-center">
                    <p className="text-xs text-emerald-600 font-medium">Total payé</p>
                    <p className="text-xl font-bold text-emerald-700">
                      {formatAriary(getFacturesForClient(selectedClient).reduce((acc, f) => acc + Number(f.paiement || 0), 0))}
                    </p>
                    <p className="text-xs text-gray-500">versements cumulés</p>
                  </div>
                  {/* Reste dû */}
                  {(() => {
                    const totalF = getFacturesForClient(selectedClient).reduce((acc, f) => acc + Number(f.prix_total || 0), 0);
                    const totalP = getFacturesForClient(selectedClient).reduce((acc, f) => acc + Number(f.paiement || 0), 0);
                    const reste = totalF - totalP;
                    return reste > 0 ? (
                      <div className="bg-rose-50 rounded-lg px-4 py-2 text-center">
                        <p className="text-xs text-rose-600 font-medium">Reste dû</p>
                        <p className="text-xl font-bold text-rose-700">{formatAriary(reste)}</p>
                        <p className="text-xs text-gray-500">non encore payé</p>
                      </div>
                    ) : (
                      <div className="bg-green-50 rounded-lg px-4 py-2 text-center">
                        <p className="text-xs text-green-600 font-medium">✅ Soldé</p>
                        <p className="text-xl font-bold text-green-700">Tout payé</p>
                        <p className="text-xs text-gray-500">aucun reste</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
              {selectedClient.adresse && (
                <div className="mt-3 flex items-start gap-2 text-gray-600 border-t pt-3 border-gray-100">
                  <FiMapPin className="text-indigo-500 mt-1 flex-shrink-0" />
                  <span className="text-sm">{selectedClient.adresse}</span>
                </div>
              )}
            </div>

            {/* Liste des factures */}
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiFileText className="text-indigo-600" />
              Documents ({getFacturesForClient(selectedClient).length})
            </h3>

            {(() => {
              const allFactures = getFacturesForClient(selectedClient);
              const totalFacturePages = Math.ceil(allFactures.length / ITEMS_PER_PAGE);
              const paginatedFacturesForClient = allFactures.slice(
                (facturePage - 1) * ITEMS_PER_PAGE,
                facturePage * ITEMS_PER_PAGE
              );

              if (allFactures.length === 0) {
                return (
                  <div className="bg-white/70 rounded-2xl p-8 text-center border border-dashed border-gray-300">
                    <FiFileText className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">Aucun document pour ce client.</p>
                  </div>
                );
              }

              return (
                <>
                  <div className="space-y-4">
                    {paginatedFacturesForClient.map((facture) => {
                      let articles = [];
                      try {
                        articles =
                          typeof facture.liste_articles === 'string'
                            ? JSON.parse(facture.liste_articles)
                            : facture.liste_articles || [];
                      } catch { }

                      const reste = Number(facture.prix_total) - Number(facture.paiement || 0);
                      const isUnpaid = reste > 0;

                      return (
                        <div
                          key={facture.id}
                          className={`rounded-2xl shadow-md overflow-hidden border hover:shadow-lg transition-all duration-300 ${isUnpaid && facture.status !== 'proforma' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}
                        >
                          {/* En-tête facture */}
                          <div className={`px-4 py-3 ${isUnpaid && facture.status !== 'proforma' ? 'bg-red-100 text-red-800 border-b border-red-200' : (facture.status === 'proforma' ? 'bg-yellow-500 text-white' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white')}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <span className="text-base font-semibold flex items-center gap-2">
                                  <FiTag className={isUnpaid && facture.status !== 'proforma' ? 'text-red-500' : ''} />
                                  <span className={isUnpaid && facture.status !== 'proforma' ? 'text-red-500 font-bold' : ''}>
                                    {facture.status === 'proforma' ? 'Devis ' : ''}{facture.numero_facture || (facture.status === 'proforma' ? `#${facture.id}` : `Facture #${facture.id}`)}
                                  </span>
                                  {facture.status === 'proforma' && (
                                    <span className="ml-2 px-2 py-0.5 bg-white text-yellow-700 text-xs font-bold rounded-full border border-yellow-200 uppercase shadow-sm">
                                      Proforma
                                    </span>
                                  )}
                                </span>
                                <div className={`flex items-center gap-3 mt-1 text-xs ${isUnpaid && facture.status !== 'proforma' ? 'text-red-600/80' : 'text-indigo-100'}`}>
                                  <span className="flex items-center gap-1">
                                    <FiCalendar /> {formatDate(facture.date_facture)}
                                  </span>
                                  {facture.created_by && (
                                    <span className="flex items-center gap-1">
                                      <FiUser /> {facture.created_by}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className={`text-xl font-bold ${isUnpaid && facture.status !== 'proforma' ? 'text-red-700' : ''}`}>{formatAriary(facture.prix_total)}</div>
                                  {facture.paiement !== undefined && (
                                    <div className={`text-xs ${isUnpaid && facture.status !== 'proforma' ? 'text-red-600/80' : 'text-indigo-100'}`}>
                                      Payé : {formatAriary(facture.paiement)}
                                      {Number(facture.remise || 0) > 0 && (
                                        <span className="ml-3 font-extrabold px-3 py-1 bg-yellow-400 text-gray-900 rounded-lg shadow-sm border border-yellow-500 text-[10px] animate-pulse">
                                          ✨ Il y a une remise de : {formatAriary(facture.remise)}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="bg-white/20 p-1 rounded-lg">
                                  <PDFButton facture={facture} />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Corps facture */}
                          <div className="p-4">
                            {facture.Objet && (
                              <div className="mb-3 flex items-start gap-2 text-sm text-gray-700">
                                <FiMessageCircle className="text-indigo-500 mt-1 flex-shrink-0" />
                                <span><span className="font-medium">Objet :</span> {facture.Objet}</span>
                              </div>
                            )}

                            {facture.commentaire && (
                              <div className="mb-3 flex items-start gap-2 text-sm text-gray-600">
                                <FiMessageCircle className="text-indigo-500 mt-1 flex-shrink-0" />
                                <span><span className="font-medium">Commentaire :</span> {facture.commentaire}</span>
                              </div>
                            )}

                            {facture.paiement !== undefined && facture.prix_total !== undefined && reste > 0 && (
                              <div className="mb-3 flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                                  <FiCreditCard />
                                  <span className="font-medium">Reste à payer : {formatAriary(reste)}</span>
                                </div>
                                {facture.date_paiement && (
                                  <p className="text-xs text-blue-600 font-bold italic ml-3 mt-1">
                                    Dernier paiement le : {formatDate(facture.date_paiement)} (Dernier versement: {formatAriary(facture.dernier_paiement || facture.paiement)} | Total payé: {formatAriary(facture.paiement)})
                                  </p>
                                )}
                              </div>
                            )}

                            {facture.paiement !== undefined && reste <= 0 && facture.date_paiement && (
                              <p className="mb-3 text-xs text-blue-600 font-bold italic px-3">
                                Totalement payé le : {formatDate(facture.date_paiement)} (Total payé: {formatAriary(facture.paiement)})
                              </p>
                            )}

                            {/* Articles */}
                            <div className="border-t pt-3">
                              <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                                <FiPackage className="text-indigo-500" />
                                Articles
                              </h4>

                              {articles.length === 0 ? (
                                <p className="text-gray-400 italic text-xs">Aucun article</p>
                              ) : (
                                <>
                                  <ul className="space-y-2">
                                    {articles.map((article, idx) => (
                                      <li
                                        key={idx}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs border-b border-gray-100 pb-1.5 last:border-0"
                                      >
                                        <div>
                                          <span className="font-medium">{article.nom}</span>
                                          <span className="text-gray-500 ml-1">
                                            {article.quantite} {article.unité || article.unite || (article.type_vente === 'carton' ? 'carton(s)' : 'pièce(s)')}
                                          </span>
                                        </div>
                                        <span className="text-indigo-600 font-medium">
                                          {formatAriary(article.prix * article.quantite)}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                  {facture.remise > 0 && (
                                    <div className="mt-3 pt-3 border-t border-dashed border-gray-200 space-y-1">
                                      <div className="flex justify-between text-xs text-gray-500">
                                        <span>Sous-total:</span>
                                        <span>{formatAriary(Number(facture.prix_total) + Number(facture.remise))}</span>
                                      </div>
                                      <div className="flex justify-between text-xs text-orange-600 font-medium">
                                        <span>Remise:</span>
                                        <span>- {formatAriary(facture.remise)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm font-bold text-gray-800">
                                        <span>Total Net:</span>
                                        <span>{formatAriary(facture.prix_total)}</span>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex flex-wrap gap-2 justify-end border-t pt-3">
                              {facture.status === 'proforma' && (
                                <button
                                  onClick={() => handleConvertToFacture(facture.id)}
                                  disabled={processing}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                                >
                                  <FiCheckCircle /> Convertir en Facture
                                </button>
                              )}
                              {facture.status !== 'proforma' && isUnpaid && (
                                <button
                                  onClick={() => {
                                    setSelectedFactureForPayment(facture);
                                    setIsPaymentModalOpen(true);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                  <FiDollarSign /> Ajouter Paiement
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalFacturePages > 1 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={facturePage}
                        totalPages={totalFacturePages}
                        itemsPerPage={ITEMS_PER_PAGE}
                        totalItems={allFactures.length}
                        onPageChange={(page) => setFacturePage(page)}
                      />
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        ) : (
          /* -------------------- LISTE CLIENTS (TABLEAU) -------------------- */
          <>
            {/* En-tête */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Clients avec Factures
                </h1>
                <p className="text-gray-500 mt-1 text-base">
                  Consultez et gérez vos clients actifs.
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-indigo-100">
                <span className="text-indigo-600 font-semibold">{filteredClients.length}</span>
                <span className="text-gray-600 ml-1 text-sm">client(s) actif(s)</span>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="mb-4 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un client (nom, email, téléphone)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all shadow-sm text-sm"
              />
            </div>

            {/* Tableau des clients */}
            {filteredClients.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-dashed border-gray-300">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-xl font-semibold text-gray-700 mb-1">Aucun client trouvé</p>
                <p className="text-gray-500">Essayez de modifier votre recherche.</p>
              </div>
            ) : (
              <>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-indigo-500 to-purple-600">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                            Client
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                            Contact
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                            Statut global
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {paginatedClients.map((client) => {
                          const facturesClient = getFacturesForClient(client);
                          const totalClient = facturesClient.reduce((acc, f) => acc + Number(f.prix_total || 0), 0);
                          const totalPaidClient = facturesClient.reduce((acc, f) => acc + Number(f.paiement || 0), 0);

                          const hasInvoices = facturesClient.some(f => f.status !== 'proforma');
                          const hasProformas = facturesClient.some(f => f.status === 'proforma');
                          const unpaidFactures = facturesClient.filter(f => f.status !== 'proforma' && (Number(f.prix_total) - Number(f.paiement || 0) > 0));

                          return (
                            <tr
                              key={client.id}
                              className="hover:bg-indigo-50/50 transition-colors duration-150 cursor-pointer"
                              onClick={() => {
                                setSelectedClient(client);
                                setFacturePage(1);
                              }}
                            >
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                    {client.nom?.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">{client.nom}</div>
                                    <div className="text-xs text-gray-500">
                                      Total: {formatAriary(totalClient)}
                                      {facturesClient.some(f => Number(f.remise || 0) > 0) && (
                                        <span className="ml-2 text-[9px] bg-orange-100 text-orange-700 px-1 rounded border border-orange-200 uppercase font-bold">Remise</span>
                                      )}
                                    </div>
                                    <div className="text-xs mt-0.5">
                                      <span className="text-emerald-600 font-semibold">Payé: {formatAriary(totalPaidClient)}</span>
                                      {totalClient - totalPaidClient > 0 && (
                                        <span className="ml-2 text-rose-500 font-semibold">Reste: {formatAriary(totalClient - totalPaidClient)}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900 flex items-center gap-1">
                                  {client.email ? (
                                    <>
                                      <FiMail className="text-indigo-400" size={14} />
                                      <span className="truncate max-w-[120px] text-xs">{client.email}</span>
                                    </>
                                  ) : '-'}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  {client.telephone ? (
                                    <>
                                      <FiPhone className="text-indigo-400" size={14} />
                                      <span>{client.telephone}</span>
                                    </>
                                  ) : '-'}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {hasProformas && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 uppercase">
                                      Proforma
                                    </span>
                                  )}
                                  {unpaidFactures.length > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase">
                                      {unpaidFactures.length} Impayée(s)
                                    </span>
                                  )}
                                  {hasInvoices && unpaidFactures.length === 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase">
                                      Payé
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {unpaidFactures.length > 0 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFactureForPayment(unpaidFactures[0]);
                                        setIsPaymentModalOpen(true);
                                      }}
                                      title="Payer la facture la plus ancienne"
                                      className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors"
                                    >
                                      <FiDollarSign size={18} />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedClient(client);
                                      setFacturePage(1);
                                    }}
                                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors duration-200 text-xs font-semibold"
                                  >
                                    Voir détails
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      itemsPerPage={ITEMS_PER_PAGE}
                      totalItems={filteredClients.length}
                      onPageChange={(page) => setCurrentPage(page)}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Modal Paiement */}
      {isPaymentModalOpen && selectedFactureForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="text-lg font-bold">Ajouter un paiement</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="hover:rotate-90 transition-transform">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Facture N°</p>
                <p className="font-bold text-gray-800">{selectedFactureForPayment.numero_facture || `#${selectedFactureForPayment.id}`}</p>
              </div>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Reste à payer</p>
                <p className="text-xl font-bold text-red-600">
                  {formatAriary(Number(selectedFactureForPayment.prix_total) - Number(selectedFactureForPayment.paiement || 0))}
                </p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant du versement (Fmg)</label>
                <input
                  type="number" step="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0 Fmg"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all shadow-sm"
                  required
                />
              </div>
              {(Number(paymentAmount || 0) + Number(remiseAmount || 0)) > (Number(selectedFactureForPayment.prix_total) - Number(selectedFactureForPayment.paiement || 0)) && (
                <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 text-xs rounded-lg animate-pulse">
                  ⚠️ Attention : Le total (Paiement + Remise) dépasse le reste à payer !
                </div>
              )}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-bold text-orange-600">Remise exceptionnelle (Fmg)</label>
                <input
                  type="number" step="1"
                  value={remiseAmount}
                  onChange={(e) => setRemiseAmount(e.target.value)}
                  placeholder="0 Fmg"
                  className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all shadow-sm bg-orange-50/30"
                />
                <p className="mt-1 text-xs text-orange-500 italic">Cette remise sera déduite du reste à payer.</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50"
                >
                  {processing ? "Enregistrement..." : "Confirmer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isConvertModalOpen}
        onClose={() => {
          setIsConvertModalOpen(false);
          setFactureToConvert(null);
        }}
        onConfirm={confirmConvert}
        title="Convertir en facture"
        message="Voulez-vous vraiment convertir ce devis en facture ? Cela impactera les stocks."
        isLoading={processing}
      />
    </div>
  );
};

export default ClientsWithFactures;