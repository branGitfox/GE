import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import ClientForm from '../components/clients/ClientForm';
import ClientList from '../components/clients/ClientList';
import ClientDetails from '../components/clients/ClientDetails';
import ConfirmModal from '../components/ConfirmModal';
import { FaArrowLeft } from 'react-icons/fa';
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
        <div ref={topRef} className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 text-center">
                {viewMode ? (
                    <div className="flex items-center justify-center">
                        <button
                            onClick={handleBackToList}
                            className="mr-4 text-blue-600 hover:text-blue-800"
                            disabled={isLoading}
                        >
                            <FaArrowLeft />
                        </button>
                        Détails du Client
                    </div>
                ) : (
                    'Gestion des Clients'
                )}
            </h1>

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