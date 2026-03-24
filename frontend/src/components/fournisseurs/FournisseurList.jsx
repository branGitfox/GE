import React, { useState, useRef } from 'react';
import { FaSearch, FaEdit, FaTrash, FaSort, FaTruck, FaPhone, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import Pagination from '../produits/Pagination'; // Assuming Pagination is shared or similar

const FournisseurList = ({
    filteredFournisseurs,
    searchTerm,
    handleSearchChange,
    handleEdit,
    handleDelete,
    isLoading
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [sortConfig, setSortConfig] = useState({ key: 'nom', direction: 'asc' });
    const topRef = useRef(null);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedFournisseurs = [...filteredFournisseurs].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedFournisseurs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedFournisseurs.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div ref={topRef} className="max-w-5xl mx-auto space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-700">Liste des Fournisseurs</h2>
                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher fournisseurs..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                </div>
            </div>

            {filteredFournisseurs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                    {searchTerm ?
                        "Aucun fournisseur ne correspond à votre recherche." :
                        "Aucun fournisseur trouvé. Commencez par en ajouter un."}
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('nom')}>
                                        <div className="flex items-center">Fournisseur <FaSort className="ml-1" /></div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentItems.map((f) => (
                                    <tr key={f.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <FaTruck className="text-blue-500" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{f.nom}</div>
                                                    {f.description && <div className="text-xs text-gray-500 truncate max-w-xs">{f.description}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 flex items-center gap-2"><FaPhone className="text-gray-400 text-xs" /> {f.telephone || 'N/A'}</div>
                                            <div className="text-sm text-gray-500 flex items-center gap-2"><FaEnvelope className="text-gray-400 text-xs" /> {f.email || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 flex items-start gap-2">
                                                <FaMapMarkerAlt className="text-gray-400 text-xs mt-1" />
                                                <span className="max-w-xs truncate">{f.adresse || 'Non renseignée'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEdit(f)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Modifier"
                                                    disabled={isLoading}
                                                >
                                                    <FaEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(f.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Supprimer"
                                                    disabled={isLoading}
                                                >
                                                    <FaTrash size={16} />
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
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredFournisseurs.length}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
};

export default FournisseurList;
