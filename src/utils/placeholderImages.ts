/**
 * Utilitário para imagens placeholder
 * Substitui o LoremFlickr por imagens estáveis do Unsplash
 */

interface PlaceholderImages {
  animals: string[];
  puppies: string[];
  veterinarian: string[];
  dogBirthday: string[];
  dogBath: string[];
  dogAgility: string[];
}

// Imagens estáveis do Unsplash para substituir LoremFlickr
const PLACEHOLDER_IMAGES: PlaceholderImages = {
  animals: [
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=128&h=128&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=128&h=128&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=128&h=128&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=128&h=128&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=128&h=128&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=128&h=128&fit=crop&crop=face"
  ],
  puppies: [
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop&crop=center"
  ],
  veterinarian: [
    "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center"
  ],
  dogBirthday: [
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&crop=center"
  ],
  dogBath: [
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&h=300&fit=crop&crop=center"
  ],
  dogAgility: [
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop&crop=center"
  ]
};

/**
 * Retorna uma imagem aleatória de uma categoria específica
 */
export function getRandomPlaceholderImage(category: keyof PlaceholderImages): string {
  const images = PLACEHOLDER_IMAGES[category];
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

/**
 * Retorna uma imagem determinística baseada em um seed
 * Útil para manter a mesma imagem para o mesmo item
 */
export function getSeededPlaceholderImage(category: keyof PlaceholderImages, seed: string | number): string {
  const images = PLACEHOLDER_IMAGES[category];
  const seedNumber = typeof seed === 'string' ? seed.length : seed;
  const index = seedNumber % images.length;
  return images[index];
}

/**
 * Gera múltiplas imagens de uma categoria
 */
export function generatePlaceholderImages(category: keyof PlaceholderImages, count: number): string[] {
  const images = PLACEHOLDER_IMAGES[category];
  const result: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const index = i % images.length;
    result.push(images[index]);
  }
  
  return result;
}

/**
 * Substitui a funcionalidade do faker.image.urlLoremFlickr
 */
export function getPlaceholderImageByCategory(options: {
  category: string;
  width?: number;
  height?: number;
}): string {
  const { category, width = 400, height = 300 } = options;
  
  // Mapear categorias do LoremFlickr para nossas categorias
  const categoryMap: Record<string, keyof PlaceholderImages> = {
    'puppy': 'puppies',
    'veterinarian': 'veterinarian',
    'dog birthday': 'dogBirthday',
    'dog bath': 'dogBath',
    'dog agility': 'dogAgility',
    'animals': 'animals'
  };
  
  const mappedCategory = categoryMap[category] || 'animals';
  const baseUrl = getRandomPlaceholderImage(mappedCategory);
  
  // Ajustar dimensões na URL do Unsplash
  return baseUrl.replace(/w=\d+&h=\d+/, `w=${width}&h=${height}`);
}