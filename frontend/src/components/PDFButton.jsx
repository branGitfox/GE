import React, { useState, useCallback, memo, useEffect } from "react";
import { RotatingLines } from 'react-loader-spinner';
import { FaPrint, FaFilePdf } from 'react-icons/fa';
import './polyfills';

const PDFButton = memo(({ facture, clients }) => {
    const [printStatus, setPrintStatus] = useState('idle');   // 'idle' | 'printing' | 'error'
    const [downloadStatus, setDownloadStatus] = useState('idle'); // 'idle' | 'downloading' | 'error'
    const [isClient, setIsClient] = useState(false);
    const [FacturePDF, setFacturePDF] = useState(null);
    const [pdfRenderer, setPdfRenderer] = useState(null);

    useEffect(() => {
        setIsClient(true);

        if (typeof window !== 'undefined') {
            window.global = window;
            if (!window.Buffer) {
                import('buffer').then(({ Buffer }) => {
                    window.Buffer = Buffer;
                });
            }
        }

        Promise.all([
            import('./FacturePDF'),
            import('@react-pdf/renderer')
        ]).then(([facturePDF, reactPDF]) => {
            setFacturePDF(() => facturePDF.default);
            setPdfRenderer(reactPDF);
        });
    }, []);

    // Génère un blob PDF commun aux deux actions
    const buildPdfBlob = useCallback(async () => {
        const { pdf } = pdfRenderer;
        const doc = (
            <FacturePDF
                facture={facture}
                clientName={facture.client_nom || "Client inconnu"}
                clientEmail={facture.client_email || ""}
                clientAdresse={facture.client_adresse || ""}
                clientTelephone={facture.client_telephone || ""}
            />
        );
        return await pdf(doc).toBlob();
    }, [facture, FacturePDF, pdfRenderer]);

    // 1 clic → impression directe via iframe cachée
    const handlePrint = useCallback(async () => {
        if (!isClient || !FacturePDF || !pdfRenderer) return;
        setPrintStatus('printing');
        try {
            const blob = await buildPdfBlob();
            const url = URL.createObjectURL(blob);

            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.top = '-9999px';
            iframe.style.left = '-9999px';
            iframe.style.width = '1px';
            iframe.style.height = '1px';
            iframe.style.opacity = '0';
            iframe.src = url;
            document.body.appendChild(iframe);
            iframe.onload = () => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    URL.revokeObjectURL(url);
                }, 60000);
            };
            setPrintStatus('idle');
        } catch (error) {
            console.error("Erreur d'impression:", error);
            setPrintStatus('error');
            setTimeout(() => setPrintStatus('idle'), 3000);
        }
    }, [isClient, FacturePDF, pdfRenderer, buildPdfBlob]);

    // 1 clic → téléchargement direct via lien <a> programmatique
    const handleDownload = useCallback(async () => {
        if (!isClient || !FacturePDF || !pdfRenderer) return;
        setDownloadStatus('downloading');
        try {
            const blob = await buildPdfBlob();
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            const prefix = facture.status === 'proforma' ? 'facture_proforma' : 'facture';
            link.download = `${prefix}_${facture.numero_facture || facture.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 5000);

            setDownloadStatus('idle');
        } catch (error) {
            console.error("Erreur de téléchargement:", error);
            setDownloadStatus('error');
            setTimeout(() => setDownloadStatus('idle'), 3000);
        }
    }, [isClient, FacturePDF, pdfRenderer, buildPdfBlob, facture]);

    if (!isClient) return null;

    const busy = !FacturePDF || !pdfRenderer;

    return (
        <div className="flex space-x-1">
            {/* Bouton Imprimer */}
            <button
                onClick={handlePrint}
                disabled={busy || printStatus === 'printing'}
                className="p-2 text-green-600 hover:text-green-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Imprimer la facture"
            >
                {printStatus === 'printing' ? (
                    <RotatingLines strokeColor="#16a34a" strokeWidth="5" animationDuration="0.75" width="16" visible={true} />
                ) : (
                    <FaPrint size={16} />
                )}
            </button>

            {/* Bouton Télécharger PDF */}
            <button
                onClick={handleDownload}
                disabled={busy || downloadStatus === 'downloading'}
                className={`p-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${downloadStatus === 'error' ? 'text-red-500 hover:text-red-700' : 'text-blue-500 hover:text-blue-700'
                    }`}
                title={downloadStatus === 'error' ? 'Erreur - Réessayer' : 'Télécharger PDF'}
            >
                {downloadStatus === 'downloading' ? (
                    <RotatingLines strokeColor="#3b82f6" strokeWidth="5" animationDuration="0.75" width="16" visible={true} />
                ) : (
                    <FaFilePdf size={16} />
                )}
            </button>
        </div>
    );
});

export default PDFButton;