import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import {
  FaTrash, FaEdit, FaPlus, FaTimes, FaCheck,
  FaExclamationTriangle, FaSpinner, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';

const ITEMS_PER_PAGE = 10;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formData, setFormData] = useState({ nom: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formMessage, setFormMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/categories`);
      setCategories(response.data);
      setFilteredCategories(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
      setMessage({ text: 'Erreur lors du chargement des catégories', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open modal for add
  const handleAdd = () => {
    setFormData({ nom: '', description: '' });
    setEditingId(null);
    setShowModal(true);
    setFormMessage(null);
    setMessage({ text: '', type: '' });
  };

  // Open modal for edit
  const handleEdit = (category) => {
    setFormData({ nom: category.nom, description: category.description });
    setEditingId(category.id);
    setShowModal(true);
    setFormMessage(null);
    setMessage({ text: '', type: '' });
  };

  // Close modal
  const handleClose = () => {
    setShowModal(false);
    setFormData({ nom: '', description: '' });
    setEditingId(null);
  };

  // Submit form (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/categories/${editingId}`, formData);
        setMessage({ text: 'Catégorie modifiée avec succès', type: 'success' });
      } else {
        await axios.post(`${API_URL}/api/categories`, formData);
        setMessage({ text: 'Catégorie ajoutée avec succès', type: 'success' });
      }
      fetchCategories();
      handleClose();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setFormMessage(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  // Open delete confirmation
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${API_URL}/api/categories/${categoryToDelete.id}`);
      setMessage({ text: 'Catégorie supprimée avec succès', type: 'success' });
      fetchCategories();
    } catch (error) {
      console.error('Erreur suppression:', error);
      setMessage({ text: 'Erreur lors de la suppression', type: 'error' });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  // Pagination helpers
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-3xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 bg-gray-50 min-h-screen font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Gestion des Catégories
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Organisez vos produits par catégories</p>
        </div>

        <button
          onClick={handleAdd}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
        >
          <FaPlus size={14} /> Nouvelle Catégorie
        </button>
      </div>

      {/* Message de notification */}
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === 'error'
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-green-50 text-green-800 border border-green-200'
          }`}>
          {message.type === 'error' ? (
            <FaExclamationTriangle className="text-red-500" size={16} />
          ) : (
            <FaCheck className="text-green-500" size={16} />
          )}
          <span className="font-medium">{message.text}</span>
          <button
            onClick={() => setMessage({ text: '', type: '' })}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={14} />
          </button>
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nom</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-xs text-gray-500 font-mono">#{cat.id}</td>
                  <td className="p-3 text-sm font-medium text-gray-800">{cat.nom}</td>
                  <td className="p-3 text-xs text-gray-600 max-w-xs truncate">{cat.description || '—'}</td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Modifier"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cat)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-400 text-sm">
                    Aucune catégorie trouvée. Commencez par en ajouter une.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-1.5 rounded transition-colors ${currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-white'
                }`}
            >
              <FaChevronLeft size={14} />
            </button>
            <span className="text-xs font-medium text-gray-700">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded transition-colors ${currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-white'
                }`}
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Modal d'ajout/édition */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative animate-fade-in-down border border-gray-100">
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={18} />
            </button>
            <div className="p-5">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingId ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}
              </h2>
              {formMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 text-sm animate-fade-in-down">
                  <FaExclamationTriangle className="text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{formMessage}</span>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nom de la catégorie <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Ex: Auto, Moto"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Description optionnelle"
                    rows="2"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow"
                  >
                    {editingId ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryToDelete?.nom}" ? Cette action est irréversible.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Categories;