import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { FaSearch, FaUserPlus, FaTimes } from 'react-icons/fa';
import UsersSection from '../components/users/UsersSection';
import { FaUserCheck, FaUsers } from 'react-icons/fa';
import Notification from '../components/users/Notification';
import ConfirmModal from '../components/ConfirmModal';
import { ClipLoader } from 'react-spinners';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        nom: '',
        prenom: '',
        email: '',
        role: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        nom: '',
        prenom: '',
        email: '',
        mdp: '',
        confirmMdp: '',
        role: 'user'
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Deletion Modal State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const results = users.filter(user =>
            user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/users/list`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setUsers(response.data);
            setFilteredUsers(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            showMessage('Erreur lors du chargement des utilisateurs', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 2000);
    };

    const handleValidate = async (id) => {
        try {
            await axios.put(`${API_URL}/api/users/validate/${id}`);
            showMessage('Utilisateur validé avec succès', 'success');
            setUsers(users.map(user => user.id === id ? { ...user, validated: true } : user));
        } catch (error) {
            console.error('Erreur lors de la validation:', error);
            showMessage('Erreur lors de la validation', 'error');
        }
    };

    const handleInvalidate = async (id) => {
        try {
            await axios.put(`${API_URL}/api/users/invalidate/${id}`);
            showMessage('Utilisateur bloqué avec succès', 'success');
            setUsers(users.map(user => user.id === id ? { ...user, validated: false } : user));
        } catch (error) {
            console.error('Erreur lors de la validation:', error);
            showMessage('Erreur lors du blocage', 'error');
        }
    };

    const handleDelete = async (id) => {
        setUserToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            await axios.delete(`${API_URL}/api/users/${userToDelete}`);
            showMessage('Utilisateur supprimé avec succès', 'success');
            setUsers(users.filter(user => user.id !== userToDelete));
            setIsConfirmModalOpen(false);
            setUserToDelete(null);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            showMessage('Erreur lors de la suppression', 'error');
            setIsConfirmModalOpen(false);
            setUserToDelete(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user.id);
        setEditForm({
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = async (id) => {
        try {
            await axios.put(`${API_URL}/api/users/update/${id}`, editForm);
            showMessage('Utilisateur modifié avec succès', 'success');
            setUsers(users.map(user => user.id === id ? { ...user, ...editForm } : user));
            setEditingUser(null);
        } catch (error) {
            console.error('Erreur lors de la modification:', error);
            showMessage('Erreur lors de la modification', 'error');
        }
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
    };

    const handleCreateFormChange = (e) => {
        const { name, value } = e.target;
        setCreateForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleOpenCreateModal = () => {
        setShowCreateModal(true);
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setCreateForm({
            nom: '',
            prenom: '',
            email: '',
            mdp: '',
            confirmMdp: '',
            role: 'user'
        });
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();

        if (createForm.mdp !== createForm.confirmMdp) {
            showMessage('Les mots de passe ne correspondent pas', 'error');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('nom', createForm.nom);
            formData.append('prenom', createForm.prenom);
            formData.append('email', createForm.email);
            formData.append('mdp', createForm.mdp);
            formData.append('confirmMdp', createForm.confirmMdp);
            formData.append('role', createForm.role);
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            await axios.post(`${API_URL}/api/users/register`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            showMessage('Utilisateur créé avec succès', 'success');
            handleCloseCreateModal();
            fetchUsers();
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            showMessage(error.response?.data?.message || 'Erreur lors de la création', 'error');
        }
    };

    const pendingUsers = filteredUsers.filter(user => !user.validated);
    const validatedUsers = filteredUsers.filter(user => user.validated);

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            {message.text && <Notification message={message} onClose={() => setMessage({ text: '', type: '' })} />}

            <div className="max-w-7xl mx-auto">
                {/* Hero Header */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 mb-6 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                <FaUsers className="text-white/80" /> Gestion des Utilisateurs
                            </h1>
                            <p className="text-white/70 text-sm mt-1">Gérez les accès, les rôles et la sécurité de l'application</p>
                        </div>
                        <button
                            onClick={handleOpenCreateModal}
                            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-bold border border-white/30"
                        >
                            <FaUserPlus /> Créer Utilisateur
                        </button>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 text-center">
                            <p className="text-xl font-bold text-white leading-none">{users.length}</p>
                            <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider mt-1">Utilisateurs</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 text-center">
                            <p className="text-xl font-bold text-white leading-none">{pendingUsers.length}</p>
                            <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider mt-1">En attente</p>
                        </div>
                    </div>
                </div>

                {/* Modal de création */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-800">Créer un Nouvel Utilisateur</h2>
                                <button
                                    onClick={handleCloseCreateModal}
                                    className="text-gray-400 hover:text-gray-600 transition"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateUser} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="nom"
                                            value={createForm.nom}
                                            onChange={handleCreateFormChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Prénom <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="prenom"
                                            value={createForm.prenom}
                                            onChange={handleCreateFormChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={createForm.email}
                                        onChange={handleCreateFormChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mot de passe <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="mdp"
                                            value={createForm.mdp}
                                            onChange={handleCreateFormChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirmer le mot de passe <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmMdp"
                                            value={createForm.confirmMdp}
                                            onChange={handleCreateFormChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rôle <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="role"
                                        value={createForm.role}
                                        onChange={handleCreateFormChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="SuperAdmin">SuperAdmin</option>
                                    </select>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Photo de profil (facultatif)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {imagePreview && (
                                        <div className="mt-2">
                                            <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseCreateModal}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition font-medium"
                                    >
                                        Créer l'utilisateur
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Barre de recherche */}
                <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher utilisateurs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>
                </div>

                {/* Sections d'utilisateurs */}
                <UsersSection
                    title="Utilisateurs en attente de validation"
                    icon={FaUserCheck}
                    users={pendingUsers}
                    isLoading={isLoading}
                    editingUser={editingUser}
                    editForm={editForm}
                    handleInputChange={handleInputChange}
                    handleSaveEdit={handleSaveEdit}
                    handleCancelEdit={handleCancelEdit}
                    handleValidate={handleValidate}
                    handleInvalidate={handleInvalidate}
                    handleDelete={handleDelete}
                    handleEdit={handleEdit}
                    isPendingSection={true}
                />

                <UsersSection
                    title="Tous les utilisateurs"
                    icon={FaUsers}
                    users={validatedUsers}
                    isLoading={isLoading}
                    editingUser={editingUser}
                    editForm={editForm}
                    handleInputChange={handleInputChange}
                    handleSaveEdit={handleSaveEdit}
                    handleCancelEdit={handleCancelEdit}
                    handleValidate={handleValidate}
                    handleInvalidate={handleInvalidate}
                    handleDelete={handleDelete}
                    handleEdit={handleEdit}
                />
            </div>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    setIsConfirmModalOpen(false);
                    setUserToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Supprimer l'utilisateur"
                message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
                isLoading={isDeleting}
            />
        </div>
    );
};

export default Users;