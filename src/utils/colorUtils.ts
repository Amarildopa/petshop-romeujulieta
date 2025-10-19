/**
 * Utilitários para validação e normalização de cores
 */

/**
 * Normaliza uma cor para o formato hexadecimal #RRGGBB
 * Aceita formatos: #RGB, #RRGGBB, rgb(), rgba(), hsl(), hsla(), nomes de cores CSS
 */
export function normalizeColor(color: string): string {
  if (!color || typeof color !== 'string') {
    throw new Error('Valor de cor inválido');
  }

  // Remove espaços em branco
  const cleanColor = color.trim();

  // Se já está no formato #RRGGBB, valida e retorna
  if (/^#[0-9A-Fa-f]{6}$/.test(cleanColor)) {
    return cleanColor.toUpperCase();
  }

  // Se está no formato #RGB, expande para #RRGGBB
  if (/^#[0-9A-Fa-f]{3}$/.test(cleanColor)) {
    const r = cleanColor[1];
    const g = cleanColor[2];
    const b = cleanColor[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  // Tenta converter usando o navegador (para rgb(), rgba(), hsl(), hsla(), nomes de cores)
  try {
    // Cria um elemento temporário para usar a capacidade do navegador de normalizar cores
    const tempElement = document.createElement('div');
    tempElement.style.color = cleanColor;
    document.body.appendChild(tempElement);
    
    const computedColor = window.getComputedStyle(tempElement).color;
    document.body.removeChild(tempElement);

    // Converte rgb() para hex
    if (computedColor && computedColor.startsWith('rgb')) {
      const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);
        
        if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
        }
      }
    }
  } catch {
    // Se falhar, continua para outras validações
  }

  // Se chegou até aqui, a cor não é válida
  throw new Error('Valor de cor inválido. Use formato #RRGGBB, #RGB, rgb(), rgba(), hsl(), hsla() ou nomes de cores CSS válidos');
}

/**
 * Valida se uma cor é válida (pode ser normalizada)
 */
export function isValidColor(color: string): boolean {
  try {
    normalizeColor(color);
    return true;
  } catch {
    return false;
  }
}

/**
 * Converte uma cor hex para RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeColor(hex);
  const result = /^#([A-Fa-f\d]{2})([A-Fa-f\d]{2})([A-Fa-f\d]{2})$/.exec(normalized);
  
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Converte RGB para hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    throw new Error('Valores RGB devem estar entre 0 e 255');
  }
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}

/**
 * Calcula o contraste entre duas cores
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    throw new Error('Cores inválidas para cálculo de contraste');
  }

  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}