import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, User, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { petsService } from '../services/petsService';
import { BreedSelector } from '../components/BreedSelector';
import { Breed } from '../services/breedsService';
import PhotoUpload from '../components/PhotoUpload';

const AddPet: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Função para calcular idade baseada na data de nascimento
  const calculateAge = (birthDate: string): string => {
    if (!birthDate) return '';
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age > 0 ? `${age} anos` : 'Menos de 1 ano';
  };

  const [petFormData, setPetFormData] = useState({
    name: '',
    species: 'Cachorro',
    breed: '',
    breed_id: null as string | null,
    birth_date: '',
    gender: 'Macho',
    weight: '',
    color: '',
    microchip_id: '',
    notes: '',
    avatar_url: '',
    age: '',
    height: '',
    personality: [] as string[],
    allergies: [] as string[],
    medications: [] as string[]
  });

  const handleCreatePet = async () => {
    if (!petFormData.name || !petFormData.species) {
      setError('Por favor, preencha os campos obrigatórios (nome e espécie)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🐕 Dados do pet a serem enviados:', petFormData);
      
      const newPet = await petsService.createPet({
        ...petFormData,
        avatar_url: petFormData.avatar_url || null
      });
      
      console.log('✅ Pet criado com sucesso:', newPet);
      
      setSuccess(true);
      
      // Redirecionar para o perfil dos pets após 2 segundos
      setTimeout(() => {
        navigate('/pet-profile');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar pet');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/pet-profile');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-accent/20 p-8 text-center max-w-md mx-4"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-text-color-dark mb-2">
            Pet cadastrado com sucesso!
          </h2>
          <p className="text-text-color mb-4">
            Seu pet foi adicionado ao sistema. Redirecionando...
          </p>
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-8 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-accent/20 p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-text-color" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-text-color-dark">
                  Cadastrar Novo Pet
                </h1>
                <p className="text-text-color">
                  Preencha as informações do seu pet
                </p>
              </div>
            </div>
            <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            >
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Nome do pet */}
            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                Nome do pet *
              </label>
              <input
                type="text"
                value={petFormData.name}
                onChange={(e) => setPetFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Rex, Luna, Mimi..."
                maxLength={100}
              />
            </div>
            
            {/* Espécie */}
            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                Espécie *
              </label>
              <select
                value={petFormData.species}
                onChange={(e) => setPetFormData(prev => ({ ...prev, species: e.target.value }))}
                className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Cachorro">Cachorro</option>
                <option value="Gato">Gato</option>
                <option value="Pássaro">Pássaro</option>
                <option value="Peixe">Peixe</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            {/* Raça */}
            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                Raça
              </label>
              <BreedSelector
                value={petFormData.breed_id}
                onChange={(breedId, breed) => {
                  setPetFormData(prev => ({
                    ...prev,
                    breed_id: breedId,
                    breed: breed?.name || ''
                  }));
                }}
                species={petFormData.species === 'Cachorro' ? 'dog' : petFormData.species === 'Gato' ? 'cat' : undefined}
                placeholder="Digite para buscar uma raça..."
                className="w-full"
              />
            </div>

            {/* Data de nascimento */}
            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                Data de nascimento
              </label>
              <input
                type="date"
                value={petFormData.birth_date}
                onChange={(e) => setPetFormData(prev => ({ 
                  ...prev, 
                  birth_date: e.target.value,
                  age: calculateAge(e.target.value)
                }))}
                className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Gênero */}
            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                Gênero
              </label>
              <select
                value={petFormData.gender}
                onChange={(e) => setPetFormData(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Macho">Macho</option>
                <option value="Fêmea">Fêmea</option>
              </select>
            </div>

            {/* Peso */}
            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                Peso (kg)
              </label>
              <input
                type="text"
                value={petFormData.weight}
                onChange={(e) => setPetFormData(prev => ({ ...prev, weight: e.target.value }))}
                className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: 5.5, 25, 0.8..."
                maxLength={10}
              />
            </div>

            {/* Altura */}
            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                Altura (cm)
              </label>
              <input
                type="text"
                value={petFormData.height}
                onChange={(e) => setPetFormData(prev => ({ ...prev, height: e.target.value }))}
                className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: 30, 45, 60..."
                maxLength={10}
              />
            </div>

            {/* Cor */}
            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                Cor
              </label>
              <input
                type="text"
                value={petFormData.color}
                onChange={(e) => setPetFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Dourado, Preto, Branco..."
                maxLength={50}
              />
            </div>

            {/* Microchip */}
            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                ID do Microchip
              </label>
              <input
                type="text"
                value={petFormData.microchip_id}
                onChange={(e) => setPetFormData(prev => ({ ...prev, microchip_id: e.target.value }))}
                className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: 123456789012345"
                maxLength={20}
              />
            </div>

            {/* Idade (calculada automaticamente) */}
            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                Idade (calculada automaticamente)
              </label>
              <input
                type="text"
                value={petFormData.age}
                readOnly
                className="w-full px-3 py-2 border border-accent/20 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="Selecione a data de nascimento para calcular a idade"
              />
            </div>

            {/* Upload da foto */}
            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                Foto do pet
              </label>
              <PhotoUpload
                onUploadComplete={(imageUrl) => {
                  setPetFormData(prev => ({ ...prev, avatar_url: imageUrl }));
                }}
                onUploadError={(error) => {
                  setError(`Erro no upload da foto: ${error}`);
                }}
                maxSizeMB={5}
                className="w-full"
              />
              {petFormData.avatar_url && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Foto carregada com sucesso
                </p>
              )}
            </div>

            {/* Personalidade */}
            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                Personalidade
              </label>
              <input
                type="text"
                value={petFormData.personality.join(', ')}
                onChange={(e) => setPetFormData(prev => ({
                  ...prev,
                  personality: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                }))}
                className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Brincalhão, Calmo, Sociável..."
              />
            </div>

            {/* Alergias */}
            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                Alergias
              </label>
              <input
                type="text"
                value={petFormData.allergies.join(', ')}
                onChange={(e) => setPetFormData(prev => ({
                  ...prev,
                  allergies: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                }))}
                className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Frango, Pólen, Produtos químicos..."
              />
            </div>

            {/* Medicamentos */}
            <div>
              <label className="block text-sm font-medium text-text-color-dark mb-2">
                Medicamentos
              </label>
              <input
                type="text"
                value={petFormData.medications.join(', ')}
                onChange={(e) => setPetFormData(prev => ({
                  ...prev,
                  medications: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                }))}
                className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Antibiótico, Vermífugo..."
              />
            </div>
          </div>

          {/* Observações */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-text-color-dark mb-2">
              Observações
            </label>
            <textarea
              value={petFormData.notes}
              onChange={(e) => setPetFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="Informações adicionais sobre o pet..."
              maxLength={500}
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 mt-8">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-100 text-text-color-dark py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleCreatePet}
              disabled={loading || !petFormData.name || !petFormData.species}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                loading || !petFormData.name || !petFormData.species
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Cadastrar Pet</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddPet;