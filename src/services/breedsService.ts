import { supabase } from '../lib/supabase';

export interface Breed {
  id: string;
  name: string;
  species: 'dog' | 'cat';
  size_category?: 'toy' | 'small' | 'medium' | 'large' | 'giant';
  origin_country?: string;
  temperament?: string;
  life_expectancy_min?: number;
  life_expectancy_max?: number;
  weight_min_kg?: number;
  weight_max_kg?: number;
  height_min_cm?: number;
  height_max_cm?: number;
  coat_type?: string;
  grooming_needs?: 'low' | 'medium' | 'high';
  exercise_needs?: 'low' | 'medium' | 'high';
  good_with_children?: boolean;
  good_with_pets?: boolean;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BreedSearchParams {
  query?: string;
  species?: 'dog' | 'cat';
  size_category?: string;
  limit?: number;
  offset?: number;
}

class BreedsService {
  /**
   * Busca raças com filtro por texto (busca dinâmica)
   * @param params Parâmetros de busca
   * @returns Lista de raças encontradas
   */
  async searchBreeds(params: BreedSearchParams = {}): Promise<Breed[]> {
    try {
      const {
        query = '',
        species,
        size_category,
        limit = 50,
        offset = 0
      } = params;

      let queryBuilder = supabase
        .from('breeds_pet')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

      // Filtro por espécie
      if (species) {
        queryBuilder = queryBuilder.eq('species', species);
      }

      // Filtro por categoria de tamanho
      if (size_category) {
        queryBuilder = queryBuilder.eq('size_category', size_category);
      }

      // Busca por texto (nome da raça)
      if (query.trim()) {
        // Usar busca por similaridade (pg_trgm) ou ILIKE
        queryBuilder = queryBuilder.or(
          `name.ilike.%${query}%,name.fts.${query}`
        );
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('Erro ao buscar raças:', error);
        throw new Error('Erro ao buscar raças');
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço de busca de raças:', error);
      throw error;
    }
  }

  /**
   * Busca raças por texto com busca mais inteligente
   * @param query Texto de busca
   * @param species Filtro por espécie (opcional)
   * @param limit Limite de resultados
   * @returns Lista de raças encontradas
   */
  async searchBreedsByText(
    query: string, 
    species?: 'dog' | 'cat', 
    limit: number = 20
  ): Promise<Breed[]> {
    try {
      if (!query.trim()) {
        return this.getAllBreeds(species, limit);
      }

      const searchQuery = query.trim().toLowerCase();
      
      let queryBuilder = supabase
        .from('breeds_pet')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      // Filtro por espécie
      if (species) {
        queryBuilder = queryBuilder.eq('species', species);
      }

      // Busca que começa com o texto digitado (prioridade alta)
      // ou contém o texto (prioridade menor)
      queryBuilder = queryBuilder.or(
        `name.ilike.${searchQuery}%,name.ilike.%${searchQuery}%`
      );

      queryBuilder = queryBuilder
        .order('name', { ascending: true })
        .limit(limit);

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('Erro ao buscar raças por texto:', error);
        throw new Error('Erro ao buscar raças');
      }

      // Ordenar resultados: primeiro os que começam com o texto, depois os que contêm
      const results = data || [];
      return results.sort((a, b) => {
        const aStartsWith = a.name.toLowerCase().startsWith(searchQuery);
        const bStartsWith = b.name.toLowerCase().startsWith(searchQuery);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Erro no serviço de busca de raças por texto:', error);
      throw error;
    }
  }

  /**
   * Obtém todas as raças ativas
   * @param species Filtro por espécie (opcional)
   * @param limit Limite de resultados
   * @returns Lista de todas as raças
   */
  async getAllBreeds(species?: 'dog' | 'cat', limit: number = 100): Promise<Breed[]> {
    try {
      let queryBuilder = supabase
        .from('breeds_pet')
        .select('*')
        .eq('is_active', true);

      if (species) {
        queryBuilder = queryBuilder.eq('species', species);
      }

      if (limit > 0) {
        queryBuilder = queryBuilder.limit(limit);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('Erro ao buscar todas as raças:', error);
        throw new Error('Erro ao buscar raças');
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço de busca de todas as raças:', error);
      throw error;
    }
  }

  /**
   * Obtém uma raça específica por ID
   * @param id ID da raça
   * @returns Dados da raça
   */
  async getBreedById(id: string): Promise<Breed | null> {
    try {
      const { data, error } = await supabase
        .from('breeds_pet')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Não encontrado
        }
        console.error('Erro ao buscar raça por ID:', error);
        throw new Error('Erro ao buscar raça');
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de busca de raça por ID:', error);
      throw error;
    }
  }

  /**
   * Obtém raças por espécie
   * @param species Espécie (dog ou cat)
   * @param limit Limite de resultados
   * @returns Lista de raças da espécie
   */
  async getBreedsBySpecies(species: 'dog' | 'cat', limit: number = 100): Promise<Breed[]> {
    return this.getAllBreeds(species, limit);
  }

  /**
   * Obtém estatísticas das raças
   * @returns Estatísticas das raças
   */
  async getBreedsStats(): Promise<{
    total: number;
    dogs: number;
    cats: number;
    by_size: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('breeds_pet')
        .select('species, size_category')
        .eq('is_active', true);

      if (error) {
        console.error('Erro ao buscar estatísticas das raças:', error);
        throw new Error('Erro ao buscar estatísticas');
      }

      const stats = {
        total: data.length,
        dogs: data.filter(b => b.species === 'dog').length,
        cats: data.filter(b => b.species === 'cat').length,
        by_size: {} as Record<string, number>
      };

      // Contar por tamanho
      data.forEach(breed => {
        if (breed.size_category) {
          stats.by_size[breed.size_category] = (stats.by_size[breed.size_category] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Erro no serviço de estatísticas das raças:', error);
      throw error;
    }
  }

  /**
   * Cria uma nova raça (apenas para admins)
   * @param breedData Dados da raça
   * @returns Raça criada
   */
  async createBreed(breedData: Omit<Breed, 'id' | 'created_at' | 'updated_at'>): Promise<Breed> {
    try {
      const { data, error } = await supabase
        .from('breeds_pet')
        .insert([breedData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar raça:', error);
        throw new Error('Erro ao criar raça');
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de criação de raça:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma raça (apenas para admins)
   * @param id ID da raça
   * @param breedData Dados atualizados
   * @returns Raça atualizada
   */
  async updateBreed(id: string, breedData: Partial<Breed>): Promise<Breed> {
    try {
      const { data, error } = await supabase
        .from('breeds_pet')
        .update(breedData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar raça:', error);
        throw new Error('Erro ao atualizar raça');
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de atualização de raça:', error);
      throw error;
    }
  }

  /**
   * Desativa uma raça (soft delete)
   * @param id ID da raça
   * @returns Sucesso da operação
   */
  async deactivateBreed(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('breeds_pet')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Erro ao desativar raça:', error);
        throw new Error('Erro ao desativar raça');
      }

      return true;
    } catch (error) {
      console.error('Erro no serviço de desativação de raça:', error);
      throw error;
    }
  }
}

export const breedsService = new BreedsService();