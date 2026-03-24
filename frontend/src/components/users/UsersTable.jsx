import React from 'react';
import { FaCheck, FaTimes, FaEdit, FaTrash, FaUserSlash } from 'react-icons/fa';

const UsersTable = ({ 
  users, 
  editingUser, 
  editForm, 
  handleInputChange, 
  handleSaveEdit, 
  handleCancelEdit, 
  handleValidate, 
  handleInvalidate, 
  handleDelete, 
  handleEdit,
  isPendingTable = false 
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
            {!isPendingTable && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            )}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-gray-50">
              {editingUser === user.id ? (
                <>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      name="nom"
                      value={editForm.nom}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      name="prenom"
                      value={editForm.prenom}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      name="role"
                      value={editForm.role}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td colSpan={isPendingTable ? 1 : 2} className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleSaveEdit(user.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
                      >
                        <FaCheck className="mr-1" /> Enregistrer
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition flex items-center"
                      >
                        <FaTimes className="mr-1" /> Annuler
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.prenom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                  {!isPendingTable && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.validated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.validated ? 'Validé' : 'Non validé'}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {isPendingTable ? (
                        <>
                          <button
                            onClick={() => handleValidate(user.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 transition"
                            title="Valider"
                          >
                            <FaCheck size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition"
                            title="Supprimer"
                          >
                            <FaTrash size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          {user.validated && (
                            <button
                              onClick={() => handleInvalidate(user.id)}
                              className="text-yellow-600 hover:text-yellow-900 p-1 rounded-full hover:bg-yellow-50 transition"
                              title="Bloquer"
                            >
                              <FaUserSlash size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition"
                            title="Modifier"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition"
                            title="Supprimer"
                          >
                            <FaTrash size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;