import React, { useState, useEffect } from 'react';
import { Check, X, Edit3, Calendar, Dog, Clock, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { weeklyBathsService, WeeklyBath, WeeklyBathCreate } from '../services/weeklyBathsService';
import PhotoUpload from './PhotoUpload';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeeklyBathsCurationProps {
  className?: string;
}

const WeeklyBathsCuration: React.FC<WeeklyBathsCurationProps> = ({ className = '' }) => {
  const [baths, setBaths] = useState<WeeklyBath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBath, setEditingBath] = useState<WeeklyBath | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBath, setNewBath] = useState<Partial<WeeklyBathCreate>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    loadBaths();
  }, []);

  const loadBaths = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await weeklyBathsService.getAllWeeklyBaths();
      setBaths(data);
    } catch (err) {
      console.error('Erro ao carregar banhos:', err);
      setError('Erro ao carregar banhos da semana');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await weeklyBathsService.updateWeeklyBath(id, { is_approved: true });
      setBaths(prev => prev.map(bath => 
        bath.id === id ? { ...bath, is_approved: true } : bath
      ));
    } catch (err) {
      console.error('Erro ao aprovar banho:', err);
      setError('Erro ao aprovar banho');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await weeklyBathsService.updateWeeklyBath(id, { is_approved: false });
      setBaths(prev => prev.map(bath => 
        bath.id === id ? { ...bath, is_approved: false } : bath
      ));
    } catch (err) {
      console.error('Erro ao rejeitar banho:', err);
      setError('Erro ao rejeitar banho');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banho?')) return;
    
    try {
      await weeklyBathsService.deleteWeeklyBath(id);
      setBaths(prev => prev.filter(bath => bath.id !== id));
    } catch (err) {
      console.error('Erro ao excluir banho:', err);
      setError('Erro ao excluir banho');
    }
  };

  const handleEdit = (bath: WeeklyBath) => {
    setEditingBath({ ...bath });
  };

  const handleSaveEdit = async () => {
    if (!editingBath) return;
    
    try {
      const { id, ...updateData } = editingBath;
      await weeklyBathsService.updateWeeklyBath(id, updateData);
      setBaths(prev => prev.map(bath => 
        bath.id === id ? editingBath : bath
      ));
      setEditingBath(null);
    } catch (err) {
      console.error('Erro ao salvar edição:', err);
      setError('Erro ao salvar alterações');
    }
  };

  const handleCancelEdit = () => {
    setEditingBath(null);
  };

  const handleAddBath = async () => {
    if (!newBath.image_url || !newBath.pet_name || !newBath.bath_date) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const bathData: WeeklyBathCreate = {
        image_url: newBath.image_url,
        pet_name: newBath.pet_name,
        bath_date: newBath.bath_date,
        description: newBath.description || '',
        is_approved: false
      };
      
      const createdBath = await weeklyBathsService.createWeeklyBath(bathData);
      setBaths(prev => [createdBath, ...prev]);
      setNewBath({});
      setShowAddForm(false);
    } catch (err) {
      console.error('Erro ao adicionar banho:', err);
      setError('Erro ao adicionar banho');
    }
  };

  const handleUploadComplete = (imageUrl: string) => {
    if (editingBath) {
      setEditingBath({ ...editingBath, image_url: imageUrl });
    } else {
      setNewBath({ ...newBath, image_url: imageUrl });
    }
    setUploadError(null);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando banhos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Curadoria de Banhos Semanais</h2>
          <p className="text-gray-600 mt-1">Gerencie as fotos que aparecerão na seção "Quem passou por aqui na última semana?"</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Banho
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{uploadError}</p>
          <button
            onClick={() => setUploadError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Adicionar Novo Banho</h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewBath({});
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Pet *
                </label>
                <input
                  type="text"
                  value={newBath.pet_name || ''}
                  onChange={(e) => setNewBath({ ...newBath, pet_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nome do pet"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data do Banho *
                </label>
                <input
                  type="date"
                  value={newBath.bath_date || ''}
                  onChange={(e) => setNewBath({ ...newBath, bath_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={newBath.description || ''}
                  onChange={(e) => setNewBath({ ...newBath, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  placeholder="Descrição opcional do banho"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto do Banho *
              </label>
              <PhotoUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                className="h-full min-h-[200px]"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewBath({});
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddBath}
              disabled={!newBath.image_url || !newBath.pet_name || !newBath.bath_date}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Adicionar Banho
            </button>
          </div>
        </div>
      )}

      {/* Baths Grid */}
      {baths.length === 0 ? (
        <div className="text-center py-12">
          <Dog className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum banho encontrado</h3>
          <p className="text-gray-600">Adicione o primeiro banho da semana para começar a curadoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {baths.map((bath) => (
            <div key={bath.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {/* Image */}
              <div className="relative">
                <img
                  src={bath.image_url}
                  alt={`Banho do ${bath.pet_name}`}
                  className="w-full h-48 object-cover"
                />
                
                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  {bath.is_approved === true ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Aprovado
                    </span>
                  ) : bath.is_approved === false ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <X className="h-3 w-3 mr-1" />
                      Rejeitado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Pendente
                    </span>
                  )}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                {editingBath?.id === bath.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingBath.pet_name}
                      onChange={(e) => setEditingBath({ ...editingBath, pet_name: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="date"
                      value={editingBath.bath_date}
                      onChange={(e) => setEditingBath({ ...editingBath, bath_date: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <textarea
                      value={editingBath.description || ''}
                      onChange={(e) => setEditingBath({ ...editingBath, description: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      rows={2}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Dog className="h-4 w-4 mr-2 text-primary" />
                        {bath.pet_name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(bath.bath_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    
                    {bath.description && (
                      <p className="text-sm text-gray-700">{bath.description}</p>
                    )}
                    
                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      {bath.is_approved !== true && (
                        <button
                          onClick={() => handleApprove(bath.id)}
                          className="flex-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center justify-center"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Aprovar
                        </button>
                      )}
                      
                      {bath.is_approved !== false && (
                        <button
                          onClick={() => handleReject(bath.id)}
                          className="flex-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors flex items-center justify-center"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Rejeitar
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleEdit(bath)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(bath.id)}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeeklyBathsCuration;