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

export interface BusinessHours {
  monday: { open: string; close: string }
  tuesday: { open: string; close: string }
  wednesday: { open: string; close: string }
  thursday: { open: string; close: string }
  friday: { open: string; close: string }
  saturday: { open: string; close: string }
  sunday?: { open: string; close: string }
}

export interface LocationData {
  contact: ContactSettings
  businessHours: BusinessHours
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
  // Buscar horários de funcionamento
  async getBusinessHours(): Promise<BusinessHours> {
    try {
      const { data, error } = await supabase
        .from('system_settings_pet')
        .select('value')
        .eq('key', 'business_hours')
        .eq('is_public', true)
        .single()

      if (error) throw error

      if (data?.value) {
        try {
          // Verifica se o valor não é um JWT (que começa com "eyJ")
          if (data.value.startsWith('eyJ')) {
            logger.warn('Tentativa de parsear JWT como JSON em business_hours', { value: data.value.substring(0, 20) + '...' })
            // Retorna valores padrão se for um JWT
            return {
              monday: { open: '08:00', close: '18:00' },
              tuesday: { open: '08:00', close: '18:00' },
              wednesday: { open: '08:00', close: '18:00' },
              thursday: { open: '08:00', close: '18:00' },
              friday: { open: '08:00', close: '18:00' },
              saturday: { open: '08:00', close: '17:00' }
            }
          }
          
          return JSON.parse(data.value) as BusinessHours
        } catch (error) {
          logger.error('Erro ao parsear business_hours JSON', error as Error, { value: data.value })
          // Retorna valores padrão em caso de erro
          return {
            monday: { open: '08:00', close: '18:00' },
            tuesday: { open: '08:00', close: '18:00' },
            wednesday: { open: '08:00', close: '18:00' },
            thursday: { open: '08:00', close: '18:00' },
            friday: { open: '08:00', close: '18:00' },
            saturday: { open: '08:00', close: '17:00' }
          }
        }
      }

      // Valores padrão
      return {
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' },
        saturday: { open: '08:00', close: '17:00' }
      }
    } catch (error) {
      logger.error('Error fetching business hours', error as Error, {}, 'SETTINGS')
      // Retornar valores padrão em caso de erro
      return {
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' },
        saturday: { open: '08:00', close: '17:00' }
      }
    }
  }

  // Buscar todos os dados de localização (contato + horários)
  async getLocationData(): Promise<LocationData> {
    try {
      const [contact, businessHours] = await Promise.all([
        this.getContactSettings(),
        this.getBusinessHours()
      ])

      return {
        contact,
        businessHours
      }
    } catch (error) {
      logger.error('Error fetching location data', error as Error, {}, 'SETTINGS')
      throw error
    }
  }

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