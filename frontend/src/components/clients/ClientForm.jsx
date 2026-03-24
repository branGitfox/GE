import React, { useEffect, useState } from 'react';
import {
  FaSave,
  FaTimes,
  FaPlus,
  FaCheck,
  FaExclamationTriangle,
  FaUser,
  FaHome,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

const ClientForm = ({
  formData,
  editingClient,
  isLoading,
  message,
  success,
  handleChange,
  handleSubmit,
  handleCancel,
  formRef
}) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSuccess, setToastSuccess] = useState(false);

  useEffect(() => {
    if (message) {
      setToastMessage(message);
      setToastSuccess(success);
      setShowToast(true);

      const timer = setTimeout(() => {
        setShowToast(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [message, success]);

  return (
    <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-3xl mx-auto relative">
      <form onSubmit={handleSubmit} ref={formRef}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">
            {editingClient ? 'Modifier Client' : 'Ajouter un Nouveau Client'}
          </h2>
          {editingClient && (
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <FaTimes className="inline mr-1" /> Annuler
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaUser className="mr-2" /> Nom Complet
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                type="text"
                name="nom"
                placeholder="Nom complet du client"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaHome className="mr-2" /> Adresse
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaHome className="text-gray-400" />
              </div>
              <input
                type="text"
                name="adresse"
                placeholder="Adresse complète"
                value={formData.adresse}
                onChange={handleChange}
                required
                className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaPhone className="mr-2" /> Téléphone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="telephone"
                  placeholder="Numéro de téléphone"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaEnvelope className="mr-2" /> Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Adresse email (Optionnel)"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium flex items-center"
            disabled={isLoading}
          >
            <FaTimes className="mr-2" /> Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition font-medium flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <ClipLoader size={18} color="#ffffff" className="mr-2" />
            ) : (
              <>
                {editingClient ? (
                  <FaSave className="mr-2" />
                ) : (
                  <FaPlus className="mr-2" />
                )}
                {editingClient ? 'Enregistrer' : 'Ajouter'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Notification Toast */}
      {showToast && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className={`animate-fade-in-up p-4 rounded-lg shadow-lg flex items-center ${toastSuccess ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
            } max-w-md`}>
            {toastSuccess ? (
              <FaCheck className="mr-2" />
            ) : (
              <FaExclamationTriangle className="mr-2" />
            )}
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientForm;