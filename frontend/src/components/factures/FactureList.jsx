import React, { useRef, useCallback } from "react";
import { FaSearch, FaTrash, FaEdit, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import PDFButton from '../PDFButton';
import Pagination from './Pagination';

// Fonction utilitaire pour formater les montants
const formatCurrency = (value) => {
  const num = Number(value || 0);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const FactureList = ({
  loading,
  filteredFactures,
  paginatedFactures,
  clients,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  onDeleteFacture,
  onEditFacture,
  statusFilter,
  setStatusFilter,
  isProforma = false,
  onConvertToFacture
}) => {
  const listRef = useRef(null);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 50);
  }, [setCurrentPage]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        ref={listRef}
        className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center"
      >
        <h2 className="text-lg font-semibold text-gray-700 mb-2 md:mb-0">
          {isProforma ? "Historique des Devis" : "Historique des Factures"}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {!isProforma && (
            <div className="relative w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                <option value="paid">Payés ✅</option>
                <option value="partial">Partiels ⏳</option>
                <option value="unpaid">Non Payés ❌</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Rechercher ${isProforma ? 'devis' : 'factures'}...`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
            />
          </div>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredFactures.length}
        onPageChange={handlePageChange}
      />

      {loading.factures ? (
        <div className="p-8 flex justify-center">
          <ClipLoader size={40} color="#3B82F6" />
        </div>
      ) : filteredFactures.length > 0 ? (
        <>
          <div className="divide-y divide-gray-200">
            {paginatedFactures.map(facture => {
              const clientName = facture.client_nom || "Client inconnu";
              const clientEmail = facture.client_email || "";
              const clientPhone = facture.client_telephone || "";
              const clientAddress = facture.client_adresse || "";
              const total = Number(facture.prix_total || 0);
              const paid = Number(facture.paiement || 0);
              const reste = total - paid;

              let statusLabel = "Non Payé";
              let statusColor = "bg-red-200 text-red-800";
              let bgColor = "bg-red-50 hover:bg-red-100";

              if (paid >= total) {
                statusLabel = "Payé";
                statusColor = "bg-green-200 text-green-800";
                bgColor = "bg-green-50 hover:bg-green-100";
              } else if (paid > 0) {
                statusLabel = "Partiel";
                statusColor = "bg-orange-200 text-orange-800";
                bgColor = "bg-orange-50 hover:bg-orange-100";
              }

              return (
                <div
                  key={facture.id}
                  className={`p-6 transition-colors ${bgColor}`}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 pb-4 border-b border-gray-200">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-800">
                              {isProforma ? 'Devis :' : 'Facture :'} {facture.numero_facture}
                            </h3>
                            {!isProforma && (
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                                {statusLabel}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Date: {new Date(facture.date_facture).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-sm text-gray-500">Effectué par : <samp>{facture.created_by}</samp></p>
                          <p className="text-sm text-gray-500">commentaire : <samp>{facture.commentaire || '..........................................'}</samp></p>
                        </div>
                        {!isProforma && paid > 0 && (
                          <div className="mt-2 sm:mt-0 text-right">
                            <p className={`text-xs font-bold uppercase ${paid >= total ? 'text-green-600' : 'text-orange-600'}`}>
                              {paid >= total ? 'Totalement Payé' : 'Paiement Partiel'}
                            </p>
                            <p className="text-sm font-black text-gray-700">Payé: {formatCurrency(paid)} FMG</p>
                            {reste > 0 && <p className="text-sm font-black text-red-600">Reste: {formatCurrency(reste)} FMG</p>}
                            {facture.date_paiement && (
                              <p className="text-xs text-blue-600 font-bold mt-1 italic">
                                Dernier paiement: {new Date(facture.date_paiement).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Client</h4>
                        <p className="text-gray-800 font-medium">{clientName}</p>

                        {clientEmail && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                            <FaEnvelope /> {clientEmail}
                          </p>
                        )}

                        {clientPhone && (
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <FaPhone /> {clientPhone}
                          </p>
                        )}

                        {clientAddress && (
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <FaMapMarkerAlt /> {clientAddress}
                          </p>
                        )}
                      </div>

                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unité</th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prix unitaire</th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {facture.liste_articles?.map((article, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{article.nom}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">x{article.quantite}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{article.unité}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                  {formatCurrency(article.prix)} FMG
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                  {formatCurrency(article.prix * article.quantite)} FMG
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="md:w-64 flex-shrink-0">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="space-y-2">
                          {(Number(facture.remise) > 0) && (
                            <>
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>Sous-total:</span>
                                <span>{formatCurrency(total + Number(facture.remise))} FMG</span>
                              </div>
                              <div className="flex justify-between text-sm text-red-500">
                                <span>Remise:</span>
                                <span>-{formatCurrency(facture.remise)} FMG</span>
                              </div>
                            </>
                          )}
                          <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg text-gray-800">
                            <span>Total:</span>
                            <span>{formatCurrency(total)} FMG</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col items-center">
                          <div className="flex space-x-2">
                            {isProforma && (
                              <button
                                onClick={() => onConvertToFacture && onConvertToFacture(facture)}
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm whitespace-nowrap"
                                title="Convertir en Facture"
                              >
                                Convertir
                              </button>
                            )}
                            <PDFButton facture={facture} clients={clients} />
                            <button
                              onClick={() => onEditFacture(facture)}
                              className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                              title={isProforma ? "Modifier le devis" : "Modifier la facture"}
                              disabled={loading.factures}
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => onDeleteFacture(facture.id)}
                              className="p-2 text-red-500 hover:text-red-700 transition-colors"
                              title="Supprimer la facture"
                              disabled={loading.factures}
                            >
                              {loading.factures ? (
                                <ClipLoader size={16} color="#EF4444" />
                              ) : (
                                <FaTrash />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 text-center mt-2">
                            {facture.liste_articles?.length || 0} article(s)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredFactures.length}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="p-6 text-center text-gray-500">
          {searchTerm ? `Aucun ${isProforma ? 'devis' : 'facture'} ne correspond à votre recherche.` : `Aucun ${isProforma ? 'devis' : 'facture'} trouvé.`}
        </div>
      )}
    </div>
  );
};

export default FactureList;