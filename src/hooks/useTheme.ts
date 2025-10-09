import { useState, useEffect, useCallback } from 'react';

// Cores originais do projeto (valores padrão restauráveis)
export const ORIGINAL_COLORS = {
  header: {
    bg: '#FEF7FF',
    textPrimary: '#F8BBD9',
    textDark: '#334155'
  },
  landing: {
    bgMain: '#FEF7FF',
    bgSections: '#FFFBEB',
    cardBg: '#FFFFFF'
  },
  components: {
    primary: '#F8BBD9',
    secondary: '#BFDBFE',
    accent: '#FEF3C7'
  }
};

export type ThemeColors = typeof ORIGINAL_COLORS;

// Aplicar cores via CSS variables
const applyColorsToDOM = (colorConfig: ThemeColors) => {
  const root = document.documentElement;
  
  // Header
  root.style.setProperty('--header-bg', colorConfig.header.bg);
  root.style.setProperty('--header-text-primary', colorConfig.header.textPrimary);
  root.style.setProperty('--header-text-dark', colorConfig.header.textDark);
  
  // Landing Page
  root.style.setProperty('--landing-bg-main', colorConfig.landing.bgMain);
  root.style.setProperty('--landing-bg-sections', colorConfig.landing.bgSections);
  root.style.setProperty('--landing-card-bg', colorConfig.landing.cardBg);
  
  // Componentes Gerais
  root.style.setProperty('--color-primary', colorConfig.components.primary);
  root.style.setProperty('--color-secondary', colorConfig.components.secondary);
  root.style.setProperty('--color-accent', colorConfig.components.accent);
};

// Hook global para gerenciar o tema
export const useTheme = () => {
  const [colors, setColors] = useState<ThemeColors>(ORIGINAL_COLORS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar cores do localStorage na inicialização
  useEffect(() => {
    const loadSavedColors = () => {
      try {
        const savedColors = localStorage.getItem('simpleThemeColors');
        if (savedColors) {
          const parsed = JSON.parse(savedColors) as ThemeColors;
          setColors(parsed);
          applyColorsToDOM(parsed);
        } else {
          // Se não há cores salvas, aplicar as originais
          applyColorsToDOM(ORIGINAL_COLORS);
        }
      } catch (error) {
        console.error('Erro ao carregar cores do tema:', error);
        // Em caso de erro, usar cores originais
        applyColorsToDOM(ORIGINAL_COLORS);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSavedColors();
  }, []);

  // Salvar cores no localStorage
  const saveColors = useCallback((newColors: ThemeColors) => {
    try {
      localStorage.setItem('simpleThemeColors', JSON.stringify(newColors));
    } catch (error) {
      console.error('Erro ao salvar cores do tema:', error);
    }
  }, []);

  // Aplicar e salvar cores
  const applyColors = useCallback((newColors: ThemeColors) => {
    setColors(newColors);
    applyColorsToDOM(newColors);
    saveColors(newColors);
  }, [saveColors]);

  // Alterar cor específica
  const updateColor = useCallback((section: keyof ThemeColors, colorKey: string, value: string) => {
    const newColors = {
      ...colors,
      [section]: {
        ...colors[section],
        [colorKey]: value
      }
    } as ThemeColors;
    
    applyColors(newColors);
  }, [colors, applyColors]);

  // Restaurar seção específica
  const restoreSection = useCallback((section: keyof ThemeColors) => {
    const newColors = {
      ...colors,
      [section]: ORIGINAL_COLORS[section]
    };
    
    applyColors(newColors);
  }, [colors, applyColors]);

  // Restaurar tudo ao original
  const restoreAll = useCallback(() => {
    setColors(ORIGINAL_COLORS);
    applyColorsToDOM(ORIGINAL_COLORS);
    localStorage.removeItem('simpleThemeColors');
  }, []);

  // Verificar se está usando cores originais
  const isUsingOriginal = useCallback((section: keyof ThemeColors) => {
    return JSON.stringify(colors[section]) === JSON.stringify(ORIGINAL_COLORS[section]);
  }, [colors]);

  const isAllOriginal = JSON.stringify(colors) === JSON.stringify(ORIGINAL_COLORS);

  return {
    colors,
    isLoaded,
    updateColor,
    applyColors,
    restoreSection,
    restoreAll,
    isUsingOriginal,
    isAllOriginal
  };
};

// Hook para inicializar o tema globalmente (usado no App.tsx)
export const useGlobalTheme = () => {
  useEffect(() => {
    const initializeTheme = () => {
      try {
        const savedColors = localStorage.getItem('simpleThemeColors');
        if (savedColors) {
          const parsed = JSON.parse(savedColors) as ThemeColors;
          applyColorsToDOM(parsed);
        } else {
          applyColorsToDOM(ORIGINAL_COLORS);
        }
      } catch (error) {
        console.error('Erro ao inicializar tema:', error);
        applyColorsToDOM(ORIGINAL_COLORS);
      }
    };

    initializeTheme();
  }, []);
};