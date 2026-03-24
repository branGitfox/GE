import React from 'react';
import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import writtenNumber from 'written-number';
import logo from '../img/soa.png';
import { styles } from './FacturePDF.styles';

writtenNumber.defaults.lang = 'fr';

// Fonction utilitaire pour formater les nombres
const formatNumber = (value) => {
  const num = parseInt(value || 0);
  return isNaN(num) ? '0' : num.toFixed().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

// Fonction pour afficher les deux monnaies (FMG et MGA)
const formatDual = (fmgValue) => {
  const fmg = parseFloat(fmgValue || 0);
  const mga = fmg / 5;
  return `${formatNumber(fmg)} FMG (${formatNumber(mga)} MGA)`;
};

const FacturePDF = ({ facture, clientName, clientEmail, clientAdresse, clientTelephone }) => {
  // Calcul des montants avec gestion des erreurs
  const prixTotal = parseFloat(facture.prix_total || 0);

  const numberToWords = (num) => {
    try {
      const safeNum = parseFloat(num || 0);
      if (isNaN(safeNum)) return "Montant non convertible";

      const intPart = Math.floor(safeNum);
      const decimalPart = Math.round((safeNum - intPart) * 100);

      let result = writtenNumber(intPart, { noAnd: true }) + ' Francs Malgaches';

      if (decimalPart > 0) {
        result += ' et ' + writtenNumber(decimalPart, { noAnd: true }) + ' centimes';
      }

      return result.charAt(0).toUpperCase() + result.slice(1);
    } catch (error) {
      console.error("Erreur de conversion:", error);
      return "Montant non convertible";
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image src={logo} style={styles.logo} />
            </View>
            <View style={styles.companyInfo}>
                      

                <Text style={styles.companyDetail}>NIF: 5001064999</Text>
              <Text style={styles.companyDetail}>STAT: 46101 32 2022 0 00721 </Text>
                <Text style={styles.companyDetail}>Adresse: Antanambao </Text>
              <Text style={styles.companyDetail}>Contact: 034 32 070 20 </Text>
               <Text style={styles.num}>032 58 060 20</Text>
               <Text style={styles.num}>034 84 668 57</Text>


            </View>
          </View>

          <View style={styles.devisInfo}>
            <Text style={styles.devisNumber}>
              {facture.status === 'proforma' ? 'FACTURE PROFORMA N°:' : 'FACTURE N°:'} {facture.numero_facture || ''}
            </Text>
            <Text style={styles.devisDate}>
              Date : {facture.date_facture ? new Date(facture.date_facture).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }) : 'Non spécifiée'}
            </Text>
          </View>
        </View>

        {/* Sections Client et Objet */}
        <View style={styles.infoSections}>
          <View style={styles.objectInfo}>
            {/* <Text style={styles.comment}>Objet : {facture.Objet || '..........................................'}</Text> */}
            <Text style={styles.comment}>Responsable : {facture.created_by || 'Non spécifié'}</Text>
            <Text style={styles.comment}>Autre commentaire : {facture.commentaire || '..........................................'}</Text>
          </View>

          <View style={styles.clientInfoBox}>
            <Text style={styles.sectionTitle}>CLIENT</Text>
            <View style={styles.clientDetails}>
              <Text style={styles.clientDetail}>Nom : {clientName || 'Non renseigné'}</Text>
              <Text style={styles.clientDetail}>Adresse : {clientAdresse || 'Non renseignée'}</Text>
              <Text style={styles.clientDetail}>Téléphone : {clientTelephone || 'Non renseigné'}</Text>
              <Text style={styles.clientDetail}>Email : {clientEmail || 'Non renseigné'}</Text>
            </View>
          </View>
        </View>

        {/* Tableau des articles */}
        <View style={styles.tableContainer}>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colIndex}>N°</Text>
              <Text style={styles.colDesignation}>DÉSIGNATION</Text>
              <Text style={styles.colQuantity}>Unité</Text>
              <Text style={styles.colQuantity}>QTÉ</Text>
              <Text style={styles.colPrice}>PRIX UNITAIRE</Text>
              <Text style={styles.colAmount}>MONTANT</Text>
            </View>

            {(() => {
              let articles = [];
              try {
                articles = typeof facture.liste_articles === 'string'
                  ? JSON.parse(facture.liste_articles)
                  : facture.liste_articles || [];
              } catch (e) {
                console.error("Error parsing articles:", e);
              }
              return (Array.isArray(articles) ? articles : []).map((article, idx) => {
                const prixUnitaire = parseFloat(article.prix || 0);
                const quantite = parseFloat(article.quantite || 0);
                const montant = prixUnitaire * quantite;

                return (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={styles.colIndex}>{idx + 1}</Text>
                    <Text style={styles.colDesignation}>{article.nom || 'Non spécifié'}</Text>
                    <Text style={styles.colQuantity}>{article.unité || '-'}</Text>
                    <Text style={styles.colQuantity}>{quantite}</Text>
                    <Text style={styles.colPrice}>{formatNumber(prixUnitaire)} FMG</Text>
                    <Text style={styles.colAmount}>{formatNumber(montant)} FMG</Text>
                  </View>
                );
              });
            })()}
          </View>
        </View>

        {/* Totaux */}
        <View style={styles.totals}>
          <View style={styles.totalContainer}>
            <View style={styles.totalLeft}>
              <Text style={styles.totalNote}>Arrêté à la somme de :</Text>
              <Text style={styles.totalInWords}>{numberToWords(prixTotal)}</Text>
            </View>
            <View style={styles.totalRight}>
              {Number(facture.remise) > 0 ? (
                <>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>SOUS-TOTAL</Text>
                    <Text style={styles.totalValue}>{formatDual(prixTotal + Number(facture.remise))}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>REMISE</Text>
                    <Text style={styles.totalValue}>-{formatDual(facture.remise)}</Text>
                  </View>
                  <View style={[styles.totalRow, styles.finalTotal]}>
                    <Text style={styles.totalLabel}>MONTANT NET À PAYER</Text>
                    <Text style={styles.totalValue}>{formatDual(prixTotal)}</Text>
                  </View>
                </>
              ) : (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>MONTANT TOTAL</Text>
                  <Text style={styles.totalValue}>{formatDual(prixTotal)}</Text>
                </View>
              )}
              {facture.status !== 'proforma' && (
                <>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>SOMME VERSÉE</Text>
                    <Text style={styles.totalValue}>{formatDual(facture.paiement)}</Text>
                  </View>
                  {facture.paiement > 0 && facture.date_paiement && (
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>DATE DU PAIEMENT</Text>
                      <Text style={styles.totalValue}>
                        {new Date(facture.date_paiement).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.totalRow, styles.finalTotal]}>
                    <Text style={[styles.totalLabel, styles.bold]}>RESTE : </Text>
                    <Text style={[styles.totalValue, styles.bold]}>
                      {formatDual(prixTotal - (facture.paiement || 0))}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>



        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Le responsable</Text>
            <View style={styles.signatureLine}></View>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Le client</Text>
            <View style={styles.signatureLine}></View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerr} fixed>
          {/* <Text style={styles.footerLine}>
            ACW – 4K DESIGNS MADAGASCAR – AGENCE WEB – TOUS TRAVAUX D'IMPRESSION – DTF - SERIGRAPHIE
          </Text>
          <Text style={styles.footerLine}>
            STAT : 63121 22 2013 0 00 524 – NIF 4 001 124 966
          </Text>
          <Text style={styles.footerLinee}>
            www.agence-acw.com – www.4kdesigns-mada.com – www.astcomweb.com
          </Text>
          <Text style={styles.footerLine}>
            ITL 13 TSARAHONENANA ITAOSY
          </Text> */}
        </View>
      </Page>
    </Document>
  );
};

export default FacturePDF;