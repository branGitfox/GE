import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import {
    FiDollarSign, FiBox, FiFileText, FiPackage, FiShoppingCart,
    FiCheckCircle, FiXCircle, FiRefreshCw, FiChevronLeft, FiChevronRight,
    FiCalendar, FiRotateCcw, FiTag, FiTrendingUp, FiInfo
} from 'react-icons/fi';
import PeriodDetailModal from '../components/dashboard/PeriodDetailModal';
import {
    BarChart, Bar, PieChart, Pie, AreaChart, Area, ComposedChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const ITEMS_PER_PAGE = 10;

const DashboardHome = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [startDate, setStartDate] = useState(() => {
        return `${new Date().getFullYear()}-01-01`;
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toLocaleDateString('en-CA');
    });
    const [activePeriod, setActivePeriod] = useState('year');

    const handlePeriodChange = (period) => {
        const now = new Date();
        let start = '';
        let end = now.toLocaleDateString('en-CA');
        
        if (period === 'today') {
            start = end;
        } else if (period === 'week') {
            const startOfWeek = new Date(now);
            const day = startOfWeek.getDay() || 7;
            if (day !== 1) startOfWeek.setHours(-24 * (day - 1));
            start = startOfWeek.toLocaleDateString('en-CA');
        } else if (period === 'month') {
            start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        } else if (period === 'year') {
            start = `${now.getFullYear()}-01-01`;
        }
        
        setStartDate(start);
        setEndDate(end);
        setActivePeriod(period);
        if (period === 'year') {
            setSelectedYear(now.getFullYear());
        }
    };

    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalPaid: 0,
        totalUnpaid: 0,
        revenueToday: 0,
        revenueWeek: 0,
        revenueMonth: 0,
        revenueYear: 0,
        revenueSelectedYear: 0,
        revenueSelectedRange: 0,
        paidSelectedRange: 0,
        unpaidSelectedRange: 0,
        paidToday: 0,
        paidWeek: 0,
        paidMonth: 0,
        totalProductsSold: 0,
        totalRemise: 0,
    });

    const [totalDepenses, setTotalDepenses] = useState(0);
    const [totalAchats, setTotalAchats] = useState(0);
    const [diverseDepenses, setDiverseDepenses] = useState([]);
    const [produitAchats, setProduitAchats] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);
    const [soldProducts, setSoldProducts] = useState([]);
    const [topSuppliers, setTopSuppliers] = useState([]);
    const [financialData, setFinancialData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination states
    const [soldPage, setSoldPage] = useState(1);
    const [depensePage, setDepensePage] = useState(1);
    const [productPage, setProductPage] = useState(1);

    // Search states
    const [soldSearch, setSoldSearch] = useState('');
    const [depenseSearch, setDepenseSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    
    // Years state
    const [availableYears, setAvailableYears] = useState([new Date().getFullYear()]);

    // Modal state for detailed periods
    const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalRange, setModalRange] = useState({ startDate: '', endDate: '' });

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                year: selectedYear,
                startDate,
                endDate
            };

            const [statsRes, soldRes, financialRes, productsRes, depensesRes, achatsRes, topSuppliersRes] = await Promise.all([
                axios.get(`${API_URL}/api/factures/stats`, { params }),
                axios.get(`${API_URL}/api/factures/sold-products`, { params }),
                axios.get(`${API_URL}/api/factures/financial-stats`, { params }),
                axios.get(`${API_URL}/api/produits/recent`),
                axios.get(`${API_URL}/api/depenses`, { params }),
                axios.get(`${API_URL}/api/produit-achat/stats`, { params }),
                axios.get(`${API_URL}/api/factures/top-suppliers`, { params })
            ]);

            setStats(statsRes.data);
            setSoldProducts(soldRes.data);
            setFinancialData(financialRes.data);
            setRecentProducts(productsRes.data);
            setTopSuppliers(topSuppliersRes.data);

            const dData = depensesRes.data;
            setDiverseDepenses(dData);
            setTotalDepenses(dData.reduce((acc, d) => acc + parseFloat(d.montant || 0), 0));

            const aData = achatsRes.data;
            setProduitAchats(aData);
            setTotalAchats(aData.reduce((acc, a) => acc + parseFloat(a.total_cout || 0), 0));

            // Reset pagination and search when data changes
            setSoldPage(1);
            setDepensePage(1);
            setProductPage(1);
            setSoldSearch('');
            setDepenseSearch('');
            setProductSearch('');
        } catch (err) {
            console.error("Erreur dashboard:", err);
            setError('Impossible de charger les données.');
        } finally {
            setLoading(false);
        }
    };

    const fetchYears = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/factures/years`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setAvailableYears(res.data);
            if (res.data.length > 0 && !res.data.includes(selectedYear)) {
                setSelectedYear(res.data[0]);
            }
        } catch (err) {
            console.error("Erreur fetch years:", err);
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/export/excel`, {
                responseType: 'blob',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const fileName = `Rapport_Complet_GE_${new Date().toISOString().split('T')[0]}.xlsx`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Erreur export:", err);
            alert("Erreur lors de l'exportation Excel");
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [selectedYear, startDate, endDate]);

    useEffect(() => {
        fetchYears();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR').format(amount || 0) + " Fmg";
    };

    const COLORS = [
        '#6366f1', // Indigo
        '#22c55e', // green
        '#f59e0b', // amber
        '#f43f5e', // rose
        '#8b5cf6', // violet
        '#0ea5e9', // sky
        '#ec4899'  // pink
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1e222d]/95 backdrop-blur-md p-4 border border-gray-700/50 shadow-2xl rounded-2xl text-gray-200">
                    <p className="text-xs font-bold text-gray-400 mb-3 border-b border-gray-700/50 pb-2 flex items-center gap-2">
                        <FiCalendar className="text-indigo-400" /> {label}
                    </p>
                    <div className="space-y-2">
                        {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{entry.name}</span>
                                </div>
                                <span className="text-xs font-black" style={{ color: entry.color }}>
                                    {parseFloat(entry.value).toLocaleString('fr-FR')} Fmg
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Pagination helpers
    const paginate = (items, page) => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return items.slice(start, start + ITEMS_PER_PAGE);
    };

    const totalPages = (items) => Math.ceil(items.length / ITEMS_PER_PAGE);

    // Filtering logic
    const filteredSoldProducts = soldProducts.filter(p =>
        p.nom.toLowerCase().includes(soldSearch.toLowerCase())
    );

    const filteredDiverseDepenses = diverseDepenses.filter(d =>
        d.nom.toLowerCase().includes(depenseSearch.toLowerCase())
    );

    const filteredRecentProducts = recentProducts.filter(p =>
        p.nom.toLowerCase().includes(productSearch.toLowerCase())
    );

    const renderPagination = (currentPage, total, setPage) => {
        if (total <= 1) return null;
        return (
            <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <FiChevronLeft size={18} />
                </button>
                <span className="text-xs font-medium text-gray-600">
                    Page {currentPage} sur {total}
                </span>
                <button
                    onClick={() => setPage(p => Math.min(total, p + 1))}
                    disabled={currentPage === total}
                    className={`p-2 rounded-lg transition-colors ${currentPage === total
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <FiChevronRight size={18} />
                </button>
            </div>
        );
    };

    const renderSearchInput = (value, onChange, placeholder) => (
        <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFileText className="text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    // Reset to page 1 on search
                    if (onChange === setSoldSearch) setSoldPage(1);
                    if (onChange === setDepenseSearch) setDepensePage(1);
                    if (onChange === setProductSearch) setProductPage(1);
                }}
            />
        </div>
    );

    const totalActualBenefice = soldProducts.reduce((acc, p) => acc + (p.totalBenefice || 0), 0);

    const openPeriodModal = (type) => {
        const now = new Date();
        let start = '';
        let end = new Date().toLocaleDateString('en-CA');
        let title = '';

        if (type === 'today') {
            start = end;
            title = "Aujourd'hui";
        } else if (type === 'week') {
            const startOfWeek = new Date(now);
            const day = startOfWeek.getDay() || 7;
            if (day !== 1) startOfWeek.setHours(-24 * (day - 1));
            start = startOfWeek.toLocaleDateString('en-CA');
            title = "Cette Semaine";
        } else if (type === 'month') {
            start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
            title = "Ce Mois";
        } else if (type === 'year') {
            start = `${now.getFullYear()}-01-01`;
            title = "Cette Année";
        }

        setModalRange({ startDate: start, endDate: end });
        setModalTitle(title);
        setIsPeriodModalOpen(true);
    };

    if (loading && !stats.totalRevenue) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="font-sans">
            {/* Header avec Filtres */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tableau de Bord</h1>
                    <p className="text-gray-500 mt-1">Aperçu analytique de votre activité commerciale</p>
                </div>

                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center gap-4">
                    {/* Sélecteur Rapide */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {[
                            { id: 'today', label: 'Aujourd\'hui' },
                            { id: 'week', label: 'Semaine' },
                            { id: 'month', label: 'Mois' },
                            { id: 'year', label: 'Année' }
                        ].map((p) => (
                            <button
                                key={p.id}
                                onClick={() => handlePeriodChange(p.id)}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                                    activePeriod === p.id 
                                    ? 'bg-white text-indigo-600 shadow-sm shadow-indigo-100' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dates :</label>
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setActivePeriod('custom');
                                }}
                                className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer"
                            />
                            <span className="text-gray-400 font-bold">→</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setActivePeriod('custom');
                                }}
                                className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Année :</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => {
                                const year = parseInt(e.target.value);
                                setSelectedYear(year);
                                setStartDate(`${year}-01-01`);
                                setEndDate(`${year}-12-31`);
                                setActivePeriod('year');
                            }}
                            className="bg-gray-50 border-none rounded-lg text-sm font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-200 cursor-pointer py-1.5 pl-3 pr-8"
                        >
                            {availableYears.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 font-black text-[10px] uppercase tracking-widest"
                        title="Exporter vers Excel"
                    >
                        <FiFileText className="text-sm" />
                        Exporter Excel
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: "Aujourd'hui", value: stats.revenueToday, color: 'indigo', icon: <FiFileText />, type: 'today' },
                    { label: "Cette Semaine", value: stats.revenueWeek, color: 'blue', icon: <FiFileText />, type: 'week' },
                    { label: "Ce Mois", value: stats.revenueMonth, color: 'purple', icon: <FiFileText />, type: 'month' },
                    { label: "Cette Année", value: stats.revenueYear, color: 'emerald', icon: <FiFileText />, type: 'year' },
                ].map((card, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col transform transition-transform hover:scale-[1.02] relative group">
                        <div className="flex items-center">
                            <div className={`p-3 bg-${card.color}-50 rounded-full mr-4`}>
                                {React.cloneElement(card.icon, { className: `text-${card.color}-600 text-xl` })}
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{card.label}</p>
                                <h3 className={`text-xl font-black text-${card.color}-700`}>{formatCurrency(card.value)}</h3>
                            </div>
                            <button 
                                onClick={() => openPeriodModal(card.type)}
                                className="p-2 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="Voir détails"
                            >
                                <FiInfo size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cartes globales - Rangée 1: Balances */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-200 flex flex-col justify-center transform transition-transform hover:scale-[1.02] border-l-4 border-l-indigo-600">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Période Sélectionnée</p>
                    <h3 className="text-xl font-black text-gray-900">{formatCurrency(stats.revenueSelectedRange)}</h3>
                    <div className="flex gap-4 mt-2 pt-2 border-t border-gray-50">
                        <div>
                            <p className="text-[9px] text-gray-400 uppercase font-bold">Payé</p>
                            <p className="text-xs font-black text-emerald-600">{formatCurrency(stats.paidSelectedRange)}</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-400 uppercase font-bold">Reste</p>
                            <p className="text-xs font-black text-rose-600">{formatCurrency(stats.unpaidSelectedRange)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transform transition-transform hover:scale-[1.02]">
                    <div className="p-4 bg-emerald-50 rounded-xl mr-4">
                        <FiCheckCircle className="text-emerald-600 text-2xl" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payé (Global)</p>
                        <h2 className="text-2xl font-black text-emerald-700">{formatCurrency(stats.totalPaid)}</h2>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transform transition-transform hover:scale-[1.02]">
                    <div className="p-4 bg-rose-50 rounded-xl mr-4">
                        <FiXCircle className="text-rose-600 text-2xl" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reste (Global)</p>
                        <h2 className="text-2xl font-black text-rose-700">{formatCurrency(stats.totalUnpaid)}</h2>
                    </div>
                </div>
            </div>

            {/* Cartes globales - Rangée 2: Analyse */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex items-center transform transition-transform hover:scale-[1.02]">
                    <div className="p-4 bg-orange-50 rounded-xl mr-4">
                        <FiTag className="text-orange-600 text-2xl" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Remises</p>
                        <h2 className="text-2xl font-black text-orange-700">{formatCurrency(stats.totalRemise)}</h2>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 flex items-center transform transition-transform hover:scale-[1.02]">
                    <div className="p-4 bg-emerald-50 rounded-xl mr-4">
                        <FiTrendingUp className="text-emerald-600 text-2xl" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Marge Brute (Ventes)</p>
                        <h2 className="text-2xl font-black text-emerald-700">{formatCurrency(totalActualBenefice)}</h2>
                        <p className="text-[10px] text-gray-400 italic mt-0.5">Marge théorique sur produits vendus</p>
                    </div>
                </div>

                <div className="bg-gray-900 p-6 rounded-xl shadow-xl text-white transform hover:scale-[1.02] transition-all flex flex-col justify-center">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Bénéfice Net (Encaissé — Dépenses)</p>
                    <h2 className={`text-2xl font-black ${stats.totalPaid - (totalDepenses + totalAchats) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(stats.totalPaid - (totalDepenses + totalAchats))}
                    </h2>
                    <div className="flex gap-3 mt-2 text-[10px] text-gray-400">
                        <span>💵 Encaissé : {formatCurrency(stats.totalPaid)}</span>
                        <span>📉 Dépenses : {formatCurrency(totalDepenses + totalAchats)}</span>
                    </div>
                </div>
            </div>

            {/* Graphique Évolution Financière (Trading Style) */}
            <div className="bg-[#131722] p-6 rounded-xl shadow-2xl border border-gray-800 mb-8 overflow-hidden relative">
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-gray-100 flex items-center tracking-wide">
                        <FiTrendingUp className="text-[#2ebd85] mr-3" />
                        Évolution Financière Mensuelle
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <span className="flex items-center"><span className="w-2 h-2 rounded-sm bg-[#2ebd85] mr-2"></span> Rev. Brut</span>
                        <span className="flex items-center"><span className="w-2 h-2 rounded-sm bg-[#00b4d8] mr-2"></span> Payé</span>
                        <span className="flex items-center"><span className="w-2 h-2 rounded-sm bg-[#e0294a] mr-2"></span> Dépenses (Vol)</span>
                        <span className="flex items-center"><span className="w-2 h-2 rounded-sm bg-[#f7a600] mr-2"></span> Bénéfice</span>
                    </div>
                </div>
                <div className="h-96 w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={financialData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                            <defs>
                                <linearGradient id="colorRevenueTrading" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2ebd85" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#2ebd85" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#00b4d8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2B3139" />
                            <XAxis dataKey="name" axisLine={{ stroke: '#2B3139' }} tickLine={false} tick={{ fontSize: 11, fill: '#848E9C', fontWeight: 600 }} dy={10} />
                            <YAxis axisLine={{ stroke: '#2B3139' }} tickLine={false} tick={{ fontSize: 11, fill: '#848E9C', fontWeight: 600 }} tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`} dx={-10} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#848E9C', strokeWidth: 1, strokeDasharray: '3 3' }} />
                            
                            {/* Dépenses in background like Volume bars in trading */}
                            <Bar dataKey="expenses" name="Dépenses" fill="#e0294a" opacity={0.4} barSize={24} radius={[4, 4, 0, 0]} />
                            
                            {/* Revenue as an area (like price graph) */}
                            <Area type="monotone" dataKey="revenue" name="Rev. Brut" stroke="#2ebd85" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueTrading)" activeDot={{ r: 6, fill: '#2ebd85', stroke: '#131722', strokeWidth: 2 }} />
                            
                            {/* Paid as an area too but subtle */}
                            <Area type="monotone" dataKey="paid" name="Montant Payé" stroke="#00b4d8" strokeWidth={2} fillOpacity={1} fill="url(#colorPaid)" dot={false} activeDot={{ r: 5, fill: '#00b4d8', stroke: '#131722', strokeWidth: 2 }} />
                            
                            {/* Profit as a distinctive line */}
                            <Line type="monotone" dataKey="profit" name="Bénéfice" stroke="#f7a600" strokeWidth={3} dot={{ r: 3, fill: '#f7a600', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#f7a600', stroke: '#131722', strokeWidth: 2 }} shadow="0 4px 6px rgba(0,0,0,0.3)" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Section Produits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <FiBox className="text-purple-600 mr-2" />
                        Répartition des Ventes (Top 5)
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={soldProducts.slice(0, 5)}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    innerRadius={70}
                                    stroke="none"
                                    dataKey="quantite"
                                    nameKey="nom"
                                    paddingAngle={8}
                                >
                                    {soldProducts.slice(0, 5).map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]}
                                            style={{ filter: `drop-shadow(0px 4px 10px ${COLORS[index % COLORS.length]}44)` }} 
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white/90 backdrop-blur-md p-3 border border-gray-100 shadow-2xl rounded-2xl">
                                                <p className="text-[10px] uppercase font-black text-gray-400 mb-1">{payload[0].name}</p>
                                                <p className="text-sm text-indigo-600 font-black">
                                                    {payload[0].value.toLocaleString()} {payload[0].payload.unité}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }} />
                                <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '30px', color: '#64748b' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Section Fournisseurs & Produits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Top Fournisseurs */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <FiTag className="text-orange-600 mr-2" />
                        Top Fournisseurs (par volume de vente)
                    </h3>
                    <div className="overflow-x-auto scrollbar-hide">
                        {topSuppliers.length > 0 ? (
                            <table className="w-full text-xs">
                                <thead className="border-b border-gray-800/10">
                                    <tr>
                                        <th className="text-left py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fournisseur</th>
                                        <th className="text-right py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Articles</th>
                                        <th className="text-right py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">CA (Fmg)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/5">
                                    {topSuppliers.map((sup, index) => (
                                        <tr key={index} className="group hover:bg-orange-50/30 transition-colors">
                                            <td className="py-4">
                                                <p className="text-xs font-bold text-gray-800 group-hover:text-orange-600 transition-colors">{sup.fournisseur_nom}</p>
                                                <p className="text-[10px] text-gray-400 italic">{sup.best_product_name}</p>
                                            </td>
                                            <td className="py-4 text-right">
                                                <span className="bg-orange-100 text-orange-700 py-1 px-2 rounded-lg font-black text-[10px]">{sup.total_items}</span>
                                            </td>
                                            <td className="py-4 text-right font-black text-xs text-orange-600">{(sup.revenue || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="py-12 text-center text-gray-400 font-bold italic">
                                Aucun fournisseur identifié sur cette période
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <FiShoppingCart className="text-indigo-600 mr-2" />
                        Détails des Produits Vendus
                    </h3>

                    {renderSearchInput(soldSearch, setSoldSearch, "Chercher un produit...")}

                    <div className="overflow-x-auto">
                        {filteredSoldProducts.length > 0 ? (
                            <>
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="text-left py-4 px-3 text-gray-500 font-bold uppercase tracking-widest">Produit</th>
                                            <th className="text-right py-4 px-3 text-gray-500 font-bold uppercase tracking-widest">Vendus</th>
                                            <th className="text-right py-4 px-3 text-gray-500 font-bold uppercase tracking-widest">CA (Fmg)</th>
                                            <th className="text-right py-4 px-3 text-gray-500 font-bold uppercase tracking-widest">Bénéfice (Fmg)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginate(filteredSoldProducts, soldPage).map((product, index) => {
                                            const benefice = product.totalBenefice || 0;
                                            return (
                                                <tr key={index} className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors">
                                                    <td className="py-4 px-3 text-gray-900 font-bold">{product.nom}</td>
                                                    <td className="py-4 px-3 text-right">
                                                        <span className="bg-indigo-100 text-indigo-700 py-1 px-2 rounded-lg font-black capitalize">
                                                            {product.quantite} {product.unité}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-3 text-right font-black text-indigo-600">{product.totalRevenue.toLocaleString()}</td>
                                                    <td className="py-4 px-3 text-right font-black" style={{ color: benefice >= 0 ? '#10B981' : '#EF4444' }}>
                                                        {benefice >= 0 ? '+' : ''}{benefice.toLocaleString('fr-FR')}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {renderPagination(soldPage, totalPages(filteredSoldProducts), setSoldPage)}
                            </>
                        ) : (
                            <div className="py-12 text-center">
                                <FiBox className="mx-auto text-4xl text-gray-200 mb-2" />
                                <p className="text-gray-400 font-bold italic">Aucun résultat trouvé</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dépenses Recap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 flex items-center hover:shadow-md transition-all">
                    <div className="p-4 bg-indigo-50 rounded-2xl mr-4">
                        <FiFileText className="text-indigo-600 text-2xl" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase">Dépenses Diverses</p>
                        <h2 className="text-2xl font-black text-indigo-700">{formatCurrency(totalDepenses)}</h2>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center hover:shadow-md transition-all">
                    <div className="p-4 bg-orange-50 rounded-2xl mr-4">
                        <FiShoppingCart className="text-orange-600 text-2xl" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase">Achats (Stock)</p>
                        <h2 className="text-2xl font-black text-orange-700">{formatCurrency(totalAchats)}</h2>
                    </div>
                </div>
            </div>

            {/* Listes détaillées */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <FiDollarSign className="text-green-600 mr-2" />
                        Dépenses Diverses Récentes
                    </h3>

                    {renderSearchInput(depenseSearch, setDepenseSearch, "Chercher une dépense...")}

                    <div className="overflow-x-auto">
                        {filteredDiverseDepenses.length > 0 ? (
                            <>
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-widest text-[10px]">
                                            <th className="text-left py-4 font-bold">Date</th>
                                            <th className="text-left py-4 font-bold">Désignation</th>
                                            <th className="text-right py-4 font-bold">Montant</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginate(filteredDiverseDepenses, depensePage).map((d) => (
                                            <tr key={d.id} className="border-b border-gray-50 hover:bg-rose-50/30 transition-colors">
                                                <td className="py-4 text-gray-400 font-bold">{new Date(d.date).toLocaleDateString()}</td>
                                                <td className="py-4 text-gray-900 font-black">{d.nom}</td>
                                                <td className="py-4 text-right text-rose-600 font-black">{parseFloat(d.montant).toLocaleString()} Fmg</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {renderPagination(depensePage, totalPages(filteredDiverseDepenses), setDepensePage)}
                            </>
                        ) : (
                            <div className="py-12 text-center text-gray-400 font-bold italic">
                                Aucun résultat trouvé
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <FiPackage className="text-indigo-600 mr-2" />
                        Produits Récents en Stock
                    </h3>

                    {renderSearchInput(productSearch, setProductSearch, "Chercher un produit...")}

                    <div className="overflow-x-auto">
                        {filteredRecentProducts.length > 0 ? (
                            <>
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-widest text-[10px]">
                                            <th className="text-left py-4 font-bold">Désignation</th>
                                            <th className="text-right py-4 font-bold">Stock</th>
                                            <th className="text-right py-4 font-bold">Prix Vente</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginate(filteredRecentProducts, productPage).map((p) => {
                                            const isCartonActive = p.pieces_par_carton > 1;
                                            // Priorité : unite depuis produit_achat → nom_unite_gros → unité
                                            const unite_gros = p.unite_achat || p.nom_unite_gros || 'Unité';
                                            const unite_detail = p['unité'] || 'Pièce';
                                            const stockStr = isCartonActive
                                                ? `${Math.floor(p.quantite / p.pieces_par_carton)} ${unite_gros}${p.quantite % p.pieces_par_carton > 0 ? `, ${(p.quantite % p.pieces_par_carton).toString().replace('.', ',')} ${unite_detail}` : ''}`
                                                : `${p.quantite.toString().replace('.', ',')} ${unite_gros}`;

                                            return (
                                                <tr key={p.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                                                    <td className="py-4 text-gray-900 font-black">{p.nom}</td>
                                                    <td className="py-4 text-right">
                                                        <span className={`py-1 px-2 rounded-lg font-black ${p.quantite < 10 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                                            {stockStr}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right text-blue-600 font-black">
                                                        {parseFloat(p.prix_carton || p.prix).toLocaleString()} Fmg / {unite_gros}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {renderPagination(productPage, totalPages(filteredRecentProducts), setProductPage)}
                            </>
                        ) : (
                            <div className="py-12 text-center text-gray-400 font-bold italic">
                                Aucun résultat trouvé
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <PeriodDetailModal 
                isOpen={isPeriodModalOpen} 
                onClose={() => setIsPeriodModalOpen(false)} 
                initialRange={modalRange} 
                title={modalTitle} 
            />
        </div>
    );
};

export default DashboardHome;