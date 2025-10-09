import React from 'react';
import { RotateCcw, Palette } from 'lucide-react';
import { useTheme, ORIGINAL_COLORS } from '../hooks/useTheme';

const ThemeCustomizer: React.FC = () => {
  const {
    colors,
    isLoaded,
    updateColor,
    restoreSection,
    restoreAll,
    isUsingOriginal,
    isAllOriginal
  } = useTheme();

  // Mostrar loading enquanto as cores não foram carregadas
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações do tema...</p>
        </div>
      </div>
    );
  }

  // Alterar cor específica
  const handleColorChange = (section: keyof typeof ORIGINAL_COLORS, colorKey: string, value: string) => {
    updateColor(section, colorKey, value);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Palette className="h-8 w-8 text-pink-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">🎨 Personalizador Simples</h1>
          </div>
          <p className="text-gray-600">Configure as cores do sistema de forma simples e rápida</p>
          {!isAllOriginal && (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              ✨ Usando cores personalizadas
            </div>
          )}
        </div>

        {/* Seções de Configuração */}
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                📱 Header
                {isUsingOriginal('header') && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Original</span>
                )}
              </h2>
              <button
                onClick={() => restoreSection('header')}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Restaurar Original</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor de Fundo</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={colors.header.bg}
                    onChange={(e) => handleColorChange('header', 'bg', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors.header.bg}
                    onChange={(e) => handleColorChange('header', 'bg', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor do Texto</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={colors.header.textPrimary}
                    onChange={(e) => handleColorChange('header', 'textPrimary', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors.header.textPrimary}
                    onChange={(e) => handleColorChange('header', 'textPrimary', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor dos Links</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={colors.header.textDark}
                    onChange={(e) => handleColorChange('header', 'textDark', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors.header.textDark}
                    onChange={(e) => handleColorChange('header', 'textDark', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Landing Page */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                🏠 Landing Page
                {isUsingOriginal('landing') && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Original</span>
                )}
              </h2>
              <button
                onClick={() => restoreSection('landing')}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Restaurar Original</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor das Seções</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={colors.landing.bgMain}
                    onChange={(e) => handleColorChange('landing', 'bgMain', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors.landing.bgMain}
                    onChange={(e) => handleColorChange('landing', 'bgMain', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor de Destaque</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={colors.landing.bgSections}
                    onChange={(e) => handleColorChange('landing', 'bgSections', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors.landing.bgSections}
                    onChange={(e) => handleColorChange('landing', 'bgSections', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor dos Cards</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={colors.landing.cardBg}
                    onChange={(e) => handleColorChange('landing', 'cardBg', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors.landing.cardBg}
                    onChange={(e) => handleColorChange('landing', 'cardBg', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Componentes Gerais */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                🎯 Componentes
                {isUsingOriginal('components') && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Original</span>
                )}
              </h2>
              <button
                onClick={() => restoreSection('components')}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Restaurar Original</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor Primária</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={colors.components.primary}
                    onChange={(e) => handleColorChange('components', 'primary', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors.components.primary}
                    onChange={(e) => handleColorChange('components', 'primary', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor Secundária</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={colors.components.secondary}
                    onChange={(e) => handleColorChange('components', 'secondary', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors.components.secondary}
                    onChange={(e) => handleColorChange('components', 'secondary', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor de Destaque</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={colors.components.accent}
                    onChange={(e) => handleColorChange('components', 'accent', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors.components.accent}
                    onChange={(e) => handleColorChange('components', 'accent', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Restaurar Tudo */}
        <div className="mt-8 text-center">
          <button
            onClick={restoreAll}
            disabled={isAllOriginal}
            className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isAllOriginal
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
            }`}
          >
            <RotateCcw className="h-5 w-5" />
            <span>Restaurar Tudo ao Original</span>
          </button>
          {isAllOriginal && (
            <p className="mt-2 text-sm text-gray-500">Todas as cores já estão no padrão original</p>
          )}
        </div>

        {/* Preview das Cores */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview das Cores</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div 
                className="w-full h-16 rounded-lg border mb-2"
                style={{ backgroundColor: colors.header.bg }}
              ></div>
              <p className="text-sm text-gray-600">Header Fundo</p>
            </div>
            <div className="text-center">
              <div 
                className="w-full h-16 rounded-lg border mb-2"
                style={{ backgroundColor: colors.landing.bgSections }}
              ></div>
              <p className="text-sm text-gray-600">Landing Destaque</p>
            </div>
            <div className="text-center">
              <div 
                className="w-full h-16 rounded-lg border mb-2"
                style={{ backgroundColor: colors.components.primary }}
              ></div>
              <p className="text-sm text-gray-600">Primária</p>
            </div>
            <div className="text-center">
              <div 
                className="w-full h-16 rounded-lg border mb-2"
                style={{ backgroundColor: colors.components.secondary }}
              ></div>
              <p className="text-sm text-gray-600">Secundária</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;
