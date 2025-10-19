import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { normalizeColor } from '../utils/colorUtils';

// Interface para as cores simplificadas
interface SimpleThemeColors {
  header_bg: string;
  header_text: string;
  header_hover: string;
  landing_bg: string;
  dashboard_bg: string;
  button_primary: string;
  button_secondary: string;
  button_login_bg: string;
  button_login_text: string;
  button_register_bg: string;
  button_register_text: string;
}

// Interface para o hook
interface UseSimpleTheme {
  colors: SimpleThemeColors;
  loading: boolean;
  error: string | null;
  updateColor: (area: string, colorType: string, value: string) => Promise<boolean>;
  resetToOriginal: () => Promise<boolean>;
  applyColors: () => void;
}

// Cores originais do sistema
const ORIGINAL_COLORS: SimpleThemeColors = {
  header_bg: '#FEF7FF',
  header_text: '#F8BBD9',
  header_hover: '#F472B6',
  landing_bg: '#FEF7FF',
  dashboard_bg: '#FFFBEB',
  button_primary: '#F8BBD9',
  button_secondary: '#BFDBFE',
  button_login_bg: '#f8fafc',
  button_login_text: '#e05389',
  button_register_bg: '#e05389',
  button_register_text: '#ffffff'
};

// Mapeamento das cores para variáveis CSS simplificadas
const cssVariableMap = {
  header_bg: '--simple-header-bg',
  header_text: '--simple-header-text',
  header_hover: '--simple-header-hover',
  landing_bg: '--simple-landing-bg',
  dashboard_bg: '--simple-dashboard-bg',
  button_primary: '--simple-button-primary',
  button_secondary: '--simple-button-secondary',
  button_login_bg: '--simple-button-login-bg',
  button_login_text: '--simple-button-login-text',
  button_register_bg: '--simple-button-register-bg',
  button_register_text: '--simple-button-register-text'
}

export const useSimpleTheme = (): UseSimpleTheme => {
  const [colors, setColors] = useState<SimpleThemeColors>(ORIGINAL_COLORS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Aplicar cores ao DOM
  const applyColorsToDOM = useCallback((colorsToApply: SimpleThemeColors) => {
    const root = document.documentElement
    
    Object.entries(colorsToApply).forEach(([key, value]) => {
      const cssVar = cssVariableMap[key as keyof typeof cssVariableMap]
      if (cssVar && value) {
        root.style.setProperty(cssVar, value)
      }
    })
  }, [])

  // Função para carregar cores do banco de dados
  const loadColors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('simple_theme_colors')
        .select('area, color_type, color_value')
        .eq('is_active', true);

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        const loadedColors = { ...ORIGINAL_COLORS };

        data.forEach((row) => {
          const key = `${row.area}_${row.color_type}` as keyof SimpleThemeColors;
          if (key in loadedColors) {
            loadedColors[key] = row.color_value;
          }
        });

        setColors(loadedColors);
        console.log('[SIMPLE_THEME] Cores carregadas do banco:', loadedColors);
      } else {
        console.log('[SIMPLE_THEME] Nenhuma cor encontrada, usando cores originais');
        setColors(ORIGINAL_COLORS);
      }
    } catch (err) {
      console.error('[SIMPLE_THEME] Erro ao carregar cores:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setColors(ORIGINAL_COLORS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para atualizar uma cor específica
  const updateColor = useCallback(async (area: string, colorType: string, value: string): Promise<boolean> => {
    try {
      setError(null);

      console.log(`[SIMPLE_THEME] Tentando atualizar: ${area}_${colorType} = ${value}`);

      // Normalizar e validar cor
      let normalizedColor: string;
      try {
        normalizedColor = normalizeColor(value);
        console.log(`[SIMPLE_THEME] Cor normalizada: ${value} -> ${normalizedColor}`);
      } catch (error) {
        console.error(`[SIMPLE_THEME] Valor inválido: ${value}`, error);
        throw new Error('Valor de cor inválido. Use formato #RRGGBB, #RGB, rgb(), rgba(), hsl(), hsla() ou nomes de cores CSS válidos');
      }

      // Atualizar no banco de dados com a cor normalizada
      const { error: updateError } = await supabase
        .from('simple_theme_colors')
        .update({ 
          color_value: normalizedColor,
          updated_at: new Date().toISOString()
        })
        .eq('area', area)
        .eq('color_type', colorType)
        .eq('is_active', true);

      if (updateError) {
        throw updateError;
      }

      // Atualizar estado local com a cor normalizada
      const key = `${area}_${colorType}` as keyof SimpleThemeColors;
      if (key in colors) {
        setColors(prev => ({
          ...prev,
          [key]: normalizedColor
        }));
      }

      console.log(`[SIMPLE_THEME] Cor atualizada: ${area}_${colorType} = ${normalizedColor}`);
      return true;
    } catch (err) {
      console.error('[SIMPLE_THEME] Erro ao atualizar cor:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cor');
      return false;
    }
  }, [colors]);

  // Função para resetar para cores originais
  const resetToOriginal = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);

      // Resetar todas as cores no banco de dados
      const updates = [
        { area: 'header', color_type: 'bg', color_value: ORIGINAL_COLORS.header_bg },
        { area: 'header', color_type: 'text', color_value: ORIGINAL_COLORS.header_text },
        { area: 'landing', color_type: 'bg', color_value: ORIGINAL_COLORS.landing_bg },
        { area: 'dashboard', color_type: 'bg', color_value: ORIGINAL_COLORS.dashboard_bg },
        { area: 'buttons', color_type: 'primary', color_value: ORIGINAL_COLORS.button_primary },
        { area: 'buttons', color_type: 'secondary', color_value: ORIGINAL_COLORS.button_secondary },
        { area: 'button', color_type: 'login_bg', color_value: ORIGINAL_COLORS.button_login_bg },
        { area: 'button', color_type: 'login_text', color_value: ORIGINAL_COLORS.button_login_text },
        { area: 'button', color_type: 'register_bg', color_value: ORIGINAL_COLORS.button_register_bg },
        { area: 'button', color_type: 'register_text', color_value: ORIGINAL_COLORS.button_register_text }
      ];

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('simple_theme_colors')
          .update({ 
            color_value: update.color_value,
            updated_at: new Date().toISOString()
          })
          .eq('area', update.area)
          .eq('color_type', update.color_type)
          .eq('is_active', true);

        if (updateError) {
          throw updateError;
        }
      }

      // Atualizar estado local
      setColors(ORIGINAL_COLORS);
      console.log('[SIMPLE_THEME] Cores resetadas para originais');
      return true;
    } catch (err) {
      console.error('[SIMPLE_THEME] Erro ao resetar cores:', err);
      setError(err instanceof Error ? err.message : 'Erro ao resetar cores');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar cores na inicialização
  useEffect(() => {
    loadColors();
  }, [loadColors]);

  // Aplicar cores sempre que mudarem
  useEffect(() => {
    if (!loading) {
      applyColorsToDOM(colors);
    }
  }, [colors, loading, applyColorsToDOM]);

  return {
    colors,
    loading,
    error,
    updateColor,
    resetToOriginal,
    applyColors: () => applyColorsToDOM(colors)
  };
};