import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Edit3, Calendar, Dog, Clock, AlertCircle, Plus, Trash2, Eye } from 'lucide-react';
import { weeklyBathsService, WeeklyBath, WeeklyBathCreate, getCurrentWeekStart, getWeekStartFromString } from '../services/weeklyBathsService';
import PhotoUpload from './PhotoUpload';
import { PetSelector } from './PetSelector';
import { IntegrationPreview } from './IntegrationPreview';
import { useIntegration } from '../hooks/useIntegration';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Pet, IntegrationPreviewData } from '../types/integration';
import { integrationService } from '../services/integrationService';

interface WeeklyBathsCurationV2Props {
  className?: string;
}

// Componente memoizado para o card individual - EVITA RE-RENDERIZAÇÕES DESNECESSÁRIAS
const BathCard = React.memo(({ 
  bath, 
  editingBath, 
  onEdit, 
  onSave, 
  onCancel,
  onDelete, 
  onApprove, 
  onReject,
  onToggleIntegration,
  onSelectPet,
  onGeneratePreview,
  onClosePreview,
  integrationEnabled,
  selectedPets,
  showPreview,
  previewByBath,
  approvingWithIntegration,
  integrationLoading,
  pets,
  updateEditingBath
}: {
  bath: WeeklyBath;
  editingBath: WeeklyBath | null;
  onEdit: (bath: WeeklyBath) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onToggleIntegration: (id: string, enabled: boolean) => void;
  onSelectPet: (id: string, pet: Pet | null) => void;
  onGeneratePreview: (id: string) => void;
  onClosePreview: (id: string) => void;
  integrationEnabled: {[key: string]: boolean};
  selectedPets: {[key: string]: Pet | null};
  showPreview: {[key: string]: boolean};
  previewByBath: {[key: string]: IntegrationPreviewData | null};
  approvingWithIntegration: {[key: string]: boolean};
  integrationLoading: boolean;
  pets: Pet[];
  updateEditingBath: (updates: Partial<WeeklyBath>) => void;
}) => {
  console.log('[WeeklyBathsCurationV2] Render BathCard', {
    id: bath.id,
    approved: bath.approved,
    integrationEnabled: integrationEnabled[bath.id],
    selectedPet: selectedPets[bath.id]?.id || null
  });
  const isEditing = editingBath?.id === bath.id;
  const currentEditing = isEditing ? editingBath : null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <Dog className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{bath.pet_name}</h3>
        </div>
        <div className="flex items-center gap-2">
          {bath.approved ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Check className="w-3 h-3 mr-1" />
              Aprovado
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Clock className="w-3 h-3 mr-1" />
              Pendente
            </span>
          )}
          
          {!isEditing && (
            <>
              <button
                onClick={() => onEdit(bath)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Editar"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja excluir este banho? Esta ação não pode ser desfeita.')) {
                    onDelete(bath.id);
                  }
                }}
                className="p-1 text-red-500 hover:text-red-600 transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {bath.image_url ? (
            <img 
              src={bath.image_url} 
              alt={bath.pet_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Dog className="w-12 h-12" />
            </div>
          )}
        </div>

        {isEditing && currentEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Pet
              </label>
              <input
                type="text"
                value={currentEditing.pet_name}
                onChange={(e) => updateEditingBath({ pet_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data do Banho
              </label>
              <input
                type="date"
                value={currentEditing.bath_date}
                onChange={(e) => updateEditingBath({ bath_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas do Curador
              </label>
              <textarea
                value={currentEditing.curator_notes || ''}
                onChange={(e) => updateEditingBath({ curator_notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Adicione notas sobre este banho..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={onSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Salvar
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{(() => { const [y,m,d] = bath.bath_date.split('-').map(Number); const dt = new Date(y,(m||1)-1,d||1); return format(dt, 'dd/MM/yyyy', { locale: ptBR }); })()}</span>
            </div>

            {bath.curator_notes && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Notas:</strong> {bath.curator_notes}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Integrar à Jornada:</span>
              <button
                onClick={() => onToggleIntegration(bath.id, !integrationEnabled[bath.id])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  integrationEnabled[bath.id] ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    integrationEnabled[bath.id] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* PetSelector e botões independentes da integração */}
            <div className="space-y-2">
              <PetSelector
                pets={pets}
                selectedPet={selectedPets[bath.id]}
                onSelectPet={(pet) => { 
                  console.log('[WeeklyBathsCurationV2] Select Pet', { bathId: bath.id, petId: pet?.id || null });
                  onSelectPet(bath.id, pet);
                }}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => { 
                    console.log('[WeeklyBathsCurationV2] Click Preview', { bathId: bath.id });
                    onGeneratePreview(bath.id);
                  }}
                  disabled={integrationLoading || !selectedPets[bath.id]}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </button>

                {bath.approved !== true && (
                  <button
                    onClick={() => { 
                      console.log('[WeeklyBathsCurationV2] Click Approve', { bathId: bath.id });
                      onApprove(bath.id);
                    }}
                    disabled={approvingWithIntegration[bath.id]}
                    className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50 transition-colors text-sm"
                  >
                    <Check className="w-3 h-3" />
                    Aprovar
                  </button>
                )}

                <button
                  onClick={() => { 
                    console.log('[WeeklyBathsCurationV2] Click Reject', { bathId: bath.id });
                    onReject(bath.id);
                  }}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                >
                  <X className="w-3 h-3" />
                  Rejeitar
                </button>
              </div>
            </div>
            {showPreview[bath.id] && previewByBath[bath.id] && selectedPets[bath.id] && (
              <div className="mt-3">
                <IntegrationPreview
                  previewData={previewByBath[bath.id]!}
                  bath={bath}
                  pet={selectedPets[bath.id]!}
                  onClose={() => onClosePreview(bath.id)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

BathCard.displayName = 'BathCard';

const WeeklyBathsCurationV2: React.FC<WeeklyBathsCurationV2Props> = ({ className = '' }) => {
  const [baths, setBaths] = useState<WeeklyBath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBath, setEditingBath] = useState<WeeklyBath | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBath, setNewBath] = useState<Partial<WeeklyBathCreate>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>(getCurrentWeekStart());
  
  // Integration state
  const [integrationEnabled, setIntegrationEnabled] = useState<{[key: string]: boolean}>({});
  const [selectedPets, setSelectedPets] = useState<{[key: string]: Pet | null}>({});
  const [showPreview, setShowPreview] = useState<{[key: string]: boolean}>({});
  const [approvingWithIntegration, setApprovingWithIntegration] = useState<{[key: string]: boolean}>({});
  const [previewByBath, setPreviewByBath] = useState<{[key: string]: IntegrationPreviewData | null}>({});
  
  // Integration hook
  const {
    pets,
    approveBathWithIntegration,
    isLoading: integrationLoading,
  } = useIntegration();

  const loadBaths = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await weeklyBathsService.getWeekBaths(selectedWeek);
      setBaths(data);
    } catch (err) {
      console.error('Erro ao carregar banhos:', err);
      setError('Erro ao carregar banhos da semana');
    } finally {
      setLoading(false);
    }
  }, [selectedWeek]);

  const loadAvailableWeeks = useCallback(async () => {
    try {
      const weeks = await weeklyBathsService.getAvailableWeeks();
      const current = getCurrentWeekStart();
      const merged = weeks.includes(current) ? weeks : [current, ...weeks];
      setAvailableWeeks(merged);
    } catch (err) {
      console.error('Erro ao carregar semanas disponíveis:', err);
    }
  }, []);

  useEffect(() => {
    loadBaths();
    loadAvailableWeeks();
  }, [loadBaths, loadAvailableWeeks]);

  // Sincroniza estado de integração/pet com dados do banho
  useEffect(() => {
    if (!baths?.length || editingBath) return;
    setIntegrationEnabled(prev => {
      const next = { ...prev };
      baths.forEach(b => { next[b.id] = !!b.add_to_journey; });
      return next;
    });
    if (pets?.length) {
      setSelectedPets(prev => {
        const next = { ...prev };
        baths.forEach(b => {
          const pet = b.pet_id ? pets.find(p => p.id === b.pet_id) || null : prev[b.id] || null;
          next[b.id] = pet || null;
        });
        return next;
      });
    }
  }, [baths, pets, editingBath]);

  const handleCancelEdit = () => {
    setEditingBath(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await weeklyBathsService.deleteWeeklyBath(id);
      setBaths(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Erro ao deletar banho:', err);
      setError('Erro ao deletar banho');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setApprovingWithIntegration(prev => ({ ...prev, [id]: true }));
      const isIntegrationEnabled = integrationEnabled[id] || false;
      const selectedPet = selectedPets[id];

      if (isIntegrationEnabled && selectedPet) {
        await approveBathWithIntegration(id, '', selectedPet.id);
      } else {
        await weeklyBathsService.updateWeeklyBath(id, { approved: true });
      }

      await loadBaths();
    } catch (err) {
      console.error('Erro ao aprovar banho:', err);
      setError('Erro ao aprovar banho');
    } finally {
      setApprovingWithIntegration(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleAddBath = async () => {
    if (!newBath.image_url || !newBath.pet_name || !newBath.bath_date) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const bathData: WeeklyBathCreate = {
        image_url: newBath.image_url!,
        image_path: newBath.image_path,
        pet_name: newBath.pet_name!,
        bath_date: newBath.bath_date!,
        week_start: getWeekStartFromString(newBath.bath_date!),
        curator_notes: newBath.curator_notes || ''
      };
      
      await weeklyBathsService.createWeeklyBath(bathData);
      await loadBaths();
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

  const handleEdit = (bath: WeeklyBath) => {
    setEditingBath({ ...bath });
    setIntegrationEnabled(prev => ({
      ...prev,
      [bath.id]: prev[bath.id] !== undefined ? prev[bath.id] : !!bath.add_to_journey
    }));
    setSelectedPets(prev => {
      if (prev[bath.id]) return prev;
      const pet = bath.pet_id && pets?.length ? (pets.find(p => p.id === bath.pet_id) || null) : null;
      return { ...prev, [bath.id]: pet };
    });
  };

  const handleSaveEdit = async () => {
    if (!editingBath) return;
    
    try {
      const payload = {
        pet_name: editingBath.pet_name,
        bath_date: editingBath.bath_date,
        curator_notes: editingBath.curator_notes,
        image_url: editingBath.image_url,
        image_path: editingBath.image_path,
        week_start: getWeekStartFromString(editingBath.bath_date)
      };
      
      await weeklyBathsService.updateWeeklyBath(editingBath.id, payload);
      await loadBaths();
      setEditingBath(null);
    } catch (err) {
      console.error('Erro ao salvar edição:', err);
      setError('Erro ao salvar edição');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await weeklyBathsService.updateWeeklyBath(id, { approved: false });
      await loadBaths();
    } catch (err) {
      console.error('Erro ao rejeitar banho:', err);
      setError('Erro ao rejeitar banho');
    }
  };

  const handleToggleIntegration = (id: string, enabled: boolean) => {
    setIntegrationEnabled(prev => ({ ...prev, [id]: enabled }));
  };

  const handleSelectPetForBath = (id: string, pet: Pet | null) => {
    setSelectedPets(prev => ({ ...prev, [id]: pet }));
  };

  const handleGeneratePreview = async (id: string) => {
    try {
      const bath = baths.find(b => b.id === id);
      const pet = selectedPets[id];
      if (!bath || !pet) return;

      const preview = await integrationService.generateIntegrationPreview(bath.id);
      setPreviewByBath(prev => ({ ...prev, [id]: preview }));
      setShowPreview(prev => ({ ...prev, [id]: true }));
    } catch (err) {
      console.error('Erro ao gerar preview:', err);
      setError('Erro ao gerar preview da integração');
    }
  };

  const handleClosePreview = (id: string) => {
    setShowPreview(prev => ({ ...prev, [id]: false }));
    setPreviewByBath(prev => ({ ...prev, [id]: null }));
  };

  const formatWeekDisplay = (weekStart: string) => {
    const [y, m, d] = weekStart.split('-').map(Number);
    const start = new Date(y, (m || 1) - 1, d || 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const range = `${format(start, 'dd/MM/yyyy', { locale: ptBR })} - ${format(end, 'dd/MM/yyyy', { locale: ptBR })}`;
    const isCurrent = weekStart === getCurrentWeekStart();
    return isCurrent ? `${range} (Atual)` : range;
  };

  // FUNÇÃO PARA ATUALIZAR O BANHO EM EDIÇÃO - EVITA RE-RENDERIZAÇÃO DO COMPONENTE INTEIRO
  const updateEditingBath = useCallback((updates: Partial<WeeklyBath>) => {
    setEditingBath(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Curadoria de Banhos Semanais</h2>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[220px]"
            >
              {availableWeeks.map(week => (
                <option key={week} value={week}>
                  {formatWeekDisplay(week)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Banho
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Seletor duplicado removido. Seletor principal permanece no cabeçalho ao lado do título. */}

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Novo Banho</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto do Banho</label>
              <PhotoUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                currentImageUrl={newBath.image_url}
              />
              {uploadError && (
                <p className="text-red-600 text-sm mt-1">{uploadError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Pet</label>
              <input
                type="text"
                value={newBath.pet_name || ''}
                onChange={(e) => setNewBath({ ...newBath, pet_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do pet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data do Banho</label>
              <input
                type="date"
                value={newBath.bath_date || ''}
                onChange={(e) => setNewBath({ ...newBath, bath_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas do Curador</label>
              <textarea
                value={newBath.curator_notes || ''}
                onChange={(e) => setNewBath({ ...newBath, curator_notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Adicione notas sobre este banho..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddBath}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Adicionar
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewBath({});
                  setUploadError(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {baths.map((bath) => (
          <BathCard
            key={bath.id}
            bath={bath}
            editingBath={editingBath}
            onEdit={handleEdit}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
            onToggleIntegration={handleToggleIntegration}
            onSelectPet={handleSelectPetForBath}
            onGeneratePreview={handleGeneratePreview}
            onClosePreview={handleClosePreview}
            integrationEnabled={integrationEnabled}
            selectedPets={selectedPets}
            showPreview={showPreview}
            previewByBath={previewByBath}
            approvingWithIntegration={approvingWithIntegration}
            integrationLoading={integrationLoading}
            pets={pets}
            updateEditingBath={updateEditingBath}
          />
        ))}
      </div>

      {baths.length === 0 && (
        <div className="text-center py-12">
          <Dog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum banho encontrado para esta semana.</p>
        </div>
      )}
    </div>
  );
};

export default WeeklyBathsCurationV2;