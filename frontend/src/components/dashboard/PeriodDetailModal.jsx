import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiFilter, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import { API_URL } from '../../config';

const PeriodDetailModal = ({ isOpen, onClose, initialRange, title }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(initialRange.startDate || '');
    const [endDate, setEndDate] = useState(initialRange.endDate || '');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRevenue, setTotalRevenue] = useState(0);

    // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/factures`, {
                params: {
                    startDate,
                    endDate,
                    page,
                    limit: 10,
                    status: 'facture'
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Note: Assuming the backend returns { factures, totalPages, totalRevenueSelected }
            // If not, we might need to adjust or make a second call
            setInvoices(response.data.factures || []);
            setTotalPages(response.data.totalPages || 1);
            setTotalRevenue(response.data.totalRevenueSelected || 0);
        } catch (error) {
            console.error("Error fetching detailed invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            // Synchronisation immédiate des dates à l'ouverture pour éviter l'appel sans filtre
            const syncAndFetch = async () => {
                const start = initialRange.startDate || '';
                const end = initialRange.endDate || '';
                setStartDate(start);
                setEndDate(end);
                setPage(1);
                
                // On passe directement les valeurs synchronisées à fetchInvoices si nécessaire
                // Mais l'effet ci-dessous s'en chargera aussi au prochain render.
                // Pour être sûr à 100%, on attend que les states soient mis à jour ou on fetch ici.
            };
            syncAndFetch();
        }
    }, [isOpen, initialRange]);

    useEffect(() => {
        // Ne fetcher que si on a des dates (si c'est un mode filtré) ou si isOpen vient de changer
        if (isOpen && startDate !== undefined && endDate !== undefined) {
             fetchInvoices();
        }
    }, [isOpen, page, startDate, endDate]);

    if (!isOpen) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR').format(amount || 0) + " Fmg";
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            <FiCalendar className="text-indigo-600" />
                            Détails : {title}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">Visualisation des transactions pour la période sélectionnée</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <FiX size={24} />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 bg-white border-b border-gray-100 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <FiFilter className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Filtres</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                            className="bg-transparent text-sm font-semibold outline-none text-gray-700" 
                        />
                        <span className="text-gray-300 font-bold">→</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                            className="bg-transparent text-sm font-semibold outline-none text-gray-700" 
                        />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Total Période:</span>
                        <span className="text-lg font-black text-indigo-700">{formatCurrency(totalRevenue)}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : invoices.length > 0 ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 italic">
                                    <th className="pb-3 px-2 text-center">N° Facture</th>
                                    <th className="pb-3 px-2">Date</th>
                                    <th className="pb-3 px-2">Client</th>
                                    <th className="pb-3 px-2 text-right">Montant</th>
                                    <th className="pb-3 px-2 text-center">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-2 text-center font-black text-xs text-indigo-600">#{inv.numero_facture}</td>
                                        <td className="py-3 px-2 text-xs font-bold text-gray-600">{new Date(inv.date_facture).toLocaleDateString('fr-FR')}</td>
                                        <td className="py-3 px-2 text-xs font-medium text-gray-700">{inv.client_nom || 'Client Passage'}</td>
                                        <td className="py-3 px-2 text-xs font-black text-gray-900 text-right">{formatCurrency(inv.prix_total)}</td>
                                        <td className="py-3 px-2 text-center">
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${
                                                inv.paiement >= inv.prix_total ? 'bg-emerald-100 text-emerald-700' : 
                                                inv.paiement > 0 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {inv.paiement >= inv.prix_total ? 'Payé' : inv.paiement > 0 ? 'Avance' : 'Non Payé'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400 italic">
                            <FiCalendar size={48} className="mb-4 opacity-20" />
                            <p>Aucune transaction trouvée pour cette période</p>
                        </div>
                    )}
                </div>

                {/* Footer / Pagination */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400">Page {page} sur {totalPages}</span>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 1} 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className={`p-2 rounded-lg border transition-all ${page === 1 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-indigo-50 hover:border-indigo-200'}`}
                        >
                            <FiChevronLeft />
                        </button>
                        <button 
                            disabled={page === totalPages} 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className={`p-2 rounded-lg border transition-all ${page === totalPages ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-indigo-50 hover:border-indigo-200'}`}
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PeriodDetailModal;
