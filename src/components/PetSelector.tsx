import React from 'react';
import { ChevronDown, User } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  avatar_url?: string;
  breed?: string;
}

interface PetSelectorProps {
  pets: Pet[];
  selectedPetId: string;
  onPetSelect: (petId: string) => void;
  className?: string;
  showLabel?: boolean;
}

export const PetSelector: React.FC<PetSelectorProps> = ({
  pets,
  selectedPetId,
  onPetSelect,
  className = '',
  showLabel = true
}) => {
  const selectedPet = pets.find(pet => pet.id === selectedPetId);

  if (pets.length <= 1) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecionar Pet
        </label>
      )}
      <div className="relative">
        <select
          value={selectedPetId}
          onChange={(e) => onPetSelect(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
        >
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name} {pet.breed ? `(${pet.breed})` : ''}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
      
      {selectedPet && (
        <div className="flex items-center mt-2 p-2 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3 overflow-hidden">
            {selectedPet.avatar_url ? (
              <img
                src={selectedPet.avatar_url}
                alt={selectedPet.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{selectedPet.name}</p>
            {selectedPet.breed && (
              <p className="text-xs text-gray-500">{selectedPet.breed}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PetSelector;