import React from 'react';
import { Calendar, MapPin, Sparkles, Dog, Camera, Clock } from 'lucide-react';
import type { IntegrationPreviewData, Pet } from '../types/integration';
import type { WeeklyBath } from '../services/weeklyBathsService';

interface IntegrationPreviewProps {
  previewData: IntegrationPreviewData | null;
  bath: WeeklyBath;
  pet: Pet;
  isLoading?: boolean;
  onClose?: () => void;
}

export function IntegrationPreview({
  previewData,
  bath,
  pet,
  isLoading = false,
  onClose
}: IntegrationPreviewProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Gerando preview...</span>
        </div>
      </div>
    );
  }

  if (!previewData) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Preview da Jornada
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Preview Card - How it will appear in the journey */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-start space-x-4">
          {/* Event Image */}
          <div className="flex-shrink-0">
            {bath.image_url ? (
              <img
                src={bath.image_url}
                alt="Banho e Tosa"
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-blue-100 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="text-lg font-semibold text-gray-900">
                {previewData.event_title || `Banho e Tosa - ${pet.name}`}
              </h4>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Sparkles className="h-3 w-3 mr-1" />
                Banho Semanal
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-3">
              {previewData.event_description || 'Evento criado automaticamente a partir dos banhos semanais.'}
            </p>

            {/* Event Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(previewData.event_date || bath.bath_date)}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{formatTime(previewData.event_date || bath.bath_date)}</span>
              </div>

              {previewData.location && (
                <div className="flex items-center space-x-2 text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{previewData.location}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 text-gray-500">
                <Camera className="h-4 w-4" />
                <span>Foto incluída</span>
              </div>
            </div>

            {/* Pet Info */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <Dog className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Para: <span className="font-medium">{pet.name}</span>
                  {pet.breed && ` (${pet.breed})`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Info */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">
          Como funcionará a integração:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• O evento será criado automaticamente na jornada do pet</li>
          <li>• A foto do banho será incluída no evento</li>
          <li>• O evento ficará vinculado ao banho semanal original</li>
          <li>• Aparecerá na timeline da jornada com badge identificador</li>
        </ul>
      </div>

      {/* Metadata Preview */}
      {previewData.metadata && Object.keys(previewData.metadata).length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">
            Informações adicionais:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(previewData.metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 capitalize">
                  {key.replace('_', ' ')}:
                </span>
                <span className="text-gray-900 font-medium">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Hint */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-500">
          Este preview mostra como o evento aparecerá na Jornada de Crescimento após a aprovação
        </p>
      </div>
    </div>
  );
}

// Compact version for inline preview
export function IntegrationPreviewCompact({
  bath,
  pet,
  className = ""
}: {
  bath: WeeklyBath;
  pet: Pet;
  className?: string;
}) {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {bath.image_url ? (
            <img
              src={bath.image_url}
              alt="Preview"
              className="h-10 w-10 rounded object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-blue-900">
              Banho e Tosa - {pet.name}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              <Sparkles className="h-3 w-3 mr-1" />
              Jornada
            </span>
          </div>
          <p className="text-xs text-blue-700">
            Será adicionado à jornada automaticamente
          </p>
        </div>
      </div>
    </div>
  );
}