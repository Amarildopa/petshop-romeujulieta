import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { dogBreeds, catBreeds } from '../data/breeds';

interface BreedAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    species: string;
}

export const BreedAutocomplete: React.FC<BreedAutocompleteProps> = ({ value, onChange, species }) => {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const breedList = species === 'Cachorro' ? dogBreeds : catBreeds;

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [containerRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setInputValue(text);
        onChange(text);
        if (text.length > 0 && (species === 'Cachorro' || species === 'Gato')) {
            const filtered = breedList.filter(breed => 
                breed.toLowerCase().includes(text.toLowerCase())
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const onSuggestionClick = (breed: string) => {
        setInputValue(breed);
        onChange(breed);
        setSuggestions([]);
        setIsFocused(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <input 
                type="text" 
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                placeholder={species === 'Cachorro' || species === 'Gato' ? "Ex: Golden Retriever, SRD" : "Não aplicável"}
                className="w-full px-4 py-3 border border-accent rounded-lg disabled:bg-surface-dark"
                disabled={species !== 'Cachorro' && species !== 'Gato'}
            />
            {isFocused && suggestions.length > 0 && (
                <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute z-10 w-full bg-white border border-accent rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                    {suggestions.map((breed, index) => (
                        <li key={index} onClick={() => onSuggestionClick(breed)} className="px-4 py-2 hover:bg-surface-dark cursor-pointer">
                            {breed}
                        </li>
                    ))}
                </motion.ul>
            )}
        </div>
    );
};
