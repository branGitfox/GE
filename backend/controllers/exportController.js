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
            { header: 'Stock (Total Pièces)', key: 'quantite', width: 20 },
            { header: 'Stock Formaté', key: 'stock_formate', width: 25 },
            { header: 'Valeur Stock (Achat)', key: 'valeur_stock', width: 20 },
            { header: 'Unité Gros', key: 'unite_gros', width: 15 },
            { header: 'Unité Détail', key: 'unite_detail', width: 15 },
            { header: 'Ratio', key: 'ratio', width: 10 }
        ];

        const produits = await queryAsync(`
            SELECT p.*, c.nom as categorie_nom 
            FROM produits p 
            LEFT JOIN categories c ON p.category_id = c.id
        `);

        produits.forEach(p => {
            const ratio = p.pieces_par_carton || 1;
            const cartons = Math.floor(p.quantite / ratio);
            const pieces = p.quantite % ratio;
            let stock_formate = `${cartons} ${p.nom_unite_gros || 'Carton'}${cartons > 1 ? 's' : ''}`;
            if (pieces > 0) stock_formate += ` et ${pieces} ${p.unité || 'Pièce'}${pieces > 1 ? 's' : ''}`;

            sheetProduits.addRow({
                id: p.id,
                nom: p.nom,
                categorie: p.categorie_nom || 'Sans catégorie',
                prix_achat: p.prix_achat,
                prix_vente: p.prix_vente,
                quantite: p.quantite,
                stock_formate,
                valeur_stock: p.quantite * (p.prix_achat / ratio),
                unite_gros: p.nom_unite_gros,
                unite_detail: p.unité,
                ratio
            });
        });

        // 2. FEUILLE FACTURES (VENTES)
        const sheetVentes = workbook.addWorksheet('Ventes & Factures');
        sheetVentes.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'N° Facture', key: 'numero', width: 15 },
            { header: 'Client', key: 'client', width: 25 },
            { header: 'Statut', key: 'status', width: 12 },
            { header: 'Article', key: 'article', width: 30 },
            { header: 'Quantité', key: 'qte', width: 10 },
            { header: 'Unité', key: 'unite', width: 12 },
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
            articles.forEach((art, index) => {
                sheetVentes.addRow({
                    date: f.date_facture,
                    numero: f.numero_facture,
                    client: f.client_nom,
                    status: f.status || 'facture',
                    article: art.nom,
                    qte: art.quantite,
                    unite: art.type_vente === 'carton' ? (art.unite_gros || 'Carton') : (art.unite || 'Pièce'),
                    pu: art.prix,
                    total_ligne: art.quantite * art.prix,
                    total_facture: index === 0 ? f.prix_total : '', // Only show on first row of invoice
                    paye: index === 0 ? f.paiement : '',
                    reste: index === 0 ? (f.prix_total - f.paiement) : ''
                });
            });
        });

        // 3. FEUILLE DEPENSES
        const sheetDepenses = workbook.addWorksheet('Dépenses');
        sheetDepenses.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Nom/Catégorie', key: 'nom', width: 25 },
            { header: 'Description', key: 'description', width: 40 },
            { header: 'Montant', key: 'montant', width: 15 },
            { header: 'Fournisseur', key: 'fournisseur', width: 20 }
        ];

        const depenses = await queryAsync(`
            SELECT d.*, f.nom as fournisseur_nom 
            FROM depenses d 
            LEFT JOIN fournisseurs f ON d.fournisseur_id = f.id
            ORDER BY d.date DESC
        `);

        depenses.forEach(d => {
            sheetDepenses.addRow({
                date: d.date,
                nom: d.nom,
                description: d.description,
                montant: d.montant,
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
                total_achats: c.total_achats || 0
            });
        });

        // Appliquer les styles à tous les en-têtes
        workbook.worksheets.forEach(ws => {
            ws.getRow(1).eachCell((cell) => {
                cell.style = headerStyle;
            });
            ws.eachRow((row, rowNumber) => {
                row.eachCell((cell) => {
                    cell.border = borderStyle;
                    if (rowNumber > 1 && cell.value && typeof cell.value === 'number') {
                        cell.numFmt = '#,##0.00 "Fmg"';
                    }
                });
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
