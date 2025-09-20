import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cepService } from '../cepService'

// Mock do fetch global
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock do console.error
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('CepService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    mockConsoleError.mockClear()
  })

  describe('getCepData', () => {
    it('should return CEP data for valid CEP', async () => {
      const mockCepData = {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        complemento: '',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
        ibge: '3550308',
        gia: '1004',
        ddd: '11',
        siafi: '7107'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCepData)
      })

      const result = await cepService.getCepData('01310100')

      expect(mockFetch).toHaveBeenCalledWith('https://viacep.com.br/ws/01310100/json/')
      expect(result).toEqual(mockCepData)
    })

    it('should handle CEP with formatting characters', async () => {
      const mockCepData = {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCepData)
      })

      const result = await cepService.getCepData('01310-100')

      expect(mockFetch).toHaveBeenCalledWith('https://viacep.com.br/ws/01310100/json/')
      expect(result).toEqual(mockCepData)
    })

    it('should return null for invalid CEP length', async () => {
      const result = await cepService.getCepData('123')

      expect(mockFetch).not.toHaveBeenCalled()
      expect(result).toBeNull()
      expect(mockConsoleError).toHaveBeenCalledWith('Erro ao buscar CEP:', expect.any(Error))
    })

    it('should return null when CEP has more than 8 digits', async () => {
      const result = await cepService.getCepData('123456789')

      expect(mockFetch).not.toHaveBeenCalled()
      expect(result).toBeNull()
      expect(mockConsoleError).toHaveBeenCalledWith('Erro ao buscar CEP:', expect.any(Error))
    })

    it('should return null when API returns error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const result = await cepService.getCepData('12345678')

      expect(result).toBeNull()
      expect(mockConsoleError).toHaveBeenCalledWith('Erro ao buscar CEP:', expect.any(Error))
    })

    it('should return null when CEP is not found', async () => {
      const mockErrorResponse = {
        erro: true
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockErrorResponse)
      })

      const result = await cepService.getCepData('99999999')

      expect(result).toBeNull()
      expect(mockConsoleError).toHaveBeenCalledWith('Erro ao buscar CEP:', expect.any(Error))
    })

    it('should return null when fetch throws error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await cepService.getCepData('01310100')

      expect(result).toBeNull()
      expect(mockConsoleError).toHaveBeenCalledWith('Erro ao buscar CEP:', expect.any(Error))
    })

    it('should return null when JSON parsing fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      const result = await cepService.getCepData('01310100')

      expect(result).toBeNull()
      expect(mockConsoleError).toHaveBeenCalledWith('Erro ao buscar CEP:', expect.any(Error))
    })
  })

  describe('formatCep', () => {
    it('should format CEP correctly', () => {
      const result = cepService.formatCep('01310100')
      expect(result).toBe('01310-100')
    })

    it('should format CEP with existing formatting', () => {
      const result = cepService.formatCep('01310-100')
      expect(result).toBe('01310-100')
    })

    it('should handle CEP with mixed characters', () => {
      const result = cepService.formatCep('013a10b100')
      expect(result).toBe('01310-100')
    })

    it('should handle empty string', () => {
      const result = cepService.formatCep('')
      expect(result).toBe('-')
    })

    it('should handle CEP with spaces', () => {
      const result = cepService.formatCep('0 1 3 1 0 1 0 0')
      expect(result).toBe('01310-100')
    })
  })

  describe('validateCpf', () => {
    it('should validate correct CPF', () => {
      // CPF válido: 111.444.777-35
      expect(cepService.validateCpf('11144477735')).toBe(true)
      expect(cepService.validateCpf('111.444.777-35')).toBe(true)
    })

    it('should validate another correct CPF', () => {
      // CPF válido: 123.456.789-09
      expect(cepService.validateCpf('12345678909')).toBe(true)
      expect(cepService.validateCpf('123.456.789-09')).toBe(true)
    })

    it('should reject CPF with wrong length', () => {
      expect(cepService.validateCpf('123456789')).toBe(false)
      expect(cepService.validateCpf('123456789012')).toBe(false)
      expect(cepService.validateCpf('')).toBe(false)
    })

    it('should reject CPF with all same digits', () => {
      expect(cepService.validateCpf('11111111111')).toBe(false)
      expect(cepService.validateCpf('22222222222')).toBe(false)
      expect(cepService.validateCpf('00000000000')).toBe(false)
    })

    it('should reject CPF with invalid check digits', () => {
      expect(cepService.validateCpf('12345678901')).toBe(false)
      expect(cepService.validateCpf('98765432100')).toBe(false)
    })

    it('should handle CPF with formatting characters', () => {
      expect(cepService.validateCpf('111.444.777-35')).toBe(true)
      expect(cepService.validateCpf('111.444.777-36')).toBe(false)
    })

    it('should handle CPF with mixed characters', () => {
      expect(cepService.validateCpf('111a444b777c35')).toBe(true)
      expect(cepService.validateCpf('111a444b777c36')).toBe(false)
    })
  })

  describe('formatCpf', () => {
    it('should format CPF correctly', () => {
      const result = cepService.formatCpf('11144477735')
      expect(result).toBe('111.444.777-35')
    })

    it('should format CPF with existing formatting', () => {
      const result = cepService.formatCpf('111.444.777-35')
      expect(result).toBe('111.444.777-35')
    })

    it('should handle CPF with mixed characters', () => {
      const result = cepService.formatCpf('111a444b777c35')
      expect(result).toBe('111.444.777-35')
    })

    it('should handle empty string', () => {
      const result = cepService.formatCpf('')
      expect(result).toBe('...-')
    })

    it('should handle CPF with spaces', () => {
      const result = cepService.formatCpf('1 1 1 4 4 4 7 7 7 3 5')
      expect(result).toBe('111.444.777-35')
    })

    it('should handle incomplete CPF', () => {
      const result = cepService.formatCpf('12345')
      expect(result).toBe('123.45..-')
    })
  })

  describe('Integration tests', () => {
    it('should work with real CEP format and validation flow', async () => {
      const mockCepData = {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCepData)
      })

      // Test complete flow: format -> validate -> fetch
      const inputCep = '01310100'
      const formattedCep = cepService.formatCep(inputCep)
      const cepData = await cepService.getCepData(inputCep)

      expect(formattedCep).toBe('01310-100')
      expect(cepData).toEqual(mockCepData)
    })

    it('should work with real CPF format and validation flow', () => {
      const inputCpf = '11144477735'
      const formattedCpf = cepService.formatCpf(inputCpf)
      const isValid = cepService.validateCpf(inputCpf)

      expect(formattedCpf).toBe('111.444.777-35')
      expect(isValid).toBe(true)
    })
  })
})
