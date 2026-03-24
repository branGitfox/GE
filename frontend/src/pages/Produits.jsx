import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { FaSearch } from 'react-icons/fa';
import ProduitForm from '../components/produits/ProduitForm';
import ProduitTable from '../components/produits/ProduitTable';
import ConfirmModal from '../components/ConfirmModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Produits = () => {
    const [produits, setProduits] = useState([]);
    const [filteredProduits, setFilteredProduits] = useState([]);
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        stock_cartons: 0,
        stock_pieces: 0,
        prix_carton: 0,
        prix_piece: 0,
        pieces_par_carton: 1,
        prix_achat: 0,
        unité: 'Pièce',
        nom_unite_gros: 'Carton',
        category_id: '',
        fournisseur_id: '',
        importSourceId: null,
        stock_threshold: 0
    });
    const [editingProduit, setEditingProduit] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    // Deletion Modal State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [produitToDelete, setProduitToDelete] = useState(null);

    // Import Conflict Modal State
    const [isImportConflictModalOpen, setIsImportConflictModalOpen] = useState(false);
    const [pendingImportData, setPendingImportData] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    const formRef = useRef(null);
    const topRef = useRef(null);

    useEffect(() => {
        fetchProduits();
    }, []);

    useEffect(() => {
        // Solution hybride
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'auto' });
        } else {
            window.scrollTo(0, 0);
        }
    }, []);
    useEffect(() => {
        const results = produits.filter(produit =>
            produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            produit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            produit.quantite.toString().includes(searchTerm) ||
            produit.prix.toString().includes(searchTerm)
        );
        setFilteredProduits(results);
        setCurrentPage(1);
    }, [searchTerm, produits]);

    const fetchProduits = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/produits`);
            if (response.data && response.data.length > 0) {
                setProduits(response.data);
                setFilteredProduits(response.data);
            } else {
                console.error('Aucun produit trouvé');
                setProduits([]);
                setFilteredProduits([]);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des produits:', error);
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

        const quantiteTotale =
            (parseFloat(formData.stock_cartons || 0) * parseFloat(formData.pieces_par_carton || 1)) +
            parseFloat(formData.stock_pieces || 0);

        console.log('[DEBUG Frontend Stock Submit]', {
            stock_cartons: formData.stock_cartons,
            pieces_par_carton: formData.pieces_par_carton,
            stock_pieces: formData.stock_pieces,
            quantiteTotale
        });

        const dataToSend = {
            ...formData,
            quantite: quantiteTotale
        };

        // Validation du prix de vente
        if (parseFloat(formData.prix_carton || 0) <= 0) {
            toast.error(`Le prix de vente (${formData.nom_unite_gros || 'Gros'}) doit être supérieur à 0`);
            setIsLoading(false);
            return;
        }

        if (formData.pieces_par_carton > 1 && parseFloat(formData.prix_piece || 0) <= 0) {
            toast.error(`Le prix de vente au détail (${formData.unité || 'Détail'}) doit être supérieur à 0`);
            setIsLoading(false);
            return;
        }

        if ((parseFloat(formData.stock_pieces || 0) > 0 || parseFloat(formData.prix_piece || 0) > 0) && parseInt(formData.pieces_par_carton || 1) <= 1) {
            toast.error(`Veuillez spécifier un nombre valide de ${formData.unité || 'Détail'} par ${formData.nom_unite_gros || 'Gros'} (> 1)`);
            setIsLoading(false);
            return;
        }

        try {
            if (!editingProduit && !formData.nom) {
                throw new Error("Le nom du produit est requis");
            }

            const url = editingProduit
                ? `${API_URL}/api/produits/${editingProduit}`
                : `${API_URL}/api/produits`;

            const method = editingProduit ? 'put' : 'post';

            const response = await axios[method](url, dataToSend, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });


            toast.success(editingProduit
                ? 'Produit modifié avec succès'
                : 'Produit ajouté avec succès');

            // Réinitialiser le formulaire après une opération réussie
            setFormData({ nom: '', description: '', stock_cartons: 0, stock_pieces: 0, prix_carton: 0, prix_piece: 0, pieces_par_carton: 1, prix_achat: 0, unité: 'Pièce', nom_unite_gros: 'Carton', category_id: '', fournisseur_id: '', importSourceId: null, stock_threshold: 0 });

            setEditingProduit(null);
            fetchProduits();
            setSearchTerm('');
            setIsLoading(false);
        } catch (error) {
            console.error("Erreur complète:", error);
            console.error("Données de réponse d'erreur:", error.response?.data);

            if (error.response?.status === 409 && formData.importSourceId) {
                setPendingImportData(dataToSend);
                setIsImportConflictModalOpen(true);
                setIsLoading(false);
                return;
            }

            toast.error(
                error.response?.data?.message ||
                (error.response?.data ? JSON.stringify(error.response.data) : error.message) ||
                "Erreur lors de l'opération"
            );
            setIsLoading(false);
        }
    };

    const confirmImportConflict = async () => {
        setIsImporting(true);
        try {
            await axios.post(`${API_URL}/api/produits`, {
                ...pendingImportData,
                updateExisting: true
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            toast.success('Stock mis à jour avec succès via importation');
            setFormData({ nom: '', description: '', stock_cartons: 0, stock_pieces: 0, prix_carton: 0, prix_piece: 0, pieces_par_carton: 1, prix_achat: 0, unité: 'Pièce', nom_unite_gros: 'Carton', category_id: '', fournisseur_id: '', importSourceId: null, stock_threshold: 0 });
            fetchProduits();
        } catch (retryError) {
            console.error("Erreur lors de la tentative de mise à jour:", retryError);
            toast.error("Erreur lors de la tentative de mise à jour");
        } finally {
            setIsImporting(false);
            setIsImportConflictModalOpen(false);
            setPendingImportData(null);
        }
    };

    const handleEdit = (produit) => {
        setEditingProduit(produit.id);
        setFormData({
            nom: produit.nom,
            description: produit.description,
            stock_cartons: Math.floor(produit.quantite / (produit.pieces_par_carton || 1)),
            stock_pieces: produit.quantite % (produit.pieces_par_carton || 1),
            prix_carton: produit.prix_carton || 0,
            prix_piece: produit.prix_piece || 0,
            pieces_par_carton: produit.pieces_par_carton || 1,
            prix_achat: produit.prix_achat || 0,
            prix_achat_piece: produit.prix_achat_piece || 0,
            unité: produit.unité,
            nom_unite_gros: produit.nom_unite_gros || 'Carton',
            category_id: produit.category_id || '',
            fournisseur_id: produit.fournisseur_id || '',
            stock_threshold: produit.stock_threshold || 0
        });
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleDelete = async (id) => {
        setProduitToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!produitToDelete) return;

        setIsLoading(true);
        try {
            await axios.delete(`${API_URL}/api/produits/${produitToDelete}`);
            toast.success('Produit supprimé avec succès');
            fetchProduits();
        } catch (error) {
            toast.error(`Erreur lors de la suppression du produit: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
            setIsConfirmModalOpen(false);
            setProduitToDelete(null);
        }
    };

    const handleCancel = () => {
        setFormData({ nom: '', description: '', stock_cartons: 0, stock_pieces: 0, prix_carton: 0, prix_piece: 0, pieces_par_carton: 1, prix_achat: 0, unité: 'Pièce', nom_unite_gros: 'Carton', category_id: '', fournisseur_id: '', importSourceId: null, stock_threshold: 0 });
        setEditingProduit(null);
        setMessage('');
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div ref={topRef}>
            <ToastContainer position="top-right" autoClose={3000} />
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 text-center">Gestion des Produits</h1>

            <ProduitForm
                formData={formData}
                editingProduit={editingProduit}
                isLoading={isLoading}
                handleChange={handleChange}
                setFormData={setFormData}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                formRef={formRef}
            />

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <h2 className="text-xl font-semibold text-gray-700">Liste des Produits</h2>
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher produits..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>
                </div>

                {filteredProduits.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                        {searchTerm ?
                            "Aucun produit ne correspond à votre recherche." :
                            "Aucun produit trouvé. Commencez par ajouter un nouveau produit."}
                    </div>
                ) : (
                    <ProduitTable
                        filteredProduits={filteredProduits}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        isLoading={isLoading}
                        onPageChange={handlePageChange}
                        fetchProduits={fetchProduits}
                    />
                )}
            </div>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    setIsConfirmModalOpen(false);
                    setProduitToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Supprimer le produit"
                message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
                isLoading={isLoading}
            />

            <ConfirmModal
                isOpen={isImportConflictModalOpen}
                onClose={() => {
                    setIsImportConflictModalOpen(false);
                    setPendingImportData(null);
                }}
                onConfirm={confirmImportConflict}
                title="Produit Existant"
                message="Ce produit existe déjà. Voulez-vous simplement ajouter la quantité importée au stock existant ?"
                isLoading={isImporting}
            />
        </div>
    );
};

export default Produits;