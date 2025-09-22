import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { breedsService, Breed } from '../services/breedsService';

interface BreedSelectorProps {
  value?: string; // ID da raça selecionada
  onChange: (breedId: string | null, breed: Breed | null) => void;
  species?: 'dog' | 'cat'; // Filtrar por espécie
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export const BreedSelector: React.FC<BreedSelectorProps> = ({
  value,
  onChange,
  species,
  placeholder = 'Digite para buscar uma raça...',
  disabled = false,
  required = false,
  error,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const loadSelectedBreed = useCallback(async (breedId: string) => {
    try {
      const breed = await breedsService.getBreedById(breedId);
      if (breed) {
        setSelectedBreed(breed);
        setSearchQuery(breed.name);
      }
    } catch (error) {
      console.error('Erro ao carregar raça selecionada:', error);
    }
  }, []);

  const searchBreeds = useCallback(async (query: string) => {
    try {
      setLoading(true);
      const results = await breedsService.searchBreedsByText(query, species, 20);
      setBreeds(results);
      setHighlightedIndex(-1);
    } catch (error) {
      console.error('Erro ao buscar raças:', error);
      setBreeds([]);
    } finally {
      setLoading(false);
    }
  }, [species]);

  const selectBreed = useCallback((breed: Breed) => {
    setSelectedBreed(breed);
    setSearchQuery(breed.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange(breed.id, breed);
  }, [onChange]);

  // Carregar raça selecionada quando value muda
  useEffect(() => {
    if (value && value !== selectedBreed?.id) {
      loadSelectedBreed(value);
    } else if (!value && selectedBreed) {
      setSelectedBreed(null);
      setSearchQuery('');
    }
  }, [value, selectedBreed, loadSelectedBreed]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev < breeds.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : breeds.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && breeds[highlightedIndex]) {
            selectBreed(breeds[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, breeds, highlightedIndex, selectBreed]);

  // Buscar raças quando query muda
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (isOpen) {
        searchBreeds(searchQuery);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, species, isOpen, searchBreeds]);

  const clearSelection = () => {
    setSelectedBreed(null);
    setSearchQuery('');
    setIsOpen(false);
    onChange(null, null);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!isOpen) {
      setIsOpen(true);
    }

    // Se o usuário está digitando algo diferente da raça selecionada, limpar seleção
    if (selectedBreed && query !== selectedBreed.name) {
      setSelectedBreed(null);
      onChange(null, null);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (!searchQuery && !selectedBreed) {
      searchBreeds('');
    }
  };

  const getSpeciesLabel = (species: string) => {
    return species === 'dog' ? '🐕' : '🐱';
  };

  const getSizeLabel = (size?: string) => {
    const sizeLabels = {
      toy: 'Toy',
      small: 'Pequeno',
      medium: 'Médio',
      large: 'Grande',
      giant: 'Gigante'
    };
    return size ? sizeLabels[size as keyof typeof sizeLabels] || size : '';
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            transition-colors duration-200
          `}
          autoComplete="off"
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {selectedBreed && !disabled && (
            <button
              type="button"
              onClick={clearSelection}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Limpar seleção"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
          
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto mb-2" />
              Buscando raças...
            </div>
          ) : breeds.length > 0 ? (
            <ul className="py-1">
              {breeds.map((breed, index) => (
                <li key={breed.id}>
                  <button
                    type="button"
                    onClick={() => selectBreed(breed)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none
                      ${index === highlightedIndex ? 'bg-blue-50' : ''}
                      ${selectedBreed?.id === breed.id ? 'bg-blue-100' : ''}
                      transition-colors duration-150
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {getSpeciesLabel(breed.species)}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900">
                            {breed.name}
                          </div>
                          {breed.size_category && (
                            <div className="text-sm text-gray-500">
                              {getSizeLabel(breed.size_category)}
                              {breed.origin_country && ` • ${breed.origin_country}`}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {selectedBreed?.id === breed.id && (
                        <div className="text-blue-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : searchQuery ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma raça encontrada para "{searchQuery}"</p>
              {species && (
                <p className="text-sm mt-1">
                  Buscando apenas em {species === 'dog' ? 'cães' : 'gatos'}
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Digite para buscar raças</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};