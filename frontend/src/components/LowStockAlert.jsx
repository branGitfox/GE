// components/LowStockAlert.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { FaExclamationTriangle } from 'react-icons/fa';
import { io } from 'socket.io-client';

const LowStockAlert = () => {
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // 1. Récupération initiale
        const fetchLowStockProducts = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/produits`);
                if (response.data) {
                    setLowStockProducts(response.data.filter(p => {
                        const threshold = p.stock_threshold !== undefined ? p.stock_threshold : 3;
                        const cartons = p.pieces_par_carton ? p.quantite / p.pieces_par_carton : p.quantite;
                        return cartons <= threshold;
                    }));
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des produits:', error);
            }
        };

        fetchLowStockProducts();

        // 2. Connexion WebSocket pour les mises à jour en temps réel
        const socket = io(API_URL);

        socket.on('produit-updated', (updatedProduct) => {
            setLowStockProducts(prev => {
                const existingIndex = prev.findIndex(p => p.id === updatedProduct.id);

                const threshold = updatedProduct.stock_threshold !== undefined ? updatedProduct.stock_threshold : 3;
                const cartons = updatedProduct.pieces_par_carton ? updatedProduct.quantite / updatedProduct.pieces_par_carton : updatedProduct.quantite;
                if (cartons > threshold) {
                    if (existingIndex >= 0) {
                        return prev.filter(p => p.id !== updatedProduct.id);
                    }
                    return prev;
                }

                // Si le produit est nouveau ou modifié
                if (existingIndex >= 0) {
                    const newList = [...prev];
                    newList[existingIndex] = updatedProduct;
                    return newList;
                } else {
                    return [...prev, updatedProduct];
                }
            });
        });

        // 3. Vérification périodique au cas où (toutes les 30 secondes)
        const interval = setInterval(fetchLowStockProducts, 10000);

        return () => {
            clearInterval(interval);
            socket.disconnect();
        };
    }, []);

    if (lowStockProducts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className={`bg-yellow-100 border-2 border-yellow-400 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${isExpanded ? 'w-64' : 'w-12 h-12'}`}>
                <div
                    className="flex items-center justify-center p-2 bg-yellow-400 cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <FaExclamationTriangle className="text-yellow-800 text-xl" />
                    {isExpanded && (
                        <span className="ml-2 font-bold text-yellow-800">
                            Stock faible ({lowStockProducts.length})
                        </span>
                    )}
                </div>

                {isExpanded && (
                    <div className="p-2 max-h-64 overflow-y-auto">
                        <ul className="divide-y divide-yellow-200">
                            {lowStockProducts.map((product) => (
                                <li key={product.id} className="py-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-sm truncate">{product.nom}</span>
                                        <span className="bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
                                            {product.pieces_par_carton && product.pieces_par_carton > 1
                                                ? `${(product.quantite / product.pieces_par_carton).toFixed(1).replace(/\.0$/, "").replace('.', ',')} ${product.nom_unite_gros || 'carton'}(s)`
                                                : `${product.quantite.toString().replace('.', ',')} ${product.unité || 'pièce(s)'}`
                                            }
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LowStockAlert;