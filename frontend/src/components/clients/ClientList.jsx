import React, { useState, useRef } from 'react';
import { FaSearch, FaEdit, FaTrash, FaSort, FaEye, FaCrown, FaArrowLeft } from 'react-icons/fa';
import Pagination from './Pagination';
import axios from 'axios';
import { API_URL } from '../../config';

const ClientList = ({
  filteredClients,
  searchTerm,
  handleSearchChange,
  handleEdit,
  handleDelete,
  handleViewDetails,
  isLoading
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [clientsPerPage] = useState(4);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showLoyalClients, setShowLoyalClients] = useState(false);
  const [loyalClients, setLoyalClients] = useState([]);
  const [isLoadingLoyal, setIsLoadingLoyal] = useState(false);
  const topRef = useRef(null);

  // Fonction pour charger les clients fidèles
  const fetchLoyalClients = async () => {
    setIsLoadingLoyal(true);
    try {
      const response = await axios.get(`${API_URL}/api/clients/loyal/clients`);
      setLoyalClients(response.data);
      setShowLoyalClients(true);
    } catch (error) {
      console.error('Erreur lors de la récupération des clients fidèles:', error);
    } finally {
      setIsLoadingLoyal(false);
    }
  };

  // Fonction pour déterminer le niveau de fidélité
  const getLoyaltyLevel = (client) => {
    if (!client.nombre_factures) return { level: 'Nouveau', color: 'text-gray-500' };

    if (client.nombre_factures >= 5 || client.total_depense >= 1000000) {
      return { level: 'Or', color: 'text-yellow-500' };
    } else if (client.nombre_factures >= 3 || client.total_depense >= 200000) {
      return { level: 'Argent', color: 'text-gray-400' };
    } else if (client.nombre_factures >= 7 || client.total_depense >= 2000000) {
      return { level: 'Diamont', color: 'text-green-500' };
    } else {
      return { level: 'Bronze', color: 'text-amber-700' };
    }
  };

  // Fonction pour formater les montants
  const formatAmount = (amount) => {
    // Convertir en nombre si ce n'est pas déjà le cas
    const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    if (num === 0) return '0 FMG';
    return num.toLocaleString('fr-FR') + ' FMG';
  };

  // Tri des clients
  const sortedClients = [...filteredClients].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  // Pagination
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = sortedClients.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages = Math.ceil(sortedClients.length / clientsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Affichage des clients fidèles
  if (showLoyalClients) {
    return (
      <div ref={topRef} className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowLoyalClients(false)}
            className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
          >
            <FaArrowLeft className="mr-2" />
            Retour
          </button>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaCrown className="mr-2 text-yellow-500" />
            Clients Fidèles
          </h2>
          <div className="w-32"></div> {/* Pour l'alignement */}
        </div>

        <div className="mb-4 relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher clients fidèles..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('nombre_factures')}
                >
                  <div className="flex items-center">
                    Factures
                    <FaSort className="ml-1 text-gray-400" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('total_depense')}
                >
                  <div className="flex items-center">
                    Total Dépensé
                    <FaSort className="ml-1 text-gray-400" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('facture_max')}
                >
                  <div className="flex items-center">
                    Facture Max
                    <FaSort className="ml-1 text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau Fidélité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loyalClients.map((client) => {
                const loyalty = getLoyaltyLevel(client);
                return (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{client.nom}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.nombre_factures || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatAmount(client.total_depense)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.facture_max ? formatAmount(client.facture_max) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${loyalty.color}`}>
                        {loyalty.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewDetails(client.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Voir détails"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Modifier"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(loyalClients.length / clientsPerPage)}
          itemsPerPage={clientsPerPage}
          totalItems={loyalClients.length}
          onPageChange={handlePageChange}
        />
      </div>
    );
  }

  // Affichage normal de la liste des clients
  return (
    <div ref={topRef} className="max-w-7xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">Liste des Clients</h2>
        <div className="flex space-x-4">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher clients..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <button
            onClick={fetchLoyalClients}
            disabled={isLoadingLoyal}
            className="flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition disabled:opacity-50"
          >
            <FaCrown className="mr-2" />
            {isLoadingLoyal ? 'Chargement...' : 'Clients Fidèles'}
          </button>
        </div>
      </div>

      {filteredClients.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={clientsPerPage}
          totalItems={filteredClients.length}
          onPageChange={handlePageChange}
        />
      )}

      {filteredClients.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
          {searchTerm ?
            "Aucun client ne correspond à votre recherche." :
            "Aucun client trouvé. Commencez par ajouter un nouveau client."}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('nom')}
                  >
                    <div className="flex items-center">
                      Nom
                      <FaSort className="ml-1 text-gray-400" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('email')}
                  >
                    <div className="flex items-center">
                      Email
                      <FaSort className="ml-1 text-gray-400" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('telephone')}
                  >
                    <div className="flex items-center">
                      Téléphone
                      <FaSort className="ml-1 text-gray-400" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('adresse')}
                  >
                    <div className="flex items-center">
                      Adresse
                      <FaSort className="ml-1 text-gray-400" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{client.nom}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{client.telephone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{client.adresse}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewDetails(client.id)}
                          className="text-green-600 hover:text-green-800"
                          disabled={isLoading}
                          title="Voir détails"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={isLoading}
                          title="Modifier"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={isLoading}
                          title="Supprimer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={clientsPerPage}
            totalItems={filteredClients.length}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default ClientList;