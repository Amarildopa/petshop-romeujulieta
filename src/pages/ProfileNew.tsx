import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Edit, 
  Trash2, 
  Plus,
  Heart,
  X
} from 'lucide-react';

// Tipos
interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  avatar_url: string | null;
  birth_date: string;
  gender: string;
  height: string;
  color: string;
  microchip_id: string;
  notes: string;
  is_active: boolean;
  personality: string[];
  allergies: string[];
  medications: string[];
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  avatar_url: string | null;
}

const ProfileNew: React.FC = () => {
  // Estados
  const [editingPet, setEditingPet] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Dados mock
  const mockProfile: Profile = {
    id: '1',
    full_name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123',
    avatar_url: null
  };

  const mockPets: Pet[] = [
    {
      id: '1',
      name: 'Rex',
      species: 'Cão',
      breed: 'Golden Retriever',
      age: '3 anos',
      weight: '25kg',
      avatar_url: null,
      birth_date: '2021-01-15',
      gender: 'Macho',
      height: '60cm',
      color: 'Dourado',
      microchip_id: '123456789',
      notes: 'Pet muito dócil e brincalhão',
      is_active: true,
      personality: ['Brincalhão', 'Dócil'],
      allergies: [],
      medications: []
    },
    {
      id: '2',
      name: 'Mimi',
      species: 'Gato',
      breed: 'Persa',
      age: '2 anos',
      weight: '4kg',
      avatar_url: null,
      birth_date: '2022-03-10',
      gender: 'Fêmea',
      height: '25cm',
      color: 'Branco',
      microchip_id: '987654321',
      notes: 'Gata independente, gosta de carinho',
      is_active: true,
      personality: ['Independente', 'Carinhosa'],
      allergies: ['Frango'],
      medications: []
    }
  ];

  // Funções
  const handleEditPet = (petId: string) => {
    console.log('🎯 Clicou em editar pet:', petId);
    alert(`Editando pet: ${petId}`);
    setEditingPet(petId);
    setShowEditModal(true);
  };

  const handleDeletePet = (petId: string) => {
    console.log('🗑️ Clicou em deletar pet:', petId);
    alert(`Deletando pet: ${petId}`);
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditingPet(null);
  };

  const currentPet = editingPet ? mockPets.find(p => p.id === editingPet) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Meu Perfil</h1>
          
          {/* Informações do usuário */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">{mockProfile.full_name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">{mockProfile.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">{mockProfile.phone}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Seção de Pets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Meus Pets</h2>
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Adicionar Pet</span>
            </button>
          </div>

          {/* Debug Info */}
          <div className="bg-green-100 p-4 rounded-lg mb-6 border border-green-200">
            <p className="text-green-800 font-semibold">✅ Debug Info:</p>
            <p className="text-green-700">Total de pets: {mockPets.length}</p>
            <p className="text-green-700">Estado editingPet: {editingPet || 'null'}</p>
            <p className="text-green-700">Modal aberto: {showEditModal ? 'Sim' : 'Não'}</p>
          </div>

          {/* Grid de Pets */}
          <div className="grid md:grid-cols-2 gap-6">
            {mockPets.map((pet) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{pet.name}</h3>
                      <p className="text-gray-600">{pet.species} • {pet.breed}</p>
                    </div>
                  </div>
                  
                  {/* Botões de ação */}
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditPet(pet.id);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      type="button"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeletePet(pet.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Informações do pet */}
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Idade:</span> {pet.age}</p>
                  <p><span className="font-medium">Peso:</span> {pet.weight}</p>
                  <p><span className="font-medium">Cor:</span> {pet.color}</p>
                  <p><span className="font-medium">Gênero:</span> {pet.gender}</p>
                  {pet.notes && (
                    <p><span className="font-medium">Observações:</span> {pet.notes}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mensagem quando não há pets */}
          {mockPets.length === 0 && (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum pet cadastrado</h3>
              <p className="text-gray-500">Adicione seu primeiro pet para começar!</p>
            </div>
          )}
        </motion.div>

        {/* Modal de Edição */}
        {showEditModal && currentPet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Editar {currentPet.name}</h3>
                  <button
                    onClick={closeModal}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      defaultValue={currentPet.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Espécie</label>
                    <input
                      type="text"
                      defaultValue={currentPet.species}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
                    <input
                      type="text"
                      defaultValue={currentPet.breed}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                    <textarea
                      defaultValue={currentPet.notes}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      alert('Pet salvo com sucesso!');
                      closeModal();
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileNew;