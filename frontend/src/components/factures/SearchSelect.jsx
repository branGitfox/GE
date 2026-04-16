import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const SearchSelect = ({
  options,
  value,
  onChange,
  placeholder = "Rechercher...",
  disabled = false,
  className = "",
  loading = false,
  allowCustom = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Trouver l'option sélectionnée pour afficher son label
  const selectedOption = options.find(option => option.value === value);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (val) => {
    const option = options.find(o => o.value === val);
    onChange(val, option);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (allowCustom) {
      onChange(val, null);
    }
  };

  const clearSelection = () => {
    onChange("", null);
    setSearchTerm("");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        if (!allowCustom && !selectedOption) {
          setSearchTerm("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [allowCustom, searchTerm, selectedOption, filteredOptions]);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={selectedOption ? selectedOption.label : placeholder}
          value={searchTerm || (selectedOption ? "" : "")} // display current value as text if no search
          onChange={handleCustomChange}
          onFocus={() => setIsOpen(true)}
          className={`w-full pl-10 pr-8 py-2 border ${disabled ? 'bg-gray-100' : 'bg-white'} border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
          disabled={disabled}
        />
        {(value || searchTerm) && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FaTimes className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {isOpen && (searchTerm || filteredOptions.length > 0) && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-1 max-h-60 overflow-auto border border-gray-200">
          {loading ? (
            <div className="px-4 py-2 text-gray-500">Chargement...</div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center ${value === option.value ? 'bg-blue-100' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))
          ) : allowCustom && searchTerm ? (
            <div
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-blue-600 italic"
              onClick={() => {
                onChange(searchTerm, null);
                setIsOpen(false);
              }}
            >
              Utiliser "{searchTerm}"
            </div>
          ) : (
            <div className="px-4 py-2 text-gray-500">Aucun résultat trouvé</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchSelect;