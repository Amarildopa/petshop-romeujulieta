import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ThemeDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchThemeData = async () => {
      try {
        console.log('🔍 ThemeDebugger: Iniciando busca de dados...')
        
        // Buscar theme_colors_active
        const { data: activeData, error: activeError } = await supabase
          .from('system_settings_pet')
          .select('key, value')
          .eq('key', 'theme_colors_active')
          .single()
        
        console.log('📦 Dados theme_colors_active:', activeData)
        console.log('❌ Erro theme_colors_active:', activeError)
        
        // Buscar theme_colors_default
        const { data: defaultData, error: defaultError } = await supabase
          .from('system_settings_pet')
          .select('key, value')
          .eq('key', 'theme_colors_default')
          .single()
        
        console.log('📦 Dados theme_colors_default:', defaultData)
        console.log('❌ Erro theme_colors_default:', defaultError)
        
        setDebugInfo({
          active: { data: activeData, error: activeError },
          default: { data: defaultData, error: defaultError }
        })
        
      } catch (err) {
        console.error('💥 Erro geral:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }
    
    fetchThemeData()
  }, [])

  if (loading) {
    return <div className="p-4">Carregando dados de debug...</div>
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Theme Debugger</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Erro:</strong> {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Theme Colors Active:</h3>
          <pre className="bg-white p-2 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo?.active, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 className="font-semibold">Theme Colors Default:</h3>
          <pre className="bg-white p-2 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo?.default, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default ThemeDebugger