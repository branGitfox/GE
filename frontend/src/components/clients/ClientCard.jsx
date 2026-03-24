import React from 'react';
import { FaEdit, FaTrash, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const ClientCard = ({ client, handleEdit, handleDelete, isLoading }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-gray-800 flex items-center">
            <FaUser className="mr-2 text-blue-500" />
            {client.nom}
          </h3>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-2 text-gray-400" />
              {client.adresse}
            </div>
            <div className="flex items-center">
              <FaPhone className="mr-2 text-gray-400" />
              {client.telephone}
            </div>
            <div className="flex items-center">
              <FaEnvelope className="mr-2 text-gray-400" />
              {client.email}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(client)}
            className="p-2 text-blue-600 hover:text-blue-900 rounded-full hover:bg-blue-50 transition"
            title="Modifier"
            disabled={isLoading}
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => handleDelete(client.id)}
            className="p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50 transition"
            title="Supprimer"
            disabled={isLoading}
          >
            <FaTrash size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;