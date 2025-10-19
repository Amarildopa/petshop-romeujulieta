import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
// import { Badge } from './ui/badge';
// import { Separator } from './ui/separator';
import { useSimpleTheme } from '../hooks/useSimpleTheme';
import { toast } from 'sonner';
import { 
  Palette, 
  // Save, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Monitor,
  // Smartphone,
  Home,
  Settings,
  MousePointer
} from 'lucide-react';

const AdminThemeSimple: React.FC = () => {
  const { colors, loading, error, updateColor, resetToOriginal } = useSimpleTheme();
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Função para lidar com mudança de cor
  const handleColorChange = async (area: string, colorType: string, value: string) => {
    const success = await updateColor(area, colorType, value);
    if (success) {
      toast.success(`Cor ${area} ${colorType} atualizada com sucesso!`);
    } else {
      toast.error('Erro ao atualizar cor. Tente novamente.');
    }
  };

  // Função para resetar cores
  const handleReset = async () => {
    setSaving(true);
    const success = await resetToOriginal();
    if (success) {
      toast.success('Cores resetadas para os valores originais!');
    } else {
      toast.error('Erro ao resetar cores. Tente novamente.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando configurações de tema...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Erro ao carregar tema</h3>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Palette className="w-8 h-8" />
            Personalização Simplificada
          </h1>
          <p className="text-gray-600 mt-1">
            Configure apenas as cores essenciais do sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={previewMode ? "default" : "outline"}
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? 'Sair do Preview' : 'Preview'}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Resetar
          </Button>
        </div>
      </div>

      {/* Seções de Personalização */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Header (Cabeçalho)
            </CardTitle>
            <p className="text-sm text-gray-600">
              Cores do cabeçalho principal e navegação
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cor de Fundo */}
            <div className="space-y-2">
              <Label htmlFor="header-bg">Cor de Fundo</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="header-bg"
                  type="color"
                  value={colors.header_bg}
                  onChange={(e) => handleColorChange('header', 'bg', e.target.value)}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors.header_bg}
                  onChange={(e) => handleColorChange('header', 'bg', e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#FEF7FF"
                />
              </div>
            </div>

            {/* Cor do Texto */}
            <div className="space-y-2">
              <Label htmlFor="header-text">Cor do Texto</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="header-text"
                  type="color"
                  value={colors.header_text}
                  onChange={(e) => handleColorChange('header', 'text', e.target.value)}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors.header_text}
                  onChange={(e) => handleColorChange('header', 'text', e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#F8BBD9"
                />
              </div>
            </div>

            {/* Cor do Hover */}
            <div className="space-y-2">
              <Label htmlFor="header-hover">Cor do Hover</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="header-hover"
                  type="color"
                  value={colors.header_hover}
                  onChange={(e) => handleColorChange('header', 'hover', e.target.value)}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors.header_hover}
                  onChange={(e) => handleColorChange('header', 'hover', e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#F472B6"
                />
              </div>
            </div>

            {/* Preview do Header */}
            <div className="mt-4 p-3 rounded-lg border" style={{ backgroundColor: colors.header_bg }}>
              <div className="flex items-center justify-between">
                <span className="font-medium" style={{ color: colors.header_text }}>
                  PetShop Romeo & Julieta
                </span>
                <div className="flex gap-2">
                  <span className="text-sm" style={{ color: colors.header_text }}>Home</span>
                  <span className="text-sm" style={{ color: colors.header_text }}>Serviços</span>
                  <span className="text-sm" style={{ color: colors.header_text }}>Loja</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Landing Page */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Landing Page
            </CardTitle>
            <p className="text-sm text-gray-600">
              Cor de fundo da página inicial
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cor de Fundo */}
            <div className="space-y-2">
              <Label htmlFor="landing-bg">Cor de Fundo</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="landing-bg"
                  type="color"
                  value={colors.landing_bg}
                  onChange={(e) => handleColorChange('landing', 'bg', e.target.value)}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors.landing_bg}
                  onChange={(e) => handleColorChange('landing', 'bg', e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#FEF7FF"
                />
              </div>
            </div>

            {/* Preview da Landing */}
            <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: colors.landing_bg }}>
              <div className="text-center space-y-2">
                <h3 className="font-bold text-gray-800">Bem-vindos ao PetShop</h3>
                <p className="text-sm text-gray-600">Cuidamos do seu pet com amor e carinho</p>
                <div className="w-full h-2 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Dashboard
            </CardTitle>
            <p className="text-sm text-gray-600">
              Cor de fundo do painel administrativo
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cor de Fundo */}
            <div className="space-y-2">
              <Label htmlFor="dashboard-bg">Cor de Fundo</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="dashboard-bg"
                  type="color"
                  value={colors.dashboard_bg}
                  onChange={(e) => handleColorChange('dashboard', 'bg', e.target.value)}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors.dashboard_bg}
                  onChange={(e) => handleColorChange('dashboard', 'bg', e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#FFFBEB"
                />
              </div>
            </div>

            {/* Preview do Dashboard */}
            <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: colors.dashboard_bg }}>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Painel Administrativo</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-white rounded border text-xs text-center">Usuários</div>
                  <div className="p-2 bg-white rounded border text-xs text-center">Relatórios</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Botões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="w-5 h-5" />
              Botões
            </CardTitle>
            <p className="text-sm text-gray-600">
              Cores dos botões principais do sistema
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cor Primária */}
            <div className="space-y-2">
              <Label htmlFor="button-primary">Cor Primária</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="button-primary"
                  type="color"
                  value={colors.button_primary}
                  onChange={(e) => handleColorChange('button', 'primary', e.target.value)}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors.button_primary}
                  onChange={(e) => handleColorChange('button', 'primary', e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#F8BBD9"
                />
              </div>
            </div>

            {/* Cor Secundária */}
            <div className="space-y-2">
              <Label htmlFor="button-secondary">Cor Secundária</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="button-secondary"
                  type="color"
                  value={colors.button_secondary}
                  onChange={(e) => handleColorChange('button', 'secondary', e.target.value)}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors.button_secondary}
                  onChange={(e) => handleColorChange('button', 'secondary', e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#BFDBFE"
                />
              </div>
            </div>

            {/* Botão Entrar - Fundo */}
            <div className="space-y-2">
              <Label htmlFor="button-login-bg">Botão Entrar - Fundo</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="button-login-bg"
                  type="color"
                  value={colors.button_login_bg}
                  onChange={(e) => handleColorChange('button', 'login_bg', e.target.value)}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors.button_login_bg}
                  onChange={(e) => handleColorChange('button', 'login_bg', e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#f8fafc"
                />
              </div>
            </div>

            {/* Botão Entrar - Texto */}
            <div className="space-y-2">
              <Label htmlFor="button-login-text">Botão Entrar - Texto</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="button-login-text"
                  type="color"
                  value={colors.button_login_text}
                  onChange={(e) => handleColorChange('button', 'login_text', e.target.value)}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors.button_login_text}
                  onChange={(e) => handleColorChange('button', 'login_text', e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#e05389"
                />
              </div>
            </div>

            {/* Botão Cadastrar - Fundo */}
            <div className="space-y-2">
              <Label htmlFor="button-register-bg">Botão Cadastrar - Fundo</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="button-register-bg"
                  type="color"
                  value={colors.button_register_bg}
                  onChange={(e) => handleColorChange('button', 'register_bg', e.target.value)}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors.button_register_bg}
                  onChange={(e) => handleColorChange('button', 'register_bg', e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#e05389"
                />
              </div>
            </div>

            {/* Botão Cadastrar - Texto */}
            <div className="space-y-2">
              <Label htmlFor="button-register-text">Botão Cadastrar - Texto</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="button-register-text"
                  type="color"
                  value={colors.button_register_text}
                  onChange={(e) => handleColorChange('button', 'register_text', e.target.value)}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={colors.button_register_text}
                  onChange={(e) => handleColorChange('button', 'register_text', e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Preview dos Botões */}
            <div className="mt-4 space-y-3">
              <div className="flex gap-2 flex-wrap">
                <button 
                  className="px-4 py-2 rounded text-white text-sm font-medium"
                  style={{ backgroundColor: colors.button_primary }}
                >
                  Botão Primário
                </button>
                <button 
                  className="px-4 py-2 rounded text-white text-sm font-medium"
                  style={{ backgroundColor: colors.button_secondary }}
                >
                  Botão Secundário
                </button>
                <button 
                  className="px-4 py-2 rounded text-sm font-medium border"
                  style={{ 
                    backgroundColor: colors.button_login_bg,
                    color: colors.button_login_text,
                    borderColor: colors.button_login_text
                  }}
                >
                  Entrar
                </button>
                <button 
                  className="px-4 py-2 rounded text-sm font-medium"
                  style={{ 
                    backgroundColor: colors.button_register_bg,
                    color: colors.button_register_text
                  }}
                >
                  Cadastrar
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações e Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">6</div>
              <div className="text-sm text-green-700">Cores Configuráveis</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">4</div>
              <div className="text-sm text-blue-700">Áreas do Sistema</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-purple-700">Funcional</div>
            </div>
          </div>

          <div className="border-t border-gray-200 my-4" />

          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Como usar:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Clique no quadrado colorido ou digite o código hex para alterar uma cor</li>
              <li>• As alterações são salvas automaticamente no banco de dados</li>
              <li>• Use o botão Preview para ver as mudanças em tempo real</li>
              <li>• O botão Resetar restaura todas as cores para os valores originais</li>
              <li>• As cores são aplicadas imediatamente em todo o sistema</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminThemeSimple;