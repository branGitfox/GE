import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { FaTruck } from 'react-icons/fa';

import Pagination from './Pagination';

const ProduitHistoriqueModal = ({ produit, onClose }) => {
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    if (!produit) return;
    setLoading(true);
    axios.get(`${API_URL}/api/produit-achat?produit_id=${produit.id}`)
      .then(res => {
        setHistorique(res.data);
        setCurrentPage(1);
      })
      .catch(err => setError('Erreur lors du chargement de l\'historique'))
      .finally(() => setLoading(false));
  }, [produit]);

  if (!produit) return null;

  const totalPages = Math.ceil(historique.length / itemsPerPage);
  const currentHistorique = historique.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl">&times;</button>
        <h2 className="text-xl font-bold mb-4">Historique du produit : {produit.nom}</h2>
        {loading ? (
          <div>Chargement...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : historique.length === 0 ? (
          <div>Aucun historique trouvé.</div>
        ) : (
          <>
            <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {currentHistorique.map((h, idx) => {
                const fullIdx = (currentPage - 1) * itemsPerPage + idx;
                const prev = historique[fullIdx + 1];
                const priceChanged = prev && parseFloat(h.prix_achat) !== parseFloat(prev.prix_achat);

                return (
                  <li key={h.id || idx} className="py-3 flex justify-between items-center text-sm border-b last:border-0 border-gray-100 hover:bg-gray-50 px-2 rounded">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{h.description || 'Mouvement'}</span>
                        {h.fournisseur_nom && (
                          <span className="flex items-center gap-1 text-[10px] text-blue-500 font-medium bg-blue-50 px-1 rounded">
                            <FaTruck size={10} /> {h.fournisseur_nom}
                          </span>
                        )}
                        {h.is_vente && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase">Vente</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{new Date(h.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`font-bold px-3 py-1 rounded-full text-xs ${h.quantite > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {h.quantite > 0 ? '+' : ''}{h.quantite} {h.unite === 'Gros' ? (produit.nom_unite_gros || 'Gros') : (h.unite || '')}
                      </div>
                      {h.prix_achat > 0 && !h.is_vente && (
                        <span className={`text-[10px] mt-1 px-1 rounded font-bold ${priceChanged ? 'text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200' : 'text-gray-500'}`}>
                          @ {parseFloat(h.prix_achat).toLocaleString()} Ar
                          {priceChanged && <span className="ml-1 italic text-[8px]">Novo</span>}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={historique.length}
                onPageChange={setCurrentPage}
                itemLabel="mouvements"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProduitHistoriqueModal;
