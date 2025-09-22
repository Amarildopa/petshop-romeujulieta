import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

export interface SystemSetting {
  id: string
  key: string
  value: string
  description: string | null
  category: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface ContactSettings {
  contact_phone: string
  contact_email: string
  contact_address: string
  contact_cep: string
}

class SettingsService {
  // Buscar todas as configurações públicas do sistema
  async getPublicSettings(): Promise<SystemSetting[]> {
    try {
      const { data, error } = await supabase
        .from('system_settings_pet')
        .select('*')
        .eq('is_public', true)
        .order('category', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      logger.error('Error fetching public settings', error as Error, {}, 'SETTINGS')
      throw error
    }
  }

  // Buscar uma configuração específica por chave
  async getSettingByKey(key: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('system_settings_pet')
        .select('value')
        .eq('key', key)
        .eq('is_public', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Não encontrado
          return null
        }
        throw error
      }

      return data?.value as string || null
    } catch (error) {
      logger.error('Error fetching setting by key', error as Error, { key }, 'SETTINGS')
      throw error
    }
  }

  // Buscar configurações de contato
  async getContactSettings(): Promise<ContactSettings> {
    try {
      console.log('🔍 Buscando configurações de contato...')
      const { data, error } = await supabase
        .from('system_settings_pet')
        .select('key, value')
        .in('key', ['contact_phone', 'contact_email', 'contact_address', 'contact_cep'])
        .eq('is_public', true)

      if (error) {
        console.error('❌ Erro na consulta:', error)
        throw error
      }

      console.log('📊 Dados do banco:', data)

      // Converter array para objeto
      const settings: Partial<ContactSettings> = {}
      data?.forEach(setting => {
        settings[setting.key as keyof ContactSettings] = setting.value as string
      })

      console.log('⚙️ Settings processadas:', settings)

      // Valores padrão caso não existam no banco
      const result = {
        contact_phone: settings.contact_phone || '(11) 99999-9999',
        contact_email: settings.contact_email || 'contato@petshop.com',
        contact_address: settings.contact_address || 'Rua das Flores, 123 - São Paulo/SP',
        contact_cep: settings.contact_cep || '01234-567'
      }

      console.log('📱 Configurações finais:', result)
      return result
    } catch (error) {
      console.error('❌ Erro ao buscar configurações de contato:', error)
      logger.error('Error fetching contact settings', error as Error, {}, 'SETTINGS')
      // Retornar valores padrão em caso de erro
      return {
        contact_phone: '(11) 99999-9999',
        contact_email: 'contato@petshop.com',
        contact_address: 'Rua das Flores, 123 - São Paulo/SP',
        contact_cep: '01234-567'
      }
    }
  }

  // Formatar número de telefone para WhatsApp (remover caracteres especiais)
  formatPhoneForWhatsApp(phone: string): string {
    console.log('📞 Formatando telefone:', phone)
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '')
    console.log('🧹 Telefone limpo:', cleanPhone)
    
    // Se não começar com 55 (código do Brasil), adiciona
    if (!cleanPhone.startsWith('55')) {
      const result = `55${cleanPhone}`
      console.log('🇧🇷 Adicionado código do Brasil:', result)
      return result
    }
    
    console.log('✅ Telefone já formatado:', cleanPhone)
    return cleanPhone
  }

  // Buscar número do WhatsApp formatado
  async getWhatsAppNumber(): Promise<string> {
    try {
      const contactSettings = await this.getContactSettings()
      return this.formatPhoneForWhatsApp(contactSettings.contact_phone)
    } catch (error) {
      logger.error('Error getting WhatsApp number', error as Error, {}, 'SETTINGS')
      // Retornar número padrão em caso de erro
      return '5511999999999'
    }
  }
}

export const settingsService = new SettingsService()
export default settingsService