import React from 'react';
import { FaExclamationTriangle, FaTrash, FaTimes } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      ></div>

      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 animate-fade-in-up transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center text-red-600">
            <FaExclamationTriangle className="text-xl mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
          <button 
            onClick={!isLoading ? onClose : undefined}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
            disabled={isLoading}
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <p className="text-gray-600 text-center text-base">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <ClipLoader size={16} color="#ffffff" className="mr-2" />
            ) : (
              <FaTrash className="mr-2" size={14} />
            )}
            {isLoading ? 'Suppression...' : 'Oui, supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
