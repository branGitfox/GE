import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from 'axios';
import { API_URL } from '../config';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import FactureForm from '../components/factures/FactureForm';
import FactureList from '../components/factures/FactureList';
import ConfirmModal from '../components/ConfirmModal';
import { calculerMontantTotal } from '../utils/factureUtils';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Proformas = () => {
  const topRef = useRef(null);

  // États
  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState({
    factures: false,
    clients: false,
    produits: false,
    submit: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingFactureId, setEditingFactureId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'paid', 'unpaid'

  // Modal states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [factureToDelete, setFactureToDelete] = useState(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [factureToConvert, setFactureToConvert] = useState(null);

  const [nouvelleFacture, setNouvelleFacture] = useState({
    client_id: "",
    numero_facture: "",
    date_facture: new Date().toLocaleDateString('en-CA'),
    liste_articles: [],
    prix_total: 0,
    Objet: "",
    commentaire: "",
    paiement: 0,
    isTempClient: false,
    temp_client_nom: "",
    temp_client_adresse: "",
    temp_client_telephone: "",
    temp_client_email: "",
    status: "proforma",
    remise: ""
  });

  const [nouvelArticle, setNouvelArticle] = useState({
    produit_id: "",
    nom: "",
    quantite: 1,
    prix: 0,
    type_vente: "piece",
    unité: "",
  });



  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, factures: true, clients: true, produits: true }));

      const [facturesRes, clientsRes, produitsRes] = await Promise.all([
        axios.get(`${API_URL}/api/factures`),
        axios.get(`${API_URL}/api/clients`),
        axios.get(`${API_URL}/api/produits`)
      ]);

      const facturesData = Array.isArray(facturesRes.data) ? facturesRes.data : (facturesRes.data.factures || []);
      const clientsData = clientsRes.data;
      const produitsData = produitsRes.data;

      const sortedFactures = facturesData.sort((a, b) =>
        new Date(b.date_facture) - new Date(a.date_facture)
      ).map(facture => ({
        ...facture,
        liste_articles: Array.isArray(facture.liste_articles)
          ? facture.liste_articles
          : JSON.parse(facture.liste_articles || "[]"),
        Objet: facture.Objet || "", // Assure que Objet existe
        commentaire: facture.commentaire || "" // Assure que commentaire existe
      }));

      setFactures(sortedFactures);
      setClients(clientsData);
      setProduits(produitsData);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(prev => ({ ...prev, factures: false, clients: false, produits: false }));
    }
  }, []);
  // Dans le composant Proformas
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load draft from localStorage on mount or when exiting edit mode
  useEffect(() => {
    if (!isEditMode) {
      const savedArticles = localStorage.getItem('proforma_draft_articles');
      if (savedArticles) {
        try {
          const parsed = JSON.parse(savedArticles);
          if (Array.isArray(parsed) && parsed.length > 0 && nouvelleFacture.liste_articles.length === 0) {
            setNouvelleFacture(prev => ({
              ...prev,
              liste_articles: parsed,
              prix_total: calculerMontantTotal(parsed)
            }));
          }
        } catch (error) {
          console.error("Error loading proforma draft from localStorage:", error);
        }
      }
    }
  }, [isEditMode]);

  // Save items to localStorage whenever they change
  useEffect(() => {
    if (!isEditMode) {
      if (nouvelleFacture.liste_articles.length > 0) {
        localStorage.setItem('proforma_draft_articles', JSON.stringify(nouvelleFacture.liste_articles));
      } else {
        localStorage.removeItem('proforma_draft_articles');
      }
    }
  }, [nouvelleFacture.liste_articles, isEditMode]);

  const filteredFactures = useMemo(() => {
    return factures.filter(facture => {
      const clientName = (facture.client_nom || '').toLowerCase();
      const searchTermLower = searchTerm.toLowerCase();

      // Filtrage par texte
      const matchesSearch = (
        clientName.includes(searchTermLower) ||
        facture.numero_facture?.toLowerCase().includes(searchTermLower) ||
        facture.date_facture.includes(searchTerm) ||
        facture.prix_total.toString().includes(searchTerm) ||
        (facture.Objet && facture.Objet.toLowerCase().includes(searchTermLower)) ||
        (facture.commentaire && facture.commentaire.toLowerCase().includes(searchTermLower))
      );

      // Filtrage par statut de paiement
      let matchesStatus = true;
      const isProformaItem = facture.status === 'proforma';
      if (!isProformaItem) return false;

      return matchesSearch;
    });
  }, [factures, searchTerm]);

  const totalPages = Math.ceil(filteredFactures.length / itemsPerPage);
  const paginatedFactures = filteredFactures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setNouvelleFacture(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleChangeArticle = useCallback((e) => {
    const { name, value } = e.target;
    setNouvelArticle(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectProduit = useCallback((e) => {
    const produitId = e.target.value;
    const selectedProduit = produits.find(p => p.id == produitId);

    if (selectedProduit) {
      setNouvelArticle(prev => ({
        ...prev,
        produit_id: selectedProduit.id,
        nom: selectedProduit.nom,
        prix: selectedProduit.prix
      }));
    }
  }, [produits]);

  const handleAjouterArticle = useCallback(() => {
    if (!nouvelArticle.produit_id || nouvelArticle.quantite <= 0 || nouvelArticle.prix < 0) {
      toast.error("Veuillez sélectionner un produit et une quantité valide.");
      return;
    }

    const produitSelectionne = produits.find(p => p.id == nouvelArticle.produit_id);

    if (!produitSelectionne) {
      toast.error("Produit introuvable dans la base de données.");
      return;
    }

    const isCarton = nouvelArticle.type_vente === 'carton';
    const multiplier = isCarton ? (produitSelectionne.pieces_par_carton || 1) : 1;
    const qteToAddPieces = parseFloat(nouvelArticle.quantite) * multiplier;

    if (produitSelectionne.quantite < qteToAddPieces) {
      const stockAvailableStr = isCarton ?
        `${Math.floor(produitSelectionne.quantite / (produitSelectionne.pieces_par_carton || 1))} ${produitSelectionne.nom_unite_gros || 'carton'}(s) et ${produitSelectionne.quantite % (produitSelectionne.pieces_par_carton || 1)} ${produitSelectionne.unité || 'pièce'}(s)` :
        `${produitSelectionne.quantite} ${produitSelectionne.unité || 'pièce'}(s)`;
      toast.error(`Stock insuffisant! Il ne reste que ${stockAvailableStr} disponibles.`);
      return;
    }

    const articleExistantIndex = nouvelleFacture.liste_articles.findIndex(
      article => article.produit_id === nouvelArticle.produit_id && article.type_vente === nouvelArticle.type_vente
    );

    setNouvelleFacture(prev => {
      let updatedArticles;
      const qteToAdd = parseFloat(nouvelArticle.quantite);

      if (articleExistantIndex !== -1) {
        const nouvelleQuantite = parseFloat(prev.liste_articles[articleExistantIndex].quantite) + qteToAdd;
        const nouvelleQuantitePieces = nouvelleQuantite * multiplier;

        if (produitSelectionne.quantite < nouvelleQuantitePieces) {
          const stockAvailableStr = isCarton ?
            `${Math.floor(produitSelectionne.quantite / (produitSelectionne.pieces_par_carton || 1))} ${produitSelectionne.nom_unite_gros || 'carton'}(s) et ${produitSelectionne.quantite % (produitSelectionne.pieces_par_carton || 1)} ${produitSelectionne.unité || 'pièce'}(s)` :
            `${produitSelectionne.quantite} ${produitSelectionne.unité || 'pièce'}(s)`;
          toast.error(`Quantité totale dépasse le stock disponible (${stockAvailableStr})!`);
          return prev;
        }

        updatedArticles = [...prev.liste_articles];
        updatedArticles[articleExistantIndex] = {
          ...updatedArticles[articleExistantIndex],
          quantite: nouvelleQuantite
        };
      } else {
        updatedArticles = [...prev.liste_articles, { ...nouvelArticle, quantite: qteToAdd }];
      }

      const prixTotal = calculerMontantTotal(updatedArticles);

      return {
        ...prev,
        liste_articles: updatedArticles,
        prix_total: prixTotal,
      };
    });

    setNouvelArticle({
      produit_id: "",
      nom: "",
      quantite: 1,
      prix: 0,
      type_vente: "piece",
      unité: ""
    });
  }, [nouvelArticle, produits, nouvelleFacture.liste_articles]);

  const handleSupprimerArticle = useCallback((index) => {
    setNouvelleFacture(prev => {
      const updatedArticles = [...prev.liste_articles];
      updatedArticles.splice(index, 1);

      const prixTotal = calculerMontantTotal(updatedArticles);

      return {
        ...prev,
        liste_articles: updatedArticles,
        prix_total: prixTotal,
      };
    });
  }, []);

  const handleDeleteFacture = useCallback(async (factureId) => {
    setFactureToDelete(factureId);
    setIsConfirmModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!factureToDelete) return;

    try {
      setLoading(prev => ({ ...prev, factures: true }));

      await axios.delete(`${API_URL}/api/factures/${factureToDelete}`);

      await fetchData();
      toast.success("Facture supprimée avec succès !");
      setIsConfirmModalOpen(false);
      setFactureToDelete(null);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error.message || "Erreur lors de la suppression");
      setIsConfirmModalOpen(false);
      setFactureToDelete(null);
    } finally {
      setLoading(prev => ({ ...prev, factures: false }));
    }
  }, [factureToDelete, fetchData]);

  const handleAnnuler = useCallback(() => {
    setNouvelleFacture({
      client_id: "",
      numero_facture: "",
      date_facture: new Date().toLocaleDateString('en-CA'),
      liste_articles: [],
      prix_total: 0,
      Objet: "",
      commentaire: "",
      paiement: 0,
      isTempClient: false,
      temp_client_nom: "",
      temp_client_adresse: "",
      temp_client_telephone: "",
      temp_client_email: "",
      remise: ""
    });
    setIsEditMode(false);
    setEditingFactureId(null);
    localStorage.removeItem('proforma_draft_articles');
  }, []);

  const handleEditFacture = useCallback((facture) => {
    setIsEditMode(true);
    setEditingFactureId(facture.id);
    setNouvelleFacture({
      client_id: facture.client_id,
      numero_facture: facture.numero_facture,
      date_facture: facture.date_facture,
      liste_articles: facture.liste_articles,
      prix_total: facture.prix_total,
      Objet: facture.Objet || "",
      commentaire: facture.commentaire || "",
      paiement: facture.paiement !== undefined ? facture.paiement : 0,
      isTempClient: !facture.client_id,
      temp_client_nom: facture.temp_client_nom || "",
      temp_client_adresse: facture.temp_client_adresse || "",
      temp_client_telephone: facture.temp_client_telephone || "",
      temp_client_email: facture.temp_client_email || "",
      status: "proforma",
      remise: facture.remise || 0
    });

    // Scroll to form
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleConvertToFacture = useCallback(async (facture) => {
    setFactureToConvert(facture);
    setIsConvertModalOpen(true);
  }, []);

  const confirmConvert = useCallback(async () => {
    if (!factureToConvert) return;

    try {
      setLoading(prev => ({ ...prev, submit: true }));
      const response = await axios.put(`${API_URL}/api/factures/${factureToConvert.id}/convert`, {
        ...factureToConvert,
        paiement: 0
      });

      await fetchData();
      toast.success("Le devis a été converti en facture avec succès !");
      setIsConvertModalOpen(false);
      setFactureToConvert(null);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error.message || "Erreur serveur");
      setIsConvertModalOpen(false);
      setFactureToConvert(null);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  }, [factureToConvert, fetchData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!nouvelleFacture.isTempClient && !nouvelleFacture.client_id) {
      toast.error("Veuillez sélectionner un client.");
      return;
    }

    if (nouvelleFacture.isTempClient && !nouvelleFacture.temp_client_nom) {
      toast.error("Veuillez saisir le nom du client.");
      return;
    }

    if (Number(nouvelleFacture.paiement) > Number(nouvelleFacture.prix_total)) {
      toast.error(`Le montant payé (${nouvelleFacture.paiement} FMG) ne peut pas dépasser le montant total (${nouvelleFacture.prix_total} FMG).`);
      return;
    }

    if (nouvelleFacture.liste_articles.length === 0) {
      toast.error("Veuillez ajouter au moins un article.");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, submit: true }));

      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        throw new Error("Session utilisateur invalide");
      }

      const url = isEditMode
        ? `${API_URL}/api/factures/${editingFactureId}`
        : `${API_URL}/api/factures`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await axios({
        method,
        url,
        data: {
          ...nouvelleFacture,
          prix_total: Math.max(0, calculerMontantTotal(nouvelleFacture.liste_articles) - (parseFloat(nouvelleFacture.remise) || 0)),
          client_id: nouvelleFacture.isTempClient ? null : nouvelleFacture.client_id,
          created_by_id: user.id,
          date_facture: nouvelleFacture.date_facture || new Date().toLocaleDateString('en-CA'),
          Objet: nouvelleFacture.Objet || null,
          commentaire: nouvelleFacture.commentaire || null,
          paiement: nouvelleFacture.paiement !== undefined ? Number(nouvelleFacture.paiement) : 0,
          temp_client_nom: nouvelleFacture.isTempClient ? nouvelleFacture.temp_client_nom : null,
          temp_client_adresse: nouvelleFacture.isTempClient ? nouvelleFacture.temp_client_adresse : null,
          temp_client_telephone: nouvelleFacture.isTempClient ? nouvelleFacture.temp_client_telephone : null,
          temp_client_email: nouvelleFacture.isTempClient ? nouvelleFacture.temp_client_email : null,
          status: 'proforma',
          remise: parseFloat(nouvelleFacture.remise) || 0
        }
      });

      await fetchData();
      handleAnnuler();

      toast.success(isEditMode ? "Facture modifiée avec succès !" : "Facture créée avec succès !");
    } catch (error) {
      console.error("Erreur:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erreur serveur";
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  }, [nouvelleFacture, handleAnnuler, fetchData, isEditMode, editingFactureId]);

  const produitOptions = useMemo(() => (
    produits.map(produit => (
      <option key={produit.id} value={produit.id}>
        {produit.nom} - {produit.prix} FMG (Stock: {produit.quantite})
      </option>
    ))
  ), [produits]);

  const clientOptions = useMemo(() => (
    clients.map(client => (
      <option key={client.id} value={client.id}>
        {client.nom} - {client.email}
      </option>
    ))
  ), [clients]);

  return (
    <div ref={topRef} className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 flex items-center">
          <FaFileInvoiceDollar className="mr-2 text-blue-500" />
          Gestion des Devis (Proforma)
        </h1>
        <div >
          <FactureForm
            nouvelleFacture={nouvelleFacture}
            nouvelArticle={nouvelArticle}
            loading={loading}
            clients={clients}
            produits={produits}
            handleChange={handleChange}
            handleChangeArticle={handleChangeArticle}
            handleSelectProduit={handleSelectProduit}
            handleAjouterArticle={handleAjouterArticle}
            handleSupprimerArticle={handleSupprimerArticle}
            handleAnnuler={handleAnnuler}
            handleSubmit={handleSubmit}
            clientOptions={clientOptions}
            produitOptions={produitOptions}
            isEditMode={isEditMode}
            isProforma={true}
          />

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />


          <FactureList
            loading={loading}
            filteredFactures={filteredFactures}
            paginatedFactures={paginatedFactures}
            clients={clients}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onDeleteFacture={handleDeleteFacture}
            onEditFacture={handleEditFacture}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            isProforma={true}
            onConvertToFacture={handleConvertToFacture}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setFactureToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Supprimer le devis"
        message="Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible."
        isLoading={loading.factures}
      />

      <ConfirmModal
        isOpen={isConvertModalOpen}
        onClose={() => {
          setIsConvertModalOpen(false);
          setFactureToConvert(null);
        }}
        onConfirm={confirmConvert}
        title="Convertir en facture"
        message="Êtes-vous sûr de vouloir convertir ce devis en facture finale ? Le stock sera alors déduit."
        isLoading={loading.submit}
      />
    </div>
  );
};

export default Proformas;