import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import FournisseurForm from '../components/fournisseurs/FournisseurForm';
import FournisseurList from '../components/fournisseurs/FournisseurList';
import { FiTruck, FiPlus, FiSearch } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';


const Fournisseurs = () => {
    const [fournisseurs, setFournisseurs] = useState([]);
    const [filteredFournisseurs, setFilteredFournisseurs] = useState([]);
    const [formData, setFormData] = useState({
        nom: '',
        adresse: '',
        telephone: '',
        email: '',
        description: ''
    });
    const [editingFournisseur, setEditingFournisseur] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Deletion Modal State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [fournisseurToDelete, setFournisseurToDelete] = useState(null);

    const formRef = useRef(null);
    const topRef = useRef(null);

    useEffect(() => {
        fetchFournisseurs();
    }, []);

    useEffect(() => {
        const results = fournisseurs.filter(f =>
            f.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (f.adresse && f.adresse.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (f.telephone && f.telephone.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (f.email && f.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredFournisseurs(results);
    }, [searchTerm, fournisseurs]);

    const fetchFournisseurs = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/fournisseurs`);
            setFournisseurs(response.data);
            setFilteredFournisseurs(response.data);
        } catch (error) {
            console.error('Erreur:', error);
            setMessage('Erreur lors de la récupération des fournisseurs');
            setSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccess(false);
        try {
            if (editingFournisseur) {
                await axios.put(`${API_URL}/api/fournisseurs/${editingFournisseur}`, formData);
                setMessage('Fournisseur modifié avec succès');
            } else {
                await axios.post(`${API_URL}/api/fournisseurs`, formData);
                setMessage('Fournisseur ajouté avec succès');
            }
            setFormData({ nom: '', adresse: '', telephone: '', email: '', description: '' });
            setEditingFournisseur(null);
            setSuccess(true);
            fetchFournisseurs();
            setSearchTerm('');
        } catch (error) {
            setMessage(error.response?.data?.message || "Erreur lors de l'opération");
            setSuccess(false);
        } finally {
            setIsLoading(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    const handleEdit = (fournisseur) => {
        setEditingFournisseur(fournisseur.id);
        setFormData({
            nom: fournisseur.nom,
            adresse: fournisseur.adresse || '',
            telephone: fournisseur.telephone || '',
            email: fournisseur.email || '',
            description: fournisseur.description || ''
        });

        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleDelete = async (id) => {
        setFournisseurToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!fournisseurToDelete) return;

        setIsLoading(true);
        try {
            const response = await axios.delete(`${API_URL}/api/fournisseurs/${fournisseurToDelete}`);
            if (response.data.success) {
                setMessage('Fournisseur supprimé avec succès');
                setSuccess(true);
                fetchFournisseurs();
            } else {
                setMessage(response.data.message || 'Erreur lors de la suppression');
                setSuccess(false);
            }
            setIsConfirmModalOpen(false);
            setFournisseurToDelete(null);
        } catch (error) {
            setMessage(error.response?.data?.message || "Erreur lors de la suppression");
            setSuccess(false);
            setIsConfirmModalOpen(false);
            setFournisseurToDelete(null);
        } finally {
            setIsLoading(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    const handleCancel = () => {
        setFormData({ nom: '', adresse: '', telephone: '', email: '', description: '' });
        setEditingFournisseur(null);
        setMessage('');
    };

    return (
    <div ref={topRef} className="max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FiTruck className="text-white/80" /> Gestion des Fournisseurs
            </h1>
            <p className="text-white/70 text-sm mt-1">Gérez vos relations fournisseurs et approvisionnements</p>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 text-center">
              <p className="text-xl font-bold text-white leading-none">{fournisseurs.length}</p>
              <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider mt-1">Fournisseurs</p>
            </div>
          </div>
        </div>
      </div>

            <FournisseurForm
                formData={formData}
                editingFournisseur={editingFournisseur}
                isLoading={isLoading}
                message={message}
                success={success}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                formRef={formRef}
            />

            <FournisseurList
                filteredFournisseurs={filteredFournisseurs}
                searchTerm={searchTerm}
                handleSearchChange={handleSearchChange}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                isLoading={isLoading}
            />

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    setIsConfirmModalOpen(false);
                    setFournisseurToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Supprimer le fournisseur"
                message="Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible."
                isLoading={isLoading}
            />
        </div>
    );
};

export default Fournisseurs;
