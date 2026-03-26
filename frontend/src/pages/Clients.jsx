import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import ClientForm from '../components/clients/ClientForm';
import ClientList from '../components/clients/ClientList';
import ClientDetails from '../components/clients/ClientDetails';
import ConfirmModal from '../components/ConfirmModal';
import { FaArrowLeft } from 'react-icons/fa';
import { FiUsers, FiUserPlus, FiSearch } from 'react-icons/fi';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [formData, setFormData] = useState({
        nom: '',
        adresse: '',
        telephone: '',
        email: ''
    });
    const [editingClient, setEditingClient] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientFactures, setClientFactures] = useState([]);
    
    // Deletion Modal State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);

    const formRef = useRef(null);
    const topRef = useRef(null);

    useEffect(() => {
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'auto' });
        } else {
            window.scrollTo(0, 0);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        const results = clients.filter(client =>
            client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.telephone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredClients(results);
    }, [searchTerm, clients]);

    const fetchClients = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/clients`);
            if (response.data && response.data.length > 0) {
                setClients(response.data);
                setFilteredClients(response.data);
            } else {
                setClients([]);
                setFilteredClients([]);
            }
        } catch (error) {
            console.error('Erreur:', error);
            setMessage('Erreur lors de la récupération des clients');
            setSuccess(false);
        }
    };

    const handleViewDetails = async (clientId) => {
        setIsLoading(true);
        try {
            // Récupérer les détails du client
            const clientResponse = await axios.get(`${API_URL}/api/clients/${clientId}`);
            setSelectedClient(clientResponse.data.client);

            // Récupérer les factures du client
            const facturesResponse = await axios.get(`${API_URL}/api/clients/${clientId}/factures`);
            setClientFactures(facturesResponse.data.factures);

            setViewMode(true);
            topRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Erreur:', error);
            setMessage('Erreur lors de la récupération des détails');
            setSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToList = () => {
        setViewMode(false);
        setSelectedClient(null);
        setClientFactures([]);
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
            if (editingClient) {
                await axios.put(`${API_URL}/api/clients/${editingClient}`, formData);
                setMessage('Client modifié avec succès');
            } else {
                await axios.post(`${API_URL}/api/clients`, formData);
                setMessage('Client ajouté avec succès');
            }
            setFormData({ nom: '', adresse: '', telephone: '', email: '' });
            setEditingClient(null);
            setSuccess(true);
            fetchClients();
            setSearchTerm('');
        } catch (error) {
            const errorMessage = error.response?.data?.message
                || error.message
                || "Erreur lors de l'opération";
            setMessage(errorMessage);
            setSuccess(false);
        } finally {
            setIsLoading(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    const handleEdit = (client) => {
        setEditingClient(client.id);
        setFormData({
            nom: client.nom,
            adresse: client.adresse,
            telephone: client.telephone,
            email: client.email
        });

        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleDelete = async (id) => {
        setClientToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!clientToDelete) return;
        setIsLoading(true);
        try {
            await axios.delete(`${API_URL}/api/clients/${clientToDelete}`);
            setMessage('Client supprimé avec succès');
            setSuccess(true);
            fetchClients();
            setIsConfirmModalOpen(false);
            setClientToDelete(null);
        } catch (error) {
            const errorMessage = error.response?.data?.message
                || error.message
                || "Erreur lors de la suppression du client";
            setMessage(errorMessage);
            setSuccess(false);
            setIsConfirmModalOpen(false);
            setClientToDelete(null);
        } finally {
            setIsLoading(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    const handleCancel = () => {
        setFormData({ nom: '', adresse: '', telephone: '', email: '' });
        setEditingClient(null);
        setMessage('');
    };

    return (
    <div ref={topRef} className="max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {viewMode && (
              <button
                onClick={handleBackToList}
                className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/30 shadow-lg"
                disabled={isLoading}
              >
                <FaArrowLeft />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <FiUsers className="text-white/80" /> {viewMode ? (selectedClient?.nom || 'Détails du Client') : 'Gestion des Clients'}
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {viewMode ? 'Consultez les factures et informations détaillées' : 'Gérez votre base de données clients et suivez leurs activités'}
              </p>
            </div>
          </div>
          
          {!viewMode && (
            <div className="flex gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 text-center">
                <p className="text-xl font-bold text-white leading-none">{clients.length}</p>
                <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider mt-1">Clients</p>
              </div>
            </div>
          )}
        </div>
      </div>

            <ClientForm
                formData={formData}
                editingClient={editingClient}
                isLoading={isLoading}
                message={message}
                success={success}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                formRef={formRef}
            />

            {viewMode ? (
                <ClientDetails
                    client={selectedClient}
                    factures={clientFactures}
                    onBack={handleBackToList}
                    isLoading={isLoading}
                />
            ) : (
                <ClientList
                    filteredClients={filteredClients}
                    searchTerm={searchTerm}
                    handleSearchChange={handleSearchChange}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handleViewDetails={handleViewDetails}
                    isLoading={isLoading}
                />
            )}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    setIsConfirmModalOpen(false);
                    setClientToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Supprimer le client"
                message="Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible et pourrait échouer si des factures lui sont associées."
                isLoading={isLoading}
            />
        </div>
    );
};

export default Clients;