import React, { useState, useMemo } from 'react';
import { Search, Check, AlertCircle, Dog } from 'lucide-react';
import type { Pet } from '../types/integration';

interface PetSelectorProps {
  pets: Pet[];
  selectedPet: Pet | null;
  onSelectPet: (pet: Pet | null) => void;
  isLoading?: boolean;
  error?: string | null;
  disabled?: boolean;
  placeholder?: string;
  showValidation?: boolean;
}

export function PetSelector({
  pets,
  selectedPet,
  onSelectPet,
  isLoading = false,
  error = null,
  disabled = false,
  placeholder = "Selecione um pet para adicionar à jornada...",
  showValidation = true
}: PetSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filter pets based on search term
  const filteredPets = useMemo(() => {
    if (!searchTerm.trim()) return pets;
    
    const term = searchTerm.toLowerCase();
    return pets.filter(pet => 
      pet.name.toLowerCase().includes(term) ||
      pet.breed?.toLowerCase().includes(term) ||
      pet.owner_name?.toLowerCase().includes(term)
    );
  }, [pets, searchTerm]);

  const handleSelectPet = (pet: Pet) => {
    onSelectPet(pet);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClearSelection = () => {
    // Limpa seleção e abre o dropdown para facilitar a troca
    onSelectPet(null);
    setSearchTerm('');
    setIsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Carregando pets...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Pet para Jornada de Crescimento
      </label>
      
      <div className="relative">
        {/* Selected Pet Display */}
        {selectedPet && !isOpen ? (
          <div className="w-full p-3 border border-green-200 rounded-lg bg-green-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {selectedPet.avatar_url ? (
                  <img
                    src={selectedPet.avatar_url}
                    alt={selectedPet.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Dog className="h-4 w-4 text-gray-500" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-green-800">{selectedPet.name}</span>
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-xs text-green-600">
                  {selectedPet.breed && selectedPet.owner_name
                    ? `${selectedPet.breed} • ${selectedPet.owner_name}`
                    : (selectedPet.breed || selectedPet.owner_name || '')}
                </div>
              </div>
            </div>
            <button
              onClick={handleClearSelection}
              disabled={disabled}
              className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
            >
              Alterar
            </button>
          </div>
        ) : (
          /* Search Input */
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        )}

        {/* Dropdown */}
        {isOpen && !selectedPet && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredPets.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'Nenhum pet encontrado' : 'Nenhum pet disponível'}
              </div>
            ) : (
              <div className="py-1">
                {filteredPets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => handleSelectPet(pet)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {pet.avatar_url ? (
                          <img
                            src={pet.avatar_url}
                            alt={pet.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <Dog className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {pet.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {pet.breed && pet.owner_name
                            ? `${pet.breed} • ${pet.owner_name}`
                            : (pet.breed || pet.owner_name || '')}
                        </div>
                      </div>
                      {showValidation && pet.has_journey && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Com jornada
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation Messages */}
      {showValidation && selectedPet && (
        <div className="text-xs space-y-1">
          {selectedPet.has_journey ? (
            <div className="flex items-center space-x-1 text-green-600">
              <Check className="h-3 w-3" />
              <span>Pet possui jornada ativa</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-amber-600">
              <AlertCircle className="h-3 w-3" />
              <span>Jornada será criada automaticamente ao aprovar</span>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Simplified version for inline use
export function PetSelectorInline({
  pets,
  selectedPet,
  onSelectPet,
  disabled = false
}: Pick<PetSelectorProps, 'pets' | 'selectedPet' | 'onSelectPet' | 'disabled'>) {
  return (
    <select
      value={selectedPet?.id || ''}
      onChange={(e) => {
        const pet = pets.find(p => p.id === e.target.value);
        onSelectPet(pet || null);
      }}
      disabled={disabled}
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
    >
      <option value="">Selecione um pet...</option>
      {pets.map((pet) => (
        <option key={pet.id} value={pet.id}>
          {pet.owner_name && pet.owner_name.trim() ? `${pet.name} - ${pet.owner_name}` : pet.name}
        </option>
      ))}
    </select>
  );
}