import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Edit3, Calendar, Dog, Clock, AlertCircle, Plus, Trash2, Sparkles, Eye } from 'lucide-react';
import { weeklyBathsService, WeeklyBath, WeeklyBathCreate, getCurrentWeekStart, getWeekStartFromString } from '../services/weeklyBathsService';
import PhotoUpload from './PhotoUpload';
import { PetSelector } from './PetSelector';
import { IntegrationPreview, IntegrationPreviewCompact } from './IntegrationPreview';
import { useIntegration } from '../hooks/useIntegration';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Pet, IntegrationPreviewData } from '../types/integration';
import { integrationService } from '../services/integrationService';

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
    previewData,
    isLoading: integrationLoading,
    error: integrationError,
    clearError: clearIntegrationError,
    clearPreview
  } = useIntegration();

  const loadBaths = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Buscar todos os banhos da semana selecionada (aprovados e pendentes)
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
      setAvailableWeeks(weeks);
    } catch (err) {
      console.error('Erro ao carregar semanas disponíveis:', err);
    }
  }, []);

  useEffect(() => {
    loadBaths();
    loadAvailableWeeks();
  }, [loadBaths, loadAvailableWeeks]);

  useEffect(() => {
    loadBaths();
  }, [loadBaths]);

  // Sincroniza estado de integração/pet com dados do banho quando banhos ou pets são carregados
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

  // Removido: função de cancelar edição não utilizada

  const handleDelete = async (id: string) => {
    try {
      const bath = baths.find(b => b.id === id);
      if (bath?.journey_event_id) {
        await integrationService.removeIntegration(id);
      }
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
        // Passa corretamente petId como terceiro argumento
        await approveBathWithIntegration(id, '', selectedPet.id);
      } else {
        // approve without integration
        await weeklyBathsService.updateWeeklyBath(id, { approved: true });
      }

      // refresh list
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
        // week_start deve ser calculado a partir da data do banho
        week_start: getWeekStartFromString(newBath.bath_date!),
        curator_notes: newBath.curator_notes || ''
      };
      
      await weeklyBathsService.createWeeklyBath(bathData);
      // Após criar, recarrega estritamente a semana selecionada
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

  // Handlers de edição e rejeição
  const handleEdit = (bath: WeeklyBath) => {
    setEditingBath({ ...bath });
    // Preservar estado atual se já houver interação do usuário; caso contrário, inicializar pelo dado do banho
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

  // Removido: função de salvar edição não utilizada

  const handleReject = async (id: string) => {
    try {
      // Remover integração, se existir
      await integrationService.removeIntegration(id);
      // Marcar como rejeitado e garantir que não fique sinalizado para jornada
      await weeklyBathsService.updateWeeklyBath(id, { approved: false, add_to_journey: false });
      // Recarregar lista
      await loadBaths();
    } catch (err) {
      console.error('Erro ao rejeitar banho:', err);
      setError('Erro ao rejeitar banho');
    }
  };

  // Integration handlers
  const handleToggleIntegration = async (bathId: string, enabled: boolean) => {
    setIntegrationEnabled(prev => ({ ...prev, [bathId]: enabled }));
    if (!enabled) {
      // Não resetar a seleção do pet; apenas fechar o preview
      setShowPreview(prev => ({ ...prev, [bathId]: false }));
    }
  };

  const handleSelectPetForBath = (bathId: string, pet: Pet | null) => {
    setSelectedPets(prev => ({ ...prev, [bathId]: pet }));
    setShowPreview(prev => ({ ...prev, [bathId]: false }));
    setPreviewByBath(prev => ({ ...prev, [bathId]: null }));
  };

  const handleGeneratePreview = async (bathId: string) => {
    const bath = baths.find(b => b.id === bathId);
    const pet = selectedPets[bathId];
    
    if (!bath || !pet) return;
    
    try {
      // Gerar preview específico para o banho selecionado
      const preview = await integrationService.generateIntegrationPreview(bath.id);
      setPreviewByBath(prev => ({ ...prev, [bathId]: preview }));
      setShowPreview(prev => ({ ...prev, [bathId]: true }));
    } catch (err) {
      console.error('Erro ao gerar preview:', err);
      setError('Erro ao gerar preview da integração');
    }
  };

  const handleClosePreview = (bathId: string) => {
    setShowPreview(prev => ({ ...prev, [bathId]: false }));
    setPreviewByBath(prev => ({ ...prev, [bathId]: null }));
    clearPreview();
  };

  const handleCloseActivePreview = () => {
    const activePreviewBathId = Object.keys(showPreview).find(key => showPreview[key]);
    if (activePreviewBathId) {
      handleClosePreview(activePreviewBathId);
    } else {
      // Fallback: limpar todos previews
      setShowPreview({});
      setPreviewByBath({});
      clearPreview();
    }
  };

  // Helper function to format week display
  const formatWeekDisplay = (weekStart: string) => {
    // Parse YYYY-MM-DD como data local para evitar shift de fuso
    const [y, m, d] = weekStart.split('-').map(Number);
    const startDate = new Date(y, (m || 1) - 1, d || 1);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const range = `${format(startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })}`;
    const isCurrent = weekStart === getCurrentWeekStart();
    return isCurrent ? `${range} (Atual)` : range;
  };

  // Component for bath card with integration
  const BathCard = React.memo(({ bath }: { bath: WeeklyBath }) => {
    const isIntegrationEnabled = integrationEnabled[bath.id] || false;
    const selectedPet = selectedPets[bath.id];
    const showPreviewForBath = showPreview[bath.id] || false;
    const isApproving = approvingWithIntegration[bath.id] || false;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* Image */}
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={bath.image_url}
            alt={`Banho do ${bath.pet_name}`}
            className="w-full h-48 object-cover"
          />
          
          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            {bath.approved === true ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Check className="h-3 w-3 mr-1" />
                Aprovado
              </span>
            ) : bath.approved === false ? (
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

          {/* Integration Badge (reflete estado atual ou dados do banho) */}
          {(bath.journey_event_id || integrationEnabled[bath.id] || bath.add_to_journey) && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Sparkles className="h-3 w-3 mr-1" />
                {bath.journey_event_id ? 'Na Jornada' : (integrationEnabled[bath.id] || bath.add_to_journey ? 'Adicionar à Jornada' : '')}
              </span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          {editingBath?.id === bath.id ? (
            // Edit Mode (agora também com integração)
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
                value={editingBath.curator_notes || ''}
                onChange={(e) => setEditingBath(prev => prev ? { ...prev, curator_notes: e.target.value } : prev)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                rows={2}
                placeholder="Notas do curador"
                autoFocus
              />

              {/* Integration Section - sempre visível no modo edição */}
              <div className="space-y-3 pt-2 border-t border-gray-100">

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`integration-${bath.id}`}
                    checked={isIntegrationEnabled}
                    onChange={(e) => handleToggleIntegration(bath.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`integration-${bath.id}`} className="text-sm font-medium text-gray-700 flex items-center">
                    <Sparkles className="h-4 w-4 mr-1 text-blue-500" />
                    Incluir na Jornada de Crescimento
                  </label>
                </div>

                {/* Pet Selector - sempre visível e independente da integração */}
                <div className="space-y-2">
                  <PetSelector
                    pets={pets}
                    selectedPet={selectedPet}
                    onSelectPet={(pet) => handleSelectPetForBath(bath.id, pet)}
                    placeholder="Selecione o pet para adicionar à jornada..."
                    showValidation={true}
                  />
                  {selectedPet && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleGeneratePreview(bath.id)}
                        disabled={integrationLoading}
                        className="flex items-center px-3 py-1 text-blue-600 border border-blue-200 rounded text-sm hover:bg-blue-50 disabled:opacity-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {integrationLoading ? 'Gerando...' : 'Preview'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Integration Preview */}
                {showPreviewForBath && previewData && selectedPet && (
                  <IntegrationPreviewCompact
                    bath={bath}
                    pet={selectedPet}
                    className="mt-2"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                {bath.approved !== true && (
                  <button
                    onClick={() => handleApprove(bath.id)}
                    disabled={isApproving}
                    className="flex-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {isApproving ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Aprovando...
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        {isIntegrationEnabled ? 'Aprovar + Jornada' : 'Aprovar'}
                      </>
                    )}
                  </button>
                )}

                {/* Botão Recusar independente da integração */}
                {bath.approved !== false && (
                  <button
                    onClick={() => handleReject(bath.id)}
                    className="flex-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors flex items-center justify-center"
                    title="Recusar"
                  >
                    <X className="h-3 w-3 mr-1" />
                    <span>Recusar</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir este banho? Esta ação não pode ser desfeita.')) {
                      handleDelete(bath.id)
                    }
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                  title="Excluir"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Excluir</span>
                </button>
                <button
                  onClick={() => handleEdit(bath)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <Edit3 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            // View Mode with Integration
            <div className="space-y-3">
              {/* Evitar re-render desnecessário do card no modo view */}
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Dog className="h-4 w-4 mr-2 text-primary" />
                  {bath.pet_name}
                </h3>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  {(() => { const [y,m,d] = bath.bath_date.split('-').map(Number); const dt = new Date(y,(m||1)-1,d||1); return format(dt, 'dd/MM/yyyy', { locale: ptBR }); })()}
                </p>
              </div>
              
              {bath.curator_notes && (
                <p className="text-sm text-gray-700">{bath.curator_notes}</p>
              )}

              {/* Integration Section - sempre visível (mesmo se aprovado) */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                {/* Integration Toggle - sempre visível */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`integration-${bath.id}`}
                    checked={isIntegrationEnabled}
                    onChange={(e) => handleToggleIntegration(bath.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`integration-${bath.id}`} className="text-sm font-medium text-gray-700 flex items-center">
                    <Sparkles className="h-4 w-4 mr-1 text-blue-500" />
                    Incluir na Jornada de Crescimento
                  </label>
                </div>

                {/* Pet Selector */}
                {isIntegrationEnabled && (
                  <div className="space-y-2">
                    <PetSelector
                      pets={pets}
                      selectedPet={selectedPet}
                      onSelectPet={(pet) => handleSelectPetForBath(bath.id, pet)}
                      placeholder="Selecione o pet para adicionar à jornada..."
                      showValidation={true}
                    />
                    
                    {/* Preview Button */}
                    {selectedPet && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleGeneratePreview(bath.id)}
                          disabled={integrationLoading}
                          className="flex items-center px-3 py-1 text-blue-600 border border-blue-200 rounded text-sm hover:bg-blue-50 disabled:opacity-50"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          {integrationLoading ? 'Gerando...' : 'Preview'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Integration Preview */}
                {showPreviewForBath && previewByBath[bath.id] && selectedPet && (
                  <IntegrationPreviewCompact
                    bath={bath}
                    pet={selectedPet}
                    className="mt-2"
                  />
                )}
              </div>
              
              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                {bath.approved !== true && (
                  <button
                    onClick={() => handleApprove(bath.id)}
                    disabled={isApproving}
                    className="flex-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {isApproving ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Aprovando...
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        {isIntegrationEnabled ? 'Aprovar + Jornada' : 'Aprovar'}
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir este banho? Esta ação não pode ser desfeita.')) {
                      handleDelete(bath.id)
                    }
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                  title="Excluir"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Excluir</span>
                </button>
                
                <button
                  onClick={() => handleEdit(bath)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <Edit3 className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  });

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
          <p className="text-gray-600 mt-1">Gerencie as fotos que aparecerão na seção "Hall da Fama - Quem passou por aqui na última semana?"</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Week Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[200px]"
            >
              {availableWeeks.map((week) => (
                <option key={week} value={week}>
                  {formatWeekDisplay(week)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Banho
          </button>
        </div>
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

      {/* Integration Error */}
      {integrationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{integrationError}</p>
          <button
            onClick={clearIntegrationError}
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
                  Notas do Curador
                </label>
                <textarea
                  value={newBath.curator_notes || ''}
                  onChange={(e) => setNewBath({ ...newBath, curator_notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  placeholder="Notas opcionais sobre o banho"
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
            <BathCard key={bath.id} bath={bath} />
          ))}
        </div>
      )}

      {/* Integration Preview Modal */}
      {showPreview && Object.keys(showPreview).some(key => showPreview[key]) && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Preview da Integração</h3>
                <button
                  onClick={handleCloseActivePreview}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {(() => {
                const activePreviewBathId = Object.keys(showPreview).find(key => showPreview[key]);
                const activeBath = activePreviewBathId ? baths.find(b => b.id === activePreviewBathId) || baths[0] : baths[0];
                const activePet = activePreviewBathId ? (selectedPets[activePreviewBathId] || pets[0]) : (Object.values(selectedPets).find(p => p) || pets[0]);
                const activePreview = activePreviewBathId ? (previewByBath[activePreviewBathId] || null) : null;
                return (
                  <IntegrationPreview
                    bath={activeBath}
                    pet={activePet}
                    previewData={activePreview}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyBathsCuration;
