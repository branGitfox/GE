import React from 'react';
import { ClipLoader } from 'react-spinners';
import UsersTable from './UsersTable';

const UsersSection = ({ 
  title, 
  icon: Icon, 
  users, 
  isLoading, 
  editingUser, 
  editForm, 
  handleInputChange, 
  handleSaveEdit, 
  handleCancelEdit, 
  handleValidate, 
  handleInvalidate, 
  handleDelete, 
  handleEdit,
  isPendingSection = false 
}) => {
  return (
    <div className={`mb-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${isPendingSection ? '' : 'mb-8'}`}>
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <Icon className="mr-2 text-blue-500" />
          {title}
        </h2>
      </div>
      
      {isLoading ? (
        <div className="p-8 flex justify-center">
          <ClipLoader size={40} color="#3B82F6" />
        </div>
      ) : users.length > 0 ? (
        <UsersTable
          users={users}
          editingUser={editingUser}
          editForm={editForm}
          handleInputChange={handleInputChange}
          handleSaveEdit={handleSaveEdit}
          handleCancelEdit={handleCancelEdit}
          handleValidate={handleValidate}
          handleInvalidate={handleInvalidate}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          isPendingTable={isPendingSection}
        />
      ) : (
        <div className="p-6 text-center text-gray-500">
          {isPendingSection 
            ? 'Aucun utilisateur en attente de validation' 
            : 'Aucun utilisateur trouvé'}
        </div>
      )}
    </div>
  );
};

export default UsersSection;