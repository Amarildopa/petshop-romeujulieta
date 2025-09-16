import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Save,
  RotateCcw,
  Eye,
  Settings,
  Download,
  Upload,
  Check,
  X,
  Heart,
  Star,
  ShoppingBag,
  Calendar,
  User,
  Bell,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';

// Paletas de cores predefinidas
const COLOR_PRESETS = {
  default: {
    name: 'Rosa Pastel',
    primary: '#F8BBD9',
    primaryLight: '#FDE2F3',
    primaryDark: '#F472B6',
    secondary: '#E0E7FF',
    secondaryLight: '#EEF2FF',
    secondaryDark: '#C7D2FE',
    accent: '#FEF3C7',
    accentLight: '#FFFBEB',
    accentDark: '#FDE68A',
    surface: '#FEF7FF',
    surfaceDark: '#FCE7F3',
    textColor: '#6B7280',
    textColorDark: '#374151'
  },
  blue: {
    name: 'Azul Pastel',
    primary: '#BFDBFE',
    primaryLight: '#DBEAFE',
    primaryDark: '#93C5FD',
    secondary: '#A7F3D0',
    secondaryLight: '#D1FAE5',
    secondaryDark: '#6EE7B7',
    accent: '#FEF3C7',
    accentLight: '#FFFBEB',
    accentDark: '#FCD34D',
    surface: '#F0F9FF',
    surfaceDark: '#E0F2FE',
    textColor: '#64748B',
    textColorDark: '#334155'
  },
  pink: {
    name: 'Rosa Delicado',
    primary: '#F8BBD9',
    primaryLight: '#FDE2F3',
    primaryDark: '#F472B6',
    secondary: '#BFDBFE',
    secondaryLight: '#DBEAFE',
    secondaryDark: '#93C5FD',
    accent: '#FEF3C7',
    accentLight: '#FFFBEB',
    accentDark: '#FCD34D',
    surface: '#FEF7FF',
    surfaceDark: '#FCE7F3',
    textColor: '#64748B',
    textColorDark: '#334155'
  },
  green: {
    name: 'Verde Pastel',
    primary: '#A7F3D0',
    primaryLight: '#D1FAE5',
    primaryDark: '#6EE7B7',
    secondary: '#F8BBD9',
    secondaryLight: '#FDE2F3',
    secondaryDark: '#F472B6',
    accent: '#FEF3C7',
    accentLight: '#FFFBEB',
    accentDark: '#FCD34D',
    surface: '#F0FDF4',
    surfaceDark: '#DCFCE7',
    textColor: '#64748B',
    textColorDark: '#334155'
  },
  yellow: {
    name: 'Amarelo Pastel',
    primary: '#FEF3C7',
    primaryLight: '#FFFBEB',
    primaryDark: '#FCD34D',
    secondary: '#F8BBD9',
    secondaryLight: '#FDE2F3',
    secondaryDark: '#F472B6',
    accent: '#A7F3D0',
    accentLight: '#D1FAE5',
    accentDark: '#6EE7B7',
    surface: '#FFFBEB',
    surfaceDark: '#FEF3C7',
    textColor: '#64748B',
    textColorDark: '#334155'
  }
};

const ThemeCustomizer: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof COLOR_PRESETS>('default');
  const [customColors, setCustomColors] = useState(COLOR_PRESETS.default);
  const [previewMode, setPreviewMode] = useState(false);

  // Aplicar cores customizadas via CSS variables
  const applyCustomColors = (colors: typeof COLOR_PRESETS.default) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-light', colors.primaryLight);
    root.style.setProperty('--color-primary-dark', colors.primaryDark);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-secondary-light', colors.secondaryLight);
    root.style.setProperty('--color-secondary-dark', colors.secondaryDark);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-accent-light', colors.accentLight);
    root.style.setProperty('--color-accent-dark', colors.accentDark);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-surface-dark', colors.surfaceDark);
    root.style.setProperty('--color-text', colors.textColor);
    root.style.setProperty('--color-text-dark', colors.textColorDark);
  };

  const handlePresetChange = (preset: keyof typeof COLOR_PRESETS) => {
    setSelectedPreset(preset);
    setCustomColors(COLOR_PRESETS[preset]);
    if (previewMode) {
      applyCustomColors(COLOR_PRESETS[preset]);
    }
  };

  const handleColorChange = (colorKey: keyof typeof COLOR_PRESETS.default, value: string) => {
    const newColors = { ...customColors, [colorKey]: value };
    setCustomColors(newColors);
    if (previewMode) {
      applyCustomColors(newColors);
    }
  };

  const togglePreview = () => {
    if (!previewMode) {
      applyCustomColors(customColors);
    } else {
      // Restaurar cores padrão
      applyCustomColors(COLOR_PRESETS.default);
    }
    setPreviewMode(!previewMode);
  };

  const resetToDefault = () => {
    setSelectedPreset('default');
    setCustomColors(COLOR_PRESETS.default);
    applyCustomColors(COLOR_PRESETS.default);
  };

  const exportTheme = () => {
    const themeData = {
      name: `Tema Personalizado - ${new Date().toLocaleDateString()}`,
      colors: customColors,
      createdAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tema-personalizado.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: customColors.surface }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: `${customColors.accent}20`, backgroundColor: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: customColors.textColorDark }}>
                🎨 Personalizador de Tema
              </h1>
              <p className="mt-2" style={{ color: customColors.textColor }}>
                Configure as cores do sistema PetShop Romeu & Julieta
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePreview}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  previewMode ? 'text-white' : 'border'
                }`}
                style={{
                  backgroundColor: previewMode ? customColors.primary : 'transparent',
                  borderColor: customColors.primary,
                  color: previewMode ? 'white' : customColors.primary
                }}
              >
                <Eye className="h-4 w-4" />
                <span>{previewMode ? 'Sair do Preview' : 'Preview'}</span>
              </button>
              <button
                onClick={resetToDefault}
                className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                style={{ borderColor: customColors.accent, color: customColors.textColorDark }}
              >
                <RotateCcw className="h-4 w-4" />
                <span>Resetar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Painel de Controle */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderColor: `${customColors.accent}20` }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: customColors.textColorDark }}>
                <Settings className="h-5 w-5 inline mr-2" />
                Configurações
              </h2>

              {/* Presets */}
              <div className="mb-6">
                <h3 className="font-medium mb-3" style={{ color: customColors.textColorDark }}>Temas Predefinidos</h3>
                <div className="space-y-2">
                  {Object.entries(COLOR_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => handlePresetChange(key as keyof typeof COLOR_PRESETS)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        selectedPreset === key ? 'border-2' : 'border'
                      }`}
                      style={{
                        borderColor: selectedPreset === key ? preset.primary : `${customColors.accent}30`,
                        backgroundColor: selectedPreset === key ? `${preset.primary}10` : 'transparent'
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }}></div>
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondary }}></div>
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accent }}></div>
                        </div>
                        <span className="font-medium" style={{ color: customColors.textColorDark }}>{preset.name}</span>
                      </div>
                      {selectedPreset === key && <Check className="h-4 w-4" style={{ color: preset.primary }} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cores Customizadas */}
              <div className="mb-6">
                <h3 className="font-medium mb-3" style={{ color: customColors.textColorDark }}>Cores Personalizadas</h3>
                <div className="space-y-4">
                  {Object.entries(customColors).filter(([key]) => key !== 'name').map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm font-medium capitalize" style={{ color: customColors.textColor }}>
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={value as string}
                          onChange={(e) => handleColorChange(key as keyof typeof COLOR_PRESETS.default, e.target.value)}
                          className="w-8 h-8 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={value as string}
                          onChange={(e) => handleColorChange(key as keyof typeof COLOR_PRESETS.default, e.target.value)}
                          className="w-20 px-2 py-1 text-xs border rounded"
                          style={{ borderColor: `${customColors.accent}30` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações */}
              <div className="space-y-3">
                <button
                  onClick={exportTheme}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium text-white transition-colors"
                  style={{ backgroundColor: customColors.primary }}
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar Tema</span>
                </button>
                <button
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg font-medium transition-colors"
                  style={{ borderColor: customColors.secondary, color: customColors.secondary }}
                >
                  <Upload className="h-4 w-4" />
                  <span>Importar Tema</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preview dos Componentes */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Botões */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: customColors.textColorDark }}>Botões</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <button
                    className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
                    style={{ backgroundColor: customColors.primary }}
                  >
                    Primário
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
                    style={{ backgroundColor: customColors.secondary }}
                  >
                    Secundário
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
                    style={{ backgroundColor: customColors.accent }}
                  >
                    Accent
                  </button>
                  <button
                    className="px-4 py-2 border rounded-lg font-medium transition-colors"
                    style={{ borderColor: customColors.primary, color: customColors.primary }}
                  >
                    Outline
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: customColors.surfaceDark, color: customColors.textColorDark }}
                  >
                    Ghost
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium text-red-600 bg-red-50 border border-red-200"
                  >
                    Danger
                  </button>
                </div>
              </div>

              {/* Formulários */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: customColors.textColorDark }}>Formulários</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: customColors.textColor }}>Nome</label>
                    <input
                      type="text"
                      placeholder="Digite seu nome"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                      style={{ borderColor: `${customColors.accent}50`, '--tw-ring-color': customColors.primary } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: customColors.textColor }}>Email</label>
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                      style={{ borderColor: `${customColors.accent}50`, '--tw-ring-color': customColors.primary } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: customColors.textColor }}>Categoria</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                      style={{ borderColor: `${customColors.accent}50`, '--tw-ring-color': customColors.primary } as React.CSSProperties}
                    >
                      <option>Selecione uma categoria</option>
                      <option>Banho e Tosa</option>
                      <option>Veterinário</option>
                      <option>Hotel</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: customColors.textColorDark }}>Cards e Containers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-xl p-4" style={{ borderColor: `${customColors.accent}20` }}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${customColors.primary}20` }}>
                        <Heart className="h-5 w-5" style={{ color: customColors.primary }} />
                      </div>
                      <div>
                        <h4 className="font-medium" style={{ color: customColors.textColorDark }}>Banho Completo</h4>
                        <p className="text-sm" style={{ color: customColors.textColor }}>Serviço premium</p>
                      </div>
                    </div>
                    <p className="text-sm mb-3" style={{ color: customColors.textColor }}>Banho completo com produtos premium e secagem profissional.</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: customColors.primary }}>R$ 45,00</span>
                      <button
                        className="px-3 py-1 rounded text-sm font-medium text-white"
                        style={{ backgroundColor: customColors.primary }}
                      >
                        Agendar
                      </button>
                    </div>
                  </div>

                  <div className="border rounded-xl p-4" style={{ borderColor: `${customColors.secondary}20` }}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${customColors.secondary}20` }}>
                        <Star className="h-5 w-5" style={{ color: customColors.secondary }} />
                      </div>
                      <div>
                        <h4 className="font-medium" style={{ color: customColors.textColorDark }}>Produto Premium</h4>
                        <p className="text-sm" style={{ color: customColors.textColor }}>Shampoo especial</p>
                      </div>
                    </div>
                    <p className="text-sm mb-3" style={{ color: customColors.textColor }}>Shampoo hipoalergênico para peles sensíveis.</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: customColors.secondary }}>R$ 29,90</span>
                      <button
                        className="px-3 py-1 rounded text-sm font-medium text-white"
                        style={{ backgroundColor: customColors.secondary }}
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notificações e Alertas */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: customColors.textColorDark }}>Notificações e Alertas</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Sucesso!</p>
                      <p className="text-sm text-green-600">Agendamento realizado com sucesso.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <Info className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">Informação</p>
                      <p className="text-sm text-blue-600">Seu pet chegou para o banho.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">Atenção</p>
                      <p className="text-sm text-yellow-600">Agendamento em 1 hora.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-red-50 border border-red-200">
                    <X className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">Erro</p>
                      <p className="text-sm text-red-600">Falha ao processar pagamento.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navegação e Menus */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: customColors.textColorDark }}>Navegação</h3>
                <div className="space-y-4">
                  {/* Tabs */}
                  <div className="border-b" style={{ borderColor: `${customColors.accent}20` }}>
                    <nav className="flex space-x-8">
                      <button
                        className="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                        style={{ borderColor: customColors.primary, color: customColors.primary }}
                      >
                        Serviços
                      </button>
                      <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm transition-colors" style={{ color: customColors.textColor }}>
                        Produtos
                      </button>
                      <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm transition-colors" style={{ color: customColors.textColor }}>
                        Agendamentos
                      </button>
                    </nav>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-2 rounded-lg transition-colors" style={{ backgroundColor: `${customColors.primary}10` }}>
                      <Calendar className="h-5 w-5" style={{ color: customColors.primary }} />
                      <span className="font-medium" style={{ color: customColors.textColorDark }}>Agendamentos</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <ShoppingBag className="h-5 w-5" style={{ color: customColors.textColor }} />
                      <span style={{ color: customColors.textColorDark }}>Loja</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <User className="h-5 w-5" style={{ color: customColors.textColor }} />
                      <span style={{ color: customColors.textColorDark }}>Perfil</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges e Tags */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: customColors.textColorDark }}>Badges e Tags</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: customColors.primary }}>
                    Premium
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: customColors.secondary }}>
                    Novo
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: customColors.accent }}>
                    Promoção
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium border" style={{ borderColor: customColors.primary, color: customColors.primary }}>
                    Popular
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${customColors.surfaceDark}`, color: customColors.textColorDark }}>
                    Disponível
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;