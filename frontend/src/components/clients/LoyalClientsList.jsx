import React, { useState } from 'react';
import { FaCrown, FaSearch, FaSort } from 'react-icons/fa';
import Pagination from './Pagination';

const LoyalClientsList = ({ clients, onClose }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [clientsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({
        key: 'nombre_factures',
        direction: 'desc'
    });

    const filteredClients = clients.filter(client =>
        client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    const indexOfLastClient = currentPage * clientsPerPage;
    const indexOfFirstClient = indexOfLastClient - clientsPerPage;
    const currentClients = sortedClients.slice(indexOfFirstClient, indexOfLastClient);
    const totalPages = Math.ceil(sortedClients.length / clientsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const requestSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const getLoyaltyLevel = (client) => {
        if (client.nombre_factures >= 5 || client.total_depense >= 1000000) {
            return { level: 'Or', color: 'text-yellow-500' };
        } else if (client.nombre_factures >= 3 || client.total_depense >= 200000) {
            return { level: 'Argent', color: 'text-gray-400' };
        } else {
            return { level: 'Bronze', color: 'text-amber-700' };
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaCrown className="mr-2 text-yellow-500" />
                    Clients Fidèles
                </h2>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                >
                    Retour à la liste
                </button>
            </div>

            <div className="mb-4 relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Rechercher clients fidèles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentClients.map((client) => {
                            const loyalty = getLoyaltyLevel(client);
                            return (
                                <tr key={client.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{client.nom}</div>
                                        <div className="text-sm text-gray-500">{client.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {client.nombre_factures}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {client.total_depense ? client.total_depense.toFixed(2) + ' FMG' : '0 FMG'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {client.facture_max ? client.facture_max.toFixed(2) + ' FMG' : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${loyalty.color}`}>
                                            {loyalty.level}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
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
        </div>
    );
};

export default LoyalClientsList;