const db = require("../db");
const ExcelJS = require('exceljs');

const queryAsync = (sql, params = []) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => err ? reject(err) : resolve(results));
});

exports.exportToExcel = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Antigravity GE';
        workbook.lastModifiedBy = 'Antigravity GE';
        workbook.created = new Date();

        // Styles
        const headerStyle = {
            font: { bold: true, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }, // Indigo 600
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
        };

        const borderStyle = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        // 1. FEUILLE PRODUITS
        const sheetProduits = workbook.addWorksheet('Produits & Stock');
        sheetProduits.columns = [
            { header: 'ID', key: 'id', width: 5 },
            { header: 'Nom', key: 'nom', width: 30 },
            { header: 'Catégorie', key: 'categorie', width: 20 },
            { header: 'Prix Achat', key: 'prix_achat', width: 15 },
            { header: 'Prix Vente', key: 'prix_vente', width: 15 },
            { header: 'Stock Total (Détail)', key: 'quantite', width: 20 },
            { header: 'Stock Formaté', key: 'stock_formate', width: 25 },
            { header: 'Valeur Stock (Achat)', key: 'valeur_stock', width: 20 },
            { header: 'Unité Gros', key: 'unite_gros', width: 15 },
            { header: 'Unité Détail', key: 'unite_detail', width: 15 }
        ];

        const produits = await queryAsync(`
            SELECT p.*, c.nom as categorie_nom 
            FROM produits p 
            LEFT JOIN categories c ON p.category_id = c.id
        `);

        produits.forEach(p => {
            const ratio = parseFloat(p.pieces_par_carton) || 1;
            const cartons = Math.floor(p.quantite / ratio);
            const pieces = Math.round((p.quantite % ratio) * 1000) / 1000;
            
            const uniteGros = (p.nom_unite_gros || 'Gros').trim();
            const uniteDetail = (p.unité || 'Détail').trim();

            let stock_formate = `${cartons} ${uniteGros}${cartons > 1 ? 's' : ''}`;
            if (pieces > 0.001) {
                const piecesStr = parseFloat(pieces.toFixed(3)).toString().replace('.', ',');
                stock_formate += ` et ${piecesStr} ${uniteDetail}${pieces > 1 ? 's' : ''}`;
            }

            const prixAchatDétail = parseFloat(p.prix_achat_piece) > 0 ? p.prix_achat_piece : (p.prix_achat / ratio);
            const quantiteTotal = Math.round(p.quantite * 1000) / 1000;

            sheetProduits.addRow({
                id: p.id,
                nom: p.nom,
                categorie: p.categorie_nom || 'Sans catégorie',
                prix_achat: Math.round(p.prix_achat || 0),
                prix_vente: Math.round(p.prix_carton || p.prix_vente || 0),
                quantite: `${quantiteTotal} ${uniteDetail}`,
                stock_formate,
                valeur_stock: Math.round(p.quantite * prixAchatDétail),
                unite_gros: uniteGros,
                unite_detail: uniteDetail
            });
        });

        // 2. FEUILLE FACTURES (VENTES)
        const sheetVentes = workbook.addWorksheet('Ventes & Factures');
        sheetVentes.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'N° Facture', key: 'numero', width: 15 },
            { header: 'Client', key: 'client', width: 25 },
            { header: 'Statut', key: 'status', width: 15 },
            { header: 'Article', key: 'article', width: 30 },
            { header: 'Quantité', key: 'qte', width: 15 },
            { header: 'Unité', key: 'unite', width: 20 },
            { header: 'P.U Vente', key: 'pu', width: 15 },
            { header: 'Total Ligne', key: 'total_ligne', width: 15 },
            { header: 'Total Facture', key: 'total_facture', width: 15 },
            { header: 'Payé', key: 'paye', width: 15 },
            { header: 'Reste à Payer', key: 'reste', width: 15 }
        ];

        const factures = await queryAsync(`
            SELECT f.*, COALESCE(c.nom, f.temp_client_nom) as client_nom 
            FROM factures f 
            LEFT JOIN clients c ON f.client_id = c.id
            ORDER BY f.date_facture DESC, f.id DESC
        `);

        factures.forEach(f => {
            const articles = JSON.parse(f.liste_articles || '[]');
            const statusLabel = f.paiement >= f.prix_total ? 'Payé' : (f.paiement > 0 ? 'Avance' : 'Non Payé');
            
            articles.forEach((art, index) => {
                const uGros = art.nom_unite_gros || 'Gros';
                const uDetail = art.unité_détail || art.unite || 'Détail';
                const labelUnite = art.type_vente === 'carton' ? `Gros(${uGros})` : `Détail(${uDetail})`;
                const qteVal = Math.round(art.quantite * 1000) / 1000;

                sheetVentes.addRow({
                    date: f.date_facture,
                    numero: f.numero_facture,
                    client: f.client_nom,
                    status: statusLabel,
                    article: art.nom,
                    qte: `${qteVal} ${art.type_vente === 'carton' ? uGros : uDetail}`,
                    unite: labelUnite,
                    pu: Math.round(art.prix || 0),
                    total_ligne: Math.round((art.quantite * art.prix) || 0),
                    total_facture: index === 0 ? Math.round(f.prix_total || 0) : '',
                    paye: index === 0 ? Math.round(f.paiement || 0) : '',
                    reste: index === 0 ? Math.round((f.prix_total - f.paiement) || 0) : ''
                });
            });
        });

        // 3. FEUILLE DEPENSES (Approvisionnements + Dépenses directes)
        const sheetDepenses = workbook.addWorksheet('Dépenses');
        sheetDepenses.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Nom/Catégorie', key: 'nom', width: 25 },
            { header: 'Description', key: 'description', width: 35 },
            { header: 'Quantité', key: 'qte', width: 10 },
            { header: 'P.U Achat', key: 'pu', width: 15 },
            { header: 'Montant Total', key: 'montant', width: 15 },
            { header: 'Fournisseur', key: 'fournisseur', width: 20 }
        ];

        const r_depenses = await queryAsync(`
            SELECT d.*, f.nom as fournisseur_nom 
            FROM depenses d 
            LEFT JOIN fournisseurs f ON d.fournisseur_id = f.id
        `);

        const r_appros = await queryAsync(`
            SELECT a.*, f.nom as fournisseur_nom, p.nom as produit_nom
            FROM produit_achat a
            LEFT JOIN fournisseurs f ON a.fournisseur_id = f.id
            LEFT JOIN produits p ON a.produit_id = p.id
        `);

        // Fusionner et trier par date
        const allOutgoings = [
            ...r_depenses.map(d => ({ 
                ...d, 
                type: 'Dépense', 
                qte: 1,
                pu: d.montant,
                total: d.montant,
                date_sort: d.date 
            })),
            ...r_appros.map(a => ({ 
                ...a, 
                type: 'Achat', 
                nom: `Achat: ${a.produit_nom || a.nom}`,
                qte: a.quantite,
                pu: a.prix_achat,
                total: a.prix_achat * a.quantite,
                date_sort: a.created_at
            }))
        ].sort((a, b) => new Date(b.date_sort) - new Date(a.date_sort));

        allOutgoings.forEach(d => {
            const qteVal = Math.round(d.qte * 1000) / 1000;
            const displayQte = d.type === 'Achat' ? `${qteVal} ${d.unite || ''}`.trim() : qteVal;

            sheetDepenses.addRow({
                date: d.date_sort,
                type: d.type,
                nom: d.nom,
                description: d.description,
                qte: displayQte,
                pu: Math.round(d.pu || 0),
                montant: Math.round(d.total || 0),
                fournisseur: d.fournisseur_nom || '—'
            });
        });

        // 4. FEUILLE CLIENTS
        const sheetClients = workbook.addWorksheet('Clients');
        sheetClients.columns = [
            { header: 'Nom', key: 'nom', width: 30 },
            { header: 'Téléphone', key: 'telephone', width: 20 },
            { header: 'Adresse', key: 'adresse', width: 40 },
            { header: 'Total Achats', key: 'total_achats', width: 15 }
        ];

        const clients = await queryAsync(`
            SELECT c.*, SUM(f.prix_total) as total_achats
            FROM clients c
            LEFT JOIN factures f ON c.id = f.client_id
            GROUP BY c.id
        `);

        clients.forEach(c => {
            sheetClients.addRow({
                nom: c.nom,
                telephone: c.telephone,
                adresse: c.adresse,
                total_achats: Math.round(c.total_achats || 0)
            });
        });

        // 5. FEUILLE FOURNISSEURS
        const sheetFournisseurs = workbook.addWorksheet('Fournisseurs');
        sheetFournisseurs.columns = [
            { header: 'Nom', key: 'nom', width: 30 },
            { header: 'Téléphone', key: 'telephone', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Adresse', key: 'adresse', width: 40 },
            { header: 'Description', key: 'description', width: 30 }
        ];

        const fournisseursData = await queryAsync(`SELECT * FROM fournisseurs ORDER BY nom ASC`);
        fournisseursData.forEach(f => {
            sheetFournisseurs.addRow({
                nom: f.nom,
                telephone: f.telephone,
                email: f.email,
                adresse: f.adresse,
                description: f.description
            });
        });

        // Appliquer les styles à tous les en-têtes
        const currencyColumns = ['prix_achat', 'prix_vente', 'valeur_stock', 'pu', 'total_ligne', 'total_facture', 'paye', 'reste', 'montant', 'total_achats'];

        workbook.worksheets.forEach(ws => {
            ws.getRow(1).eachCell((cell) => {
                cell.style = headerStyle;
            });
            ws.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    row.eachCell((cell, colNumber) => {
                        cell.border = borderStyle;
                        const key = ws.columns[colNumber - 1].key;
                        
                        if (typeof cell.value === 'number') {
                            if (currencyColumns.includes(key)) {
                                cell.numFmt = '#,##0 "Fmg"';
                            } else {
                                // For quantities and other numbers, avoid Fmg
                                cell.numFmt = '#,##0.###';
                            }
                        }
                    });
                }
            });
        });

        // Finaliser le fichier
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Rapport_Complet_GE_' + new Date().toISOString().split('T')[0] + '.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Erreur Export Excel:", error);
        res.status(500).json({ message: "Erreur lors de la génération de l'Excel", error: error.message });
    }
};
