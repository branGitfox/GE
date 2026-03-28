import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FiDownload, FiUpload, FiDatabase, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import { API_URL } from '../config';
import ConfirmModal from '../components/ConfirmModal';

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [resetLoading, setResetLoading] = useState(false);
    const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    const handleBackup = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await axios.get(`${API_URL}/api/backup/export`, {
                responseType: 'blob'
            });

            // Get filename from Content-Disposition header if available
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'backup.sql';

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            // Convert response to blob
            const blob = response.data;

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(url);

            setMessage({
                type: 'success',
                text: 'Backup créé et téléchargé avec succès !'
            });
        } catch (error) {
            console.error('Backup error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Erreur lors de la création du backup.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.name.endsWith('.sql')) {
                setSelectedFile(file);
                setMessage({ type: '', text: '' });
            } else {
                setMessage({
                    type: 'error',
                    text: 'Veuillez sélectionner un fichier .sql'
                });
                setSelectedFile(null);
            }
        }
    };

    const handleImport = async () => {
        if (!selectedFile) {
            setMessage({
                type: 'error',
                text: 'Veuillez sélectionner un fichier SQL'
            });
            return;
        }

        setImportLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const formData = new FormData();
            formData.append('sqlFile', selectedFile);

            const response = await axios.post(`${API_URL}/api/backup/import`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const data = response.data;

            setMessage({
                type: 'success',
                text: `${data.message} (${data.executedStatements}/${data.totalStatements} requêtes exécutées)`
            });
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Import error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Erreur lors de l\'import de la base de données'
            });
        } finally {
            setImportLoading(false);
        }
    };

    const handleReset = () => {
        setIsResetConfirmModalOpen(true);
    };

    const confirmReset = async () => {
        setResetLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await axios.post(`${API_URL}/api/backup/reset`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = response.data;

            setMessage({
                type: 'success',
                text: data.message
            });
        } catch (error) {
            console.error('Reset error:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Erreur lors de la réinitialisation des données'
            });
        } finally {
            setResetLoading(false);
            setIsResetConfirmModalOpen(false);
        }
    };

    return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 rounded-2xl p-6 mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <FiDatabase size={120} />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FiDatabase className="text-white/80" /> Paramètres Système
            </h1>
            <p className="text-white/70 text-sm mt-1">Gérez vos sauvegardes, restaurations et maintenez votre base de données</p>
          </div>
        </div>
      </div>

            {/* Message display */}
            {message.text && (
                <div className={`p-4 rounded-lg flex items-start ${message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" />
                    <span>{message.text}</span>
                </div>
            )}

            {/* Database Backup Section */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center mb-4">
                    <FiDatabase className="text-blue-600 text-2xl mr-3" />
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Sauvegarde de la Base de Données</h2>
                        <p className="text-sm text-gray-600">Exportez votre base de données en fichier SQL</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="font-medium text-gray-800 mb-2">Informations Export</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Le fichier SQL contiendra toutes les tables et données de votre base de données</li>
                            <li>• Le nom du fichier inclura la date et l'heure de création</li>
                            <li>• Le fichier sera automatiquement téléchargé dans votre dossier de téléchargements</li>
                            <li>• Conservez vos backups en lieu sûr pour pouvoir restaurer vos données si nécessaire</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleBackup}
                        disabled={loading}
                        className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                            }`}
                    >
                        <FiDownload className="mr-2" />
                        {loading ? 'Création du backup en cours...' : 'Créer et Télécharger le Backup'}
                    </button>
                </div>
            </div>

            {/* Database Import Section */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center mb-4">
                    <FiUpload className="text-green-600 text-2xl mr-3" />
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Restauration de la Base de Données</h2>
                        <p className="text-sm text-gray-600">Importez un fichier SQL pour restaurer votre base de données</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-start">
                            <FiAlertCircle className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                                <h3 className="font-medium text-yellow-800 mb-1">⚠️ Attention</h3>
                                <p className="text-sm text-yellow-700">
                                    L'importation d'un fichier SQL va <strong>remplacer toutes les données actuelles</strong> de votre base de données.
                                    Assurez-vous d'avoir fait un backup avant de continuer.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="font-medium text-gray-800 mb-2">Informations Import</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Sélectionnez uniquement un fichier .sql</li>
                            <li>• Le fichier doit contenir des commandes SQL valides</li>
                            <li>• Toutes les instructions SQL seront exécutées séquentiellement</li>
                            <li>• En cas d'erreur, le processus continuera avec les instructions suivantes</li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sélectionner un fichier SQL
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".sql"
                                onChange={handleFileSelect}
                                className="block w-full text-sm text-gray-600
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  file:cursor-pointer cursor-pointer"
                            />
                            {selectedFile && (
                                <p className="mt-2 text-sm text-gray-600">
                                    Fichier sélectionné : <span className="font-medium">{selectedFile.name}</span>
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleImport}
                            disabled={!selectedFile || importLoading}
                            className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 w-full ${!selectedFile || importLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                                }`}
                        >
                            <FiUpload className="mr-2" />
                            {importLoading ? 'Import en cours...' : 'Importer et Restaurer la Base de Données'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone Section */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-red-100 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="flex items-center mb-4">
                    <FiTrash2 className="text-red-600 text-2xl mr-3" />
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Zone de Danger</h2>
                        <p className="text-sm text-gray-600">Actions irréversibles sur la base de données</p>
                    </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
                    <h3 className="font-bold text-red-800 mb-2 flex items-center">
                        <FiAlertCircle className="mr-2" /> Réinitialisation Complète
                    </h3>
                    <p className="text-sm text-red-700">
                        Cette action supprimera <strong>TOUTES les données</strong> de l'application (produits, factures, clients, fournisseurs, dépenses, entrepôts, logs, etc.).
                        Seuls les comptes utilisateurs seront conservés. Tous les numéros (IDs) repartiront de 1.
                    </p>
                </div>

                <button
                    onClick={handleReset}
                    disabled={resetLoading}
                    className={`flex items-center justify-center px-6 py-3 rounded-lg font-bold transition-all duration-200 ${resetLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg'
                        }`}
                >
                    <FiTrash2 className="mr-2" />
                    {resetLoading ? 'Réinitialisation en cours...' : 'Réinitialiser toutes les données'}
                </button>
            </div>

            <ConfirmModal
                isOpen={isResetConfirmModalOpen}
                onClose={() => setIsResetConfirmModalOpen(false)}
                onConfirm={confirmReset}
                title="⚠️ Réinitialisation Complète"
                message="Êtes-vous ABSOLUMENT SUR ? Cette action supprimera TOUTES les données de l'application (Produits, Factures, Clients, Dépenses, Entrepot, etc.). Seuls les comptes utilisateurs seront conservés. Cette action est IRRÉVERSIBLE et tous les IDs reviendront à 1."
                isLoading={resetLoading}
            />
        </div>
    );
};

export default Settings;
