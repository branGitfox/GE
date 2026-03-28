import React from 'react';
import { FaFileInvoice, FaEuroSign, FaArrowLeft } from 'react-icons/fa';
import { FiUser, FiMail, FiPhone, FiHome } from 'react-icons/fi';

const ClientDetails = ({
  client,
  factures,
  onBack,
  isLoading
}) => {
  if (!client) return null;

  const totalDepense = factures.reduce((sum, facture) => sum + parseFloat(facture.prix_total || 0), 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        disabled={isLoading}
      >
        <FaArrowLeft className="mr-2" />
        Retour à la liste
      </button>

      <h2 className="text-2xl font-bold mb-6">Détails du Client</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div className="flex items-start">
            <FiUser className="mt-1 mr-3 text-gray-500" />
            <div>
              <h3 className="font-semibold text-gray-700">Nom complet</h3>
              <p className="text-gray-900">{client.nom}</p>
            </div>
          </div>

          <div className="flex items-start">
            <FiMail className="mt-1 mr-3 text-gray-500" />
            <div>
              <h3 className="font-semibold text-gray-700">Email</h3>
              <p className="text-gray-900">{client.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start">
            <FiPhone className="mt-1 mr-3 text-gray-500" />
            <div>
              <h3 className="font-semibold text-gray-700">Téléphone</h3>
              <p className="text-gray-900">{client.telephone}</p>
            </div>
          </div>

          <div className="flex items-start">
            <FiHome className="mt-1 mr-3 text-gray-500" />
            <div>
              <h3 className="font-semibold text-gray-700">Adresse</h3>
              <p className="text-gray-900">{client.adresse || 'Non renseignée'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-3 rounded shadow">
            <h4 className="text-sm text-gray-500">Factures</h4>
            <p className="text-xl font-bold">{factures.length}</p>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <h4 className="text-sm text-gray-500">Total dépensé</h4>
            <p className="text-xl font-bold flex items-center justify-center">
              {totalDepense.toLocaleString('fr-FR')} FMG
            </p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <FaFileInvoice className="mr-2" />
        Factures associées
      </h3>

      {factures.length === 0 ? (
        <p className="text-gray-500 py-4">Aucune facture trouvée pour ce client.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Facture</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {factures.map((facture) => (
                <tr key={facture.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{facture.numero_facture}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(facture.date_facture).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {parseFloat(facture.prix_total).toLocaleString('fr-FR')} FMG
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientDetails;