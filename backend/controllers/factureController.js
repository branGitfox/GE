// Description: Contrôleur pour gérer les factures, y compris la création et la récupération de factures

const db = require("../db");
const { logAction } = require("../utils/logger");

// Créer une facture avec gestion de stock
exports.createFacture = async (req, res) => {
  const {
    client_id,
    date_facture,
    liste_articles,
    prix_total,
    created_by_id,
    Objet,
    commentaire,
    temp_client_nom,
    temp_client_adresse,
    temp_client_telephone,
    temp_client_email,
    status = 'facture',
    remise = 0
  } = req.body;

  if ((!client_id && !temp_client_nom) || !liste_articles?.length || !prix_total) {
    return res.status(400).json({ message: "Données manquantes ou invalides" });
  }

  // Helper pour exécuter une requête avec Promise
  const queryAsync = (sql, params) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => err ? reject(err) : resolve(results));
  });

  try {
    // 1. Démarrer la transaction
    await queryAsync("START TRANSACTION", []);

    // 2. Vérifier le client
    if (client_id) {
      const clients = await queryAsync("SELECT id FROM clients WHERE id = ?", [client_id]);
      if (clients.length === 0) throw new Error("Client permanent introuvable");
    }

    // 3. Générer le numéro de facture
    const lastFacture = await queryAsync("SELECT numero_facture FROM factures ORDER BY id DESC LIMIT 1", []);
    const lastNum = lastFacture[0]?.numero_facture?.split('-')[1] || 0;
    const numero_facture = `Fact-${String(parseInt(lastNum) + 1).padStart(3, '0')}`;

    // 4. Vérifier les stocks SÉQUENTIELLEMENT (Uniquement pour les factures)
    if (status === 'facture') {
      const aggregatedArticles = {};
      for (const article of liste_articles) {
        const id = article.produit_id;
        const qte = parseFloat(article.quantite) || 0;

        // Aggregate quantities for the same product ID
        if (aggregatedArticles[id]) {
          aggregatedArticles[id].quantite += qte;
        } else {
          aggregatedArticles[id] = { ...article, quantite: qte };
        }
      }

      for (const item of Object.values(aggregatedArticles)) {
        const resP = await queryAsync("SELECT quantite, nom, pieces_par_carton FROM produits WHERE id = ?", [item.produit_id]);
        const produit = resP[0];
        if (!produit) throw new Error(`Produit ID ${item.produit_id} introuvable`);

        const multi = item.type_vente === 'carton' ? (produit.pieces_par_carton || 1) : 1;
        const totalNeeded = item.quantite * multi; // Use aggregated quantity

        if (produit.quantite < totalNeeded) {
          throw new Error(`Stock insuffisant pour ${produit.nom} (Dispo: ${produit.quantite}, Requis: ${totalNeeded})`);
        }
      }
    }

    // 5. Créer la facture (ou proforma)
    const resultFacture = await queryAsync(
      "INSERT INTO factures SET ?",
      {
        client_id: client_id || null,
        temp_client_nom: client_id ? null : temp_client_nom,
        temp_client_adresse: client_id ? null : temp_client_adresse,
        temp_client_telephone: client_id ? null : temp_client_telephone,
        temp_client_email: client_id ? null : temp_client_email,
        numero_facture,
        date_facture: date_facture || new Date().toLocaleDateString('en-CA'),
        liste_articles: JSON.stringify(liste_articles),
        prix_total,
        created_by_id,
        Objet,
        commentaire,
        paiement: req.body.paiement || 0,
        date_paiement: req.body.paiement > 0 ? new Date().toLocaleDateString('en-CA') : null,
        status,
        remise: remise || 0
      }
    );

    const insertId = resultFacture.insertId;

    // 6. Mettre à jour les stocks ET l'historique SÉQUENTIELLEMENT (Uniquement pour les factures)
    if (status === 'facture') {
      for (const article of liste_articles) {
        const resP = await queryAsync("SELECT * FROM produits WHERE id = ?", [article.produit_id]);
        const produit = resP[0];
        const multi = article.type_vente === 'carton' ? (produit.pieces_par_carton || 1) : 1;
        const qtyToDeduct = parseFloat(article.quantite) * multi;

        // 1. Diminuer le stock produit
        await queryAsync("UPDATE produits SET quantite = quantite - ? WHERE id = ?", [qtyToDeduct, article.produit_id]);
      }
    }

    // 7. Valider la transaction
    await queryAsync("COMMIT", []);

    await logAction(req.user?.id, 'add', 'facture', insertId, null, req.body, `Création de la ${status}: ${numero_facture}`);
    res.status(201).json({ success: true, id: insertId, numero_facture });

  } catch (error) {
    console.error("❌ Erreur Facturation:", error);
    await queryAsync("ROLLBACK", []).catch(() => { }); // Attempt rollback, ignore if it fails
    res.status(400).json({ message: error.message || "Erreur lors de la création de la facture" });
  }
};
























// Dans votre backend (factureController.js)
exports.deleteFacture = async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM factures WHERE id = ?';
    db.query(query, [id], (err, result) => {
      if (err) throw err;

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Facture non trouvée" });
      }

      res.status(200).json({ message: "Facture supprimée avec succès" });
      logAction(req.user?.id, 'delete', 'facture', id, null, null, `Suppression de la facture ID: ${id}`);
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de la facture",
      error: error.message
    });
  }
};

// Update/Edit a facture with stock management
exports.updateFacture = async (req, res) => {
  const { id } = req.params;
  const {
    client_id,
    date_facture,
    liste_articles,
    prix_total,
    Objet,
    commentaire,
    temp_client_nom,
    temp_client_adresse,
    temp_client_telephone,
    temp_client_email,
    status = 'facture',
    remise = 0
  } = req.body;

  if ((!client_id && !temp_client_nom) || !liste_articles?.length || !prix_total) {
    return res.status(400).json({ message: "Données manquantes ou invalides" });
  }

  db.beginTransaction(async (err) => {
    if (err) {
      return res.status(500).json({ message: "Erreur de transaction" });
    }

    try {
      // 1. Get the old invoice to restore stock
      db.query(
        "SELECT liste_articles, status FROM factures WHERE id = ?",
        [id],
        async (err, oldFactureRows) => {
          if (err) throw err;
          if (oldFactureRows.length === 0) {
            return db.rollback(() => {
              res.status(404).json({ message: "Facture non trouvée" });
            });
          }

          const oldFacture = oldFactureRows[0];
          const oldArticles = JSON.parse(oldFacture.liste_articles || "[]");
          const oldStatus = oldFacture.status || 'facture';

          // 2. Restore stock from old invoice (ONLY if it was a real facture)
          if (oldStatus === 'facture') {
            for (const article of oldArticles) {
              await new Promise((resolve, reject) => {
                db.query("SELECT pieces_par_carton FROM produits WHERE id = ?", [article.produit_id], (err, resP) => {
                  if (err) reject(err);
                  const multi = article.type_vente === 'carton' ? (resP[0]?.pieces_par_carton || 1) : 1;
                  const qtyToRestore = article.quantite * multi;

                  db.query(
                    "UPDATE produits SET quantite = quantite + ? WHERE id = ?",
                    [qtyToRestore, article.produit_id],
                    (err) => {
                      if (err) reject(err);
                      else resolve();
                    }
                  );
                });
              });
            }
          }

          // 3. Verify and deduct new stock (ONLY if the new status is a real facture)
          if (status === 'facture') {
            for (const article of liste_articles) {
              const produit = await new Promise((resolve, reject) => {
                db.query(
                  "SELECT nom, quantite, pieces_par_carton FROM produits WHERE id = ?",
                  [article.produit_id],
                  (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0]);
                  }
                );
              });

              const multi = article.type_vente === 'carton' ? (produit?.pieces_par_carton || 1) : 1;
              const qtyToDeduct = article.quantite * multi;

              if (!produit || parseFloat(produit.quantite) < qtyToDeduct) {
                return db.rollback(() => {
                  res.status(400).json({
                    message: `Stock insuffisant pour ${produit?.nom || article.nom || article.produit_id} (Requis: ${qtyToDeduct} pièces, Dispo: ${produit?.quantite || 0})`
                  });
                });
              }

              await new Promise((resolve, reject) => {
                db.query(
                  "UPDATE produits SET quantite = quantite - ? WHERE id = ?",
                  [qtyToDeduct, article.produit_id],
                  (err) => {
                    if (err) reject(err);
                    else resolve();
                  }
                );
              });
            }
          }

          // 4. Update the invoice
          db.query(
            `UPDATE factures SET 
              client_id = ?, 
              temp_client_nom = ?,
              temp_client_adresse = ?,
              temp_client_telephone = ?,
              temp_client_email = ?,
              date_facture = ?, 
              liste_articles = ?, 
              prix_total = ?,
              Objet = ?,
              commentaire = ?,
              paiement = ?,
              date_paiement = ?,
              status = ?,
              remise = ?
            WHERE id = ?`,
            [
              client_id || null,
              client_id ? null : temp_client_nom,
              client_id ? null : temp_client_adresse,
              client_id ? null : temp_client_telephone,
              client_id ? null : temp_client_email,
              date_facture,
              JSON.stringify(liste_articles),
              prix_total,
              Objet || null,
              commentaire || null,
              req.body.paiement !== undefined ? req.body.paiement : 0,
              req.body.paiement > 0 ? new Date().toLocaleDateString('en-CA') : null,
              status,
              remise || 0,
              id
            ],
            async (err, result) => {
              if (err) {
                return db.rollback(() => {
                  throw err;
                });
              }

              await logAction(req.user?.id, 'update', 'facture', id, null, req.body, `Mise à jour de la facture: ${oldFacture.numero_facture}`);

              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    throw err;
                  });
                }

                res.status(200).json({
                  message: "Facture mise à jour avec succès",
                  factureId: id
                });
              });
            }
          );
        }
      );
    } catch (error) {
      db.rollback(() => {
        res.status(500).json({
          message: "Erreur lors de la mise à jour de la facture",
          error: error.message
        });
      });
    }
  });
};





exports.getAllFactures = async (req, res) => {
  try {
    const query = `
            SELECT 
        f.*, 
        u.nom, 
        u.prenom,
        CONCAT(u.nom, ' ', u.prenom) AS created_by_fullname,
        COALESCE(c.nom, f.temp_client_nom) AS client_nom,
        COALESCE(c.adresse, f.temp_client_adresse) AS client_adresse,
        COALESCE(c.telephone, f.temp_client_telephone) AS client_telephone,
        COALESCE(c.email, f.temp_client_email) AS client_email
      FROM factures f
      LEFT JOIN users u ON f.created_by_id = u.id
      LEFT JOIN clients c ON f.client_id = c.id
      ORDER BY f.date_facture DESC, f.id DESC

    `;

    db.query(query, (err, results) => {
      if (err) throw err;

      const factures = results.map(facture => ({
        ...facture,
        created_by: facture.nom && facture.prenom
          ? `${facture.nom} ${facture.prenom}`
          : 'Utilisateur inconnu'
      }));

      res.status(200).json(factures);
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des factures",
      error: error.message
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const { year: queryYear, startDate, endDate } = req.query;
    console.log("getDashboardStats called with:", { queryYear, startDate, endDate });

    const now = new Date();
    const currentYear = now.getFullYear();
    const selectedYear = queryYear ? parseInt(queryYear) : currentYear;

    let query = "SELECT prix_total, date_facture, liste_articles, paiement, remise, date_paiement, dernier_paiement FROM factures WHERE (status IS NULL OR status = 'facture') AND (YEAR(date_facture) = ?)";
    const queryParams = [selectedYear];

    // Si une plage est fournie pour une AUTRE année, on l'inclut aussi
    if (startDate && endDate) {
      query = "SELECT prix_total, date_facture, liste_articles, paiement, remise, date_paiement, dernier_paiement FROM factures WHERE (status IS NULL OR status = 'facture') AND (YEAR(date_facture) = ? OR date_facture BETWEEN ? AND ?)";
      queryParams.push(startDate, endDate);
    }

    db.query(query, queryParams, (err, results) => {
      if (err) throw err;

      let totalRevenue = 0;
      let totalProductsSold = 0;
      let totalPaid = 0;
      let totalUnpaid = 0;
      let totalRemise = 0;

      // Initialize period revenues
      let revenueToday = 0;
      let revenueWeek = 0;
      let revenueMonth = 0;
      let revenueYear = 0;
      let revenueSelectedYear = 0;
      let revenueSelectedRange = 0;
      let paidSelectedRange = 0;
      let unpaidSelectedRange = 0;

      // Encaissements réels basés sur date_paiement
      let paidToday = 0;
      let paidWeek = 0;
      let paidMonth = 0;

      const monthStr = String(now.getMonth() + 1).padStart(2, '0');
      const dayStr = String(now.getDate()).padStart(2, '0');
      const todayStr = `${currentYear}-${monthStr}-${dayStr}`;

      const startOfWeek = new Date(now);
      const dayOfWeek = startOfWeek.getDay() || 7;
      if (dayOfWeek !== 1) startOfWeek.setHours(-24 * (dayOfWeek - 1));
      startOfWeek.setHours(0, 0, 0, 0);

      const currentMonthIndex = now.getMonth();

      const rangeStartStr = startDate || null;
      const rangeEndStr = endDate || null;

      results.forEach(facture => {
        const montant = parseFloat(facture.prix_total) || 0;
        const dateFacture = new Date(facture.date_facture);

        const fYear = dateFacture.getFullYear();
        const fMonth = String(dateFacture.getMonth() + 1).padStart(2, '0');
        const fDay = String(dateFacture.getDate()).padStart(2, '0');
        const dateStr = `${fYear}-${fMonth}-${fDay}`;

        // Add to total (within the query result scope)
        totalRevenue += montant;
        const paidAmount = parseFloat(facture.paiement) || 0;
        totalPaid += paidAmount;
        totalUnpaid += Math.max(0, montant - paidAmount);
        totalRemise += parseFloat(facture.remise) || 0;

        // Period Calculations
        if (dateStr === todayStr) revenueToday += montant;
        if (dateFacture >= startOfWeek) revenueWeek += montant;
        if (dateFacture.getMonth() === currentMonthIndex && dateFacture.getFullYear() === currentYear) revenueMonth += montant;
        if (dateFacture.getFullYear() === currentYear) revenueYear += montant;
        if (fYear === selectedYear) revenueSelectedYear += montant;

        // Custom Range Calculation
        if (rangeStartStr && rangeEndStr) {
          if (dateStr >= rangeStartStr && dateStr <= rangeEndStr) {
            revenueSelectedRange += montant;
            const paidAmountInRange = parseFloat(facture.paiement) || 0;
            paidSelectedRange += paidAmountInRange;
            unpaidSelectedRange += Math.max(0, montant - paidAmountInRange);
          }
        }

        // Encaissements basés sur date_paiement (argent réellement reçu)
        const datePmt = facture.date_paiement ? new Date(facture.date_paiement + 'T00:00:00') : null;
        const dernierVersement = parseFloat(facture.dernier_paiement || 0);
        if (datePmt && dernierVersement > 0) {
          const dpYear = datePmt.getFullYear();
          const dpMonth = String(datePmt.getMonth() + 1).padStart(2, '0');
          const dpDay = String(datePmt.getDate()).padStart(2, '0');
          const pmtDateStr = `${dpYear}-${dpMonth}-${dpDay}`;

          if (pmtDateStr === todayStr) paidToday += dernierVersement;
          if (datePmt >= startOfWeek) paidWeek += dernierVersement;
          if (datePmt.getMonth() === currentMonthIndex && datePmt.getFullYear() === currentYear) paidMonth += dernierVersement;
        }

        // Products count
        try {
          const articles = JSON.parse(facture.liste_articles || '[]');
          if (Array.isArray(articles)) {
            articles.forEach(article => {
              totalProductsSold += parseInt(article.quantite) || 0;
            });
          }
        } catch (e) { }
      });

      // Recent Invoices (stays same as it's just 'recent', but exclude proformas)
      const recentQuery = `
        SELECT f.id, f.numero_facture, f.date_facture, f.prix_total,
               COALESCE(c.nom, f.temp_client_nom) as client_nom,
               CONCAT(u.nom, ' ', u.prenom) as created_by
        FROM factures f
        LEFT JOIN clients c ON f.client_id = c.id
        LEFT JOIN users u ON f.created_by_id = u.id
        WHERE f.status IS NULL OR f.status = 'facture'
        ORDER BY f.created_at DESC LIMIT 10
      `;

      db.query(recentQuery, (err, recentResults) => {
        if (err) throw err;

        res.status(200).json({
          totalRevenue: totalRevenue.toFixed(2),
          totalPaid: totalPaid.toFixed(2),
          totalUnpaid: totalUnpaid.toFixed(2),
          totalRemise: totalRemise.toFixed(2),
          revenueToday: revenueToday.toFixed(2),
          revenueWeek: revenueWeek.toFixed(2),
          revenueMonth: revenueMonth.toFixed(2),
          revenueYear: revenueYear.toFixed(2),
          revenueSelectedYear: revenueSelectedYear.toFixed(2),
          revenueSelectedRange: revenueSelectedRange.toFixed(2),
          paidSelectedRange: paidSelectedRange.toFixed(2),
          unpaidSelectedRange: unpaidSelectedRange.toFixed(2),
          paidToday: paidToday.toFixed(2),
          paidWeek: paidWeek.toFixed(2),
          paidMonth: paidMonth.toFixed(2),
          selectedYear: selectedYear,
          totalProductsSold,
          recentInvoices: recentResults
        });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur statistiques", error: error.message });
  }
};

// Récupérer les produits vendus récemment
exports.getSoldProducts = async (req, res) => {
  try {
    const { year, startDate, endDate } = req.query;
    let query = "SELECT liste_articles FROM factures WHERE (status IS NULL OR status = 'facture')";
    const queryParams = [];

    if (startDate && endDate) {
      query += " AND date_facture BETWEEN ? AND ?";
      queryParams.push(startDate, endDate);
    } else if (year) {
      query += " AND YEAR(date_facture) = ?";
      queryParams.push(year);
    } else { // Default to current year if no range or specific year is provided
      query += " AND YEAR(date_facture) = ?";
      queryParams.push(new Date().getFullYear());
    }

    query += ` ORDER BY created_at DESC`;
    // Removed LIMIT here to properly aggregate ALL sold products for the year/total
    // If performance becomes an issue, we might need a better strategy (e.g. dedicated stats table)

    db.query(query, queryParams, (err, results) => {
      if (err) throw err;

      // Map to store aggregated product sales (key: produit_id_unitType)
      const soldProductsMap = new Map();

      results.forEach(facture => {
        try {
          const articles = JSON.parse(facture.liste_articles || '[]');
          if (Array.isArray(articles)) {
            articles.forEach(article => {
              const typeVente = article.type_vente || 'piece';
              const productKey = `${article.produit_id || article.nom}_${typeVente}`;

              if (soldProductsMap.has(productKey)) {
                const existing = soldProductsMap.get(productKey);
                existing.quantite += parseFloat(article.quantite) || 0;
                existing.totalRevenue += (parseFloat(article.quantite) || 0) * (parseFloat(article.prix) || 0);
              } else {
                soldProductsMap.set(productKey, {
                  nom: article.nom,
                  produit_id: article.produit_id || null,
                  quantite: parseFloat(article.quantite) || 0,
                  prix: parseFloat(article.prix) || 0,
                  type_vente: typeVente,
                  unité: typeVente, // Will be resolved to real name below
                  totalRevenue: (parseFloat(article.quantite) || 0) * (parseFloat(article.prix) || 0),
                  prix_achat: 0 // Will be filled below
                });
              }
            });
          }
        } catch (e) {
          console.error("Error parsing liste_articles:", e);
        }
      });

      // Convert map to sorted array
      const soldProducts = Array.from(soldProductsMap.values())
        .sort((a, b) => b.quantite - a.quantite)
        .slice(0, 10); // Top 10 sold products

      // Fetch prix_achat + real unit names from produits table
      const productIds = [...new Set(soldProducts.map(p => p.produit_id).filter(Boolean))];
      if (productIds.length === 0) {
        return res.status(200).json(soldProducts);
      }

      db.query('SELECT id, prix_achat, prix_achat_piece, nom_unite_gros, `unité`, pieces_par_carton FROM produits WHERE id IN (?)', [productIds], (errP, produits) => {
        if (errP) {
          console.error("Erreur récupération prix_achat:", errP);
          return res.status(200).json(soldProducts);
        }
        const produitMap = new Map(produits.map(p => [p.id, p]));
        soldProducts.forEach(sp => {
          if (sp.produit_id && produitMap.has(sp.produit_id)) {
            const prod = produitMap.get(sp.produit_id);
            const isCarton = sp.type_vente === 'carton';
            const piecesParCarton = parseFloat(prod.pieces_par_carton) || 1;

            // Adjust prix_achat for Detail sales
            sp.prix_achat = isCarton
              ? (parseFloat(prod.prix_achat) || 0)
              : (parseFloat(prod.prix_achat_piece) > 0 ? parseFloat(prod.prix_achat_piece) : ((parseFloat(prod.prix_achat) || 0) / piecesParCarton));

            // Resolve real unit name: carton → nom_unite_gros, else → unité (detail)
            sp.unité = isCarton
              ? (prod.nom_unite_gros || 'Gros')
              : (prod['unité'] || 'Pièce');
          }
        });
        res.status(200).json(soldProducts);
      });
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des produits vendus",
      error: error.message
    });
  }
};

// Récupérer les statistiques financières groupées par mois pour l'année sélectionnée
exports.getFinancialStats = async (req, res) => {
  try {
    const { year, startDate, endDate } = req.query;

    let start, end;
    if (startDate && endDate) {
      // Use string splitting to avoid timezone shifts
      const [sy, sm, sd] = startDate.split('-').map(Number);
      const [ey, em, ed] = endDate.split('-').map(Number);
      start = new Date(sy, sm - 1, sd);
      end = new Date(ey, em - 1, ed, 23, 59, 59, 999);
    } else {
      const selectedYear = year ? parseInt(year) : new Date().getFullYear();
      start = new Date(selectedYear, 0, 1);
      end = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
    }

    // 1. Factures (Revenu Brut et Montant Payé)
    const factureQuery = `
      SELECT 
        YEAR(date_facture) as year,
        MONTH(date_facture) as month,
        SUM(prix_total) as revenue,
        SUM(paiement) as paid
      FROM factures
      WHERE (status IS NULL OR status = 'facture') AND date_facture BETWEEN ? AND ?
      GROUP BY YEAR(date_facture), MONTH(date_facture)
      ORDER BY YEAR(date_facture), MONTH(date_facture)
    `;

    // 2. Dépenses Diverses
    const depenseQuery = `
      SELECT 
        YEAR(date) as year,
        MONTH(date) as month,
        SUM(montant) as total
      FROM depenses
      WHERE date BETWEEN ? AND ?
      GROUP BY YEAR(date), MONTH(date)
    `;

    // 3. Achats de Produits (Stock)
    const achatQuery = `
      SELECT 
        YEAR(created_at) as year,
        MONTH(created_at) as month,
        SUM(quantite * prix_achat) as total
      FROM produit_achat
      WHERE created_at BETWEEN ? AND ?
      GROUP BY YEAR(created_at), MONTH(created_at)
    `;

    const [factures, depenses, achats] = await Promise.all([
      new Promise((resolve, reject) => db.query(factureQuery, [start, end], (err, r) => err ? reject(err) : resolve(r))),
      new Promise((resolve, reject) => db.query(depenseQuery, [start, end], (err, r) => err ? reject(err) : resolve(r))),
      new Promise((resolve, reject) => db.query(achatQuery, [start, end], (err, r) => err ? reject(err) : resolve(r)))
    ]);

    // Générer la liste des mois entre start et end
    const monthlyData = [];
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= last) {
      monthlyData.push({
        year: current.getFullYear(),
        month: current.getMonth() + 1,
        name: new Intl.DateTimeFormat('fr-FR', { month: 'short', year: start.getFullYear() !== end.getFullYear() ? '2-digit' : undefined }).format(current),
        revenue: 0,
        paid: 0,
        expenses: 0,
        profit: 0
      });
      current.setMonth(current.getMonth() + 1);
    }

    factures.forEach(f => {
      const target = monthlyData.find(m => m.year === f.year && m.month === f.month);
      if (target) {
        target.revenue = parseFloat(f.revenue) || 0;
        target.paid = parseFloat(f.paid) || 0;
      }
    });

    depenses.forEach(d => {
      const target = monthlyData.find(m => m.year === d.year && m.month === d.month);
      if (target) target.expenses += parseFloat(d.total) || 0;
    });

    achats.forEach(a => {
      const target = monthlyData.find(m => m.year === a.year && m.month === a.month);
      if (target) target.expenses += parseFloat(a.total) || 0;
    });

    // Calculer le bénéfice (entrant - depense)
    monthlyData.forEach(m => {
      m.profit = m.paid - m.expenses;
    });

    res.status(200).json(monthlyData);
  } catch (error) {
    console.error("Error in getFinancialStats:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques financières",
      error: error.message
    });
  }
};

// Convertir une proforma en facture réelle (avec gestion de stock)
exports.convertProformaToFacture = async (req, res) => {
  const { id } = req.params;

  const queryAsync = (sql, params) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => err ? reject(err) : resolve(results));
  });

  try {
    // 1. Démarrer la transaction
    await queryAsync("START TRANSACTION", []);

    // 2. Récupérer la proforma
    const factures = await queryAsync("SELECT * FROM factures WHERE id = ?", [id]);
    if (factures.length === 0) throw new Error("Document introuvable");
    const facture = factures[0];

    if (facture.status !== 'proforma') {
      throw new Error("Ce document est déjà une facture ou n'est pas une proforma");
    }

    const liste_articles = JSON.parse(facture.liste_articles || "[]");

    // 3. Vérifier les stocks
    const aggregatedArticles = {};
    for (const article of liste_articles) {
      const pId = article.produit_id;
      const qte = parseFloat(article.quantite) || 0;
      if (aggregatedArticles[pId]) {
        aggregatedArticles[pId].quantite += qte;
      } else {
        aggregatedArticles[pId] = { ...article, quantite: qte };
      }
    }

    for (const item of Object.values(aggregatedArticles)) {
      const resP = await queryAsync("SELECT quantite, nom, pieces_par_carton FROM produits WHERE id = ?", [item.produit_id]);
      const produit = resP[0];
      if (!produit) throw new Error(`Produit ID ${item.produit_id} introuvable`);

      const multi = item.type_vente === 'carton' ? (produit.pieces_par_carton || 1) : 1;
      const totalNeeded = item.quantite * multi;

      if (produit.quantite < totalNeeded) {
        throw new Error(`Stock insuffisant pour ${produit.nom} (Dispo: ${produit.quantite}, Requis: ${totalNeeded})`);
      }
    }

    // 4. Mettre à jour les stocks
    for (const article of liste_articles) {
      const resP = await queryAsync("SELECT pieces_par_carton FROM produits WHERE id = ?", [article.produit_id]);
      const multi = article.type_vente === 'carton' ? (resP[0]?.pieces_par_carton || 1) : 1;
      const qtyToDeduct = parseFloat(article.quantite) * multi;

      await queryAsync("UPDATE produits SET quantite = quantite - ? WHERE id = ?", [qtyToDeduct, article.produit_id]);
    }

    // 5. Mettre à jour la facture
    await queryAsync(
      "UPDATE factures SET status = 'facture', date_facture = ? WHERE id = ?",
      [new Date().toLocaleDateString('en-CA'), id]
    );

    // 6. Valider la transaction
    await queryAsync("COMMIT", []);
    res.status(200).json({ success: true, message: "Proforma convertie en facture avec succès" });

  } catch (error) {
    console.error("❌ Erreur Conversion Proforma:", error);
    await queryAsync("ROLLBACK", []).catch(() => { });
    res.status(400).json({ message: error.message || "Erreur lors de la conversion" });
  }
};

// Ajouter un paiement à une facture
exports.addPayment = async (req, res) => {
  const { id } = req.params;
  const { montant, remise } = req.body;
  const paymentAmount = parseFloat(montant || 0);
  const remiseAmount = parseFloat(remise || 0);

  if (paymentAmount <= 0 && remiseAmount <= 0) {
    return res.status(400).json({ message: "Montant ou remise invalide" });
  }

  try {
    const factures = await db.promise().query("SELECT prix_total, paiement FROM factures WHERE id = ?", [id]);
    if (factures[0].length === 0) {
      return res.status(404).json({ message: "Facture introuvable" });
    }

    const facture = factures[0][0];
    const oldPrixTotal = parseFloat(facture.prix_total);
    const oldRemise = parseFloat(facture.remise || 0);
    const oldPaiement = parseFloat(facture.paiement || 0);

    const nouveauPrixTotal = oldPrixTotal - remiseAmount;
    const nouvelleRemise = oldRemise + remiseAmount;
    const nouveauPaiement = oldPaiement + paymentAmount;

    if (nouveauPaiement > nouveauPrixTotal) {
      return res.status(400).json({ message: "Le montant total payé ne peut pass dépasser le nouveau prix total après remise" });
    }

    const currentDate = new Date().toLocaleDateString('en-CA');

    await db.promise().query(
      "UPDATE factures SET prix_total = ?, remise = ?, paiement = ?, dernier_paiement = ?, date_paiement = ? WHERE id = ?",
      [nouveauPrixTotal, nouvelleRemise, nouveauPaiement, paymentAmount, currentDate, id]
    );

    res.status(200).json({
      success: true,
      message: "Paiement et/ou remise ajoutés avec succès",
      nouveauPaiement,
      nouveauPrixTotal,
      nouvelleRemise,
      date_paiement: currentDate
    });
  } catch (error) {
    console.error("❌ Erreur Paiement:", error);
    res.status(500).json({ message: "Erreur lors de l'ajout du paiement" });
  }
};

// Récupérer les fournisseurs dont les produits se vendent le mieux
exports.getTopSuppliers = async (req, res) => {
  try {
    const { year, startDate, endDate } = req.query;
    let query = "SELECT liste_articles FROM factures WHERE (status IS NULL OR status = 'facture')";
    const queryParams = [];

    if (startDate && endDate) {
      query += " AND date_facture BETWEEN ? AND ?";
      queryParams.push(startDate, endDate);
    } else if (year) {
      query += " AND YEAR(date_facture) = ?";
      queryParams.push(year);
    } else {
      query += " AND YEAR(date_facture) = ?";
      queryParams.push(new Date().getFullYear());
    }

    db.query(query, queryParams, async (err, results) => {
      if (err) {
        console.error("Erreur SQL top-suppliers:", err);
        return res.status(500).json({ message: "Erreur SQL" });
      }

      console.log(`[TopSuppliers] Trouvé ${results.length} factures`);

      const productSales = new Map();
      results.forEach(facture => {
        try {
          const articles = JSON.parse(facture.liste_articles || '[]');
          articles.forEach(article => {
            const pid = article.produit_id;
            if (!pid) return;
            const key = pid;
            if (productSales.has(key)) {
              productSales.get(key).quantite += parseFloat(article.quantite) || 0;
              productSales.get(key).revenue += (parseFloat(article.quantite) || 0) * (parseFloat(article.prix) || 0);
            } else {
              productSales.set(key, {
                id: pid,
                nom: article.nom,
                quantite: parseFloat(article.quantite) || 0,
                revenue: (parseFloat(article.quantite) || 0) * (parseFloat(article.prix) || 0)
              });
            }
          });
        } catch (e) { }
      });

      console.log(`[TopSuppliers] ${productSales.size} produits uniques vendus`);

      if (productSales.size === 0) return res.json([]);

      // Fetch all products involved to get their supplier_id
      const productIds = Array.from(productSales.keys());
      db.query(
        "SELECT p.id, p.fournisseur_id, f.nom as fournisseur_nom FROM produits p LEFT JOIN fournisseurs f ON p.fournisseur_id = f.id WHERE p.id IN (?)",
        [productIds],
        (errInfo, productsInfo) => {
          if (errInfo) {
            console.error("Erreur produits-fournisseurs stats:", errInfo);
            return res.status(500).json({ message: "Erreur liaison fournisseurs" });
          }

          console.log(`[TopSuppliers] Récupéré infos pour ${productsInfo.length} produits`);

          const supplierStats = new Map();
          productsInfo.forEach(p => {
            const stats = productSales.get(p.id);
            if (!stats) return;

            const fid = p.fournisseur_id || 'unknown';
            if (supplierStats.has(fid)) {
              const curr = supplierStats.get(fid);
              curr.revenue += stats.revenue;
              curr.total_items += stats.quantite;
              if (stats.quantite > curr.best_product_qty) {
                curr.best_product_qty = stats.quantite;
                curr.best_product_name = stats.nom;
              }
            } else {
              supplierStats.set(fid, {
                fournisseur_id: p.fournisseur_id,
                fournisseur_nom: p.fournisseur_nom || 'Sans Fournisseur',
                revenue: stats.revenue,
                total_items: stats.quantite,
                best_product_name: stats.nom,
                best_product_qty: stats.quantite
              });
            }
          });

          const sortedSuppliers = Array.from(supplierStats.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

          res.status(200).json(sortedSuppliers);
        }
      );
    });
  } catch (error) {
    console.error("Error in getTopSuppliers:", error);
    res.status(500).json({ message: "Erreur top fournisseurs", error: error.message });
  }
};
