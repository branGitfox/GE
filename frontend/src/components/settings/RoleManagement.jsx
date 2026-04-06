import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { FiShield, FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiCheck } from 'react-icons/fi';
import ConfirmModal from '../ConfirmModal';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [pages, setPages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Form and Modal States
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formParams, setFormParams] = useState({ nom: '', description: '', pages: [] });
    
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchRolesAndPages();
    }, []);

    const fetchRolesAndPages = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [rolesRes, pagesRes] = await Promise.all([
                axios.get(`${API_URL}/api/roles`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/roles/pages`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setRoles(rolesRes.data);
            setPages(pagesRes.data);
        } catch (error) {
            console.error('Erreur lors du chargement des rôles/pages:', error);
            showMessage('Erreur lors du chargement des données', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleOpenCreateModal = () => {
        setEditingRole(null);
        setFormParams({ nom: '', description: '', pages: [] });
        setIsRoleModalOpen(true);
    };

    const handleOpenEditModal = (role) => {
        setEditingRole(role.id);
        setFormParams({
            nom: role.nom,
            description: role.description || '',
            pages: role.pages ? role.pages.map(p => p.id) : []
        });
        setIsRoleModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsRoleModalOpen(false);
        setEditingRole(null);
        setFormParams({ nom: '', description: '', pages: [] });
    };

    const handlePageToggle = (pageId) => {
        setFormParams(prev => {
            if (prev.pages.includes(pageId)) {
                return { ...prev, pages: prev.pages.filter(id => id !== pageId) };
            } else {
                return { ...prev, pages: [...prev.pages, pageId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingRole) {
                await axios.put(`${API_URL}/api/roles/${editingRole}`, formParams, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showMessage('Rôle mis à jour', 'success');
            } else {
                await axios.post(`${API_URL}/api/roles`, formParams, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showMessage('Rôle créé', 'success');
            }
            fetchRolesAndPages();
            handleCloseModal();
        } catch (error) {
            console.error('Erreur save role:', error);
            showMessage(error.response?.data?.message || 'Erreur lors de la sauvegarde', 'error');
        }
    };

    const handleDelete = (id) => {
        setRoleToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/roles/${roleToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showMessage('Rôle supprimé', 'success');
            fetchRolesAndPages();
        } catch (error) {
            console.error('Erreur suppression role:', error);
            showMessage(error.response?.data?.message || 'Erreur de suppression', 'error');
        } finally {
            setIsConfirmModalOpen(false);
            setRoleToDelete(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            {message.text && (
                <div className={`mb-4 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.type === 'success' ? <FiCheck className="mr-2" /> : <FiX className="mr-2" />}
                    {message.text}
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FiShield className="text-blue-600" /> Gestion des Rôles & Permissions
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Gérez les rôles et attribuez l'accès aux pages de l'application</p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                    <FiPlus /> Ajouter un Rôle
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-8 text-gray-500">Chargement...</div>
            ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 text-sm">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Nom du Rôle</th>
                                <th className="px-5 py-3 font-semibold">Description</th>
                                <th className="px-5 py-3 font-semibold">Pages Accessibles</th>
                                <th className="px-5 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {roles.map(role => (
                                <tr key={role.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            {role.nom === 'SuperAdmin' && <FiShield className="text-indigo-500" />}
                                            {role.nom}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-gray-500">{role.description}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {role.pages && role.pages.length > 0 ? (
                                                role.nom === 'SuperAdmin' ? (
                                                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-lg font-medium border border-indigo-100">Toutes les pages</span>
                                                ) : (
                                                    role.pages.map(p => (
                                                        <span key={p.id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">
                                                            {p.nom}
                                                        </span>
                                                    ))
                                                )
                                            ) : (
                                                <span className="text-gray-400 italic">Aucune page</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenEditModal(role)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(role.id)}
                                                disabled={role.nom === 'SuperAdmin' || role.nom === 'Admin'}
                                                className={`p-1.5 rounded transition-colors ${role.nom === 'SuperAdmin' || role.nom === 'Admin' ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isRoleModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingRole ? 'Modifier le Rôle' : 'Créer un Rôle'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="roleForm" onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Rôle <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={formParams.nom} 
                                        onChange={e => setFormParams({...formParams, nom: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Ex: Vendeur, Gestionnaire Stock..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <input 
                                        type="text" 
                                        value={formParams.description} 
                                        onChange={e => setFormParams({...formParams, description: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Description du rôle..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Permissions (Pages accessibles)</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 border border-gray-200 p-4 rounded-xl">
                                        {pages.map(page => (
                                            <label key={page.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formParams.pages.includes(page.id)}
                                                    onChange={() => handlePageToggle(page.id)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700">{page.nom}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><FiShield className="text-blue-500"/> Le rôle "SuperAdmin" a automatiquement accès à tout, les cases cochées ici sont purement indicatives pour lui.</p>
                                </div>
                            </form>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                            <button 
                                onClick={handleCloseModal}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit" 
                                form="roleForm"
                                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg flex items-center gap-2 transition-all shadow-sm"
                            >
                                <FiSave /> Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title="Supprimer ce rôle"
                message="Êtes-vous sûr de vouloir supprimer ce rôle ? S'il est associé à des utilisateurs, la suppression empêchera leur connexion aux pages."
                isLoading={false}
            />
        </div>
    );
};

export default RoleManagement;
