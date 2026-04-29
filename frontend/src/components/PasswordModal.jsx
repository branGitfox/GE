import React, { useState, useEffect } from 'react';
import { FaLock, FaTimes, FaCheck } from 'react-icons/fa';

const PasswordModal = ({ isOpen, onClose, onConfirm, title = "Autorisation Requise", message = "Veuillez saisir le mot de passe pour modifier les prix." }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(password);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center text-blue-600">
            <FaLock className="text-xl mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-8">
            <p className="text-gray-600 text-center mb-6">{message}</p>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest transition-all ${
                error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
              }`}
              placeholder="••••••••"
              required
            />
            {error && (
              <p className="text-red-500 text-sm text-center mt-2 font-medium">Mot de passe incorrect</p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"
            >
              <FaCheck className="mr-2" /> Valider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
