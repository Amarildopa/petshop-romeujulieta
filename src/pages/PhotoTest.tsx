import React, { useState, useEffect, useCallback } from 'react'
import { Camera, Upload, CheckCircle, XCircle, Loader, Info } from 'lucide-react'
import { profileService } from '../services/profileService'
import { supabase } from '../lib/supabase'

const PhotoTest: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedBucket, setSelectedBucket] = useState<'avatars' | 'avatars_novo'>('avatars')
  const [uploadResult, setUploadResult] = useState<{
    success: boolean
    url?: string
    error?: string
  } | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean
    buckets: string[]
    error?: string
  } | null>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const testBucketAccess = async (bucketName: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 1 })
      
      return !error
    } catch {
      return false
    }
  }

  const checkSupabaseStatus = useCallback(async () => {
    addLog('🔍 Verificando status do Supabase...')
    
    try {
      // Verificar URL e Key
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      addLog(`📍 Supabase URL: ${supabaseUrl}`)
      addLog(`🔑 Supabase Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NÃO DEFINIDA'}`)
      
      // Testar conexão listando buckets
      const { data: buckets, error } = await supabase.storage.listBuckets()
      
      if (error) {
        addLog(`❌ Erro na conexão: ${error.message}`)
        setSupabaseStatus({ connected: false, buckets: [], error: error.message })
        return
      }
      
      const bucketNames = buckets?.map(b => b.name) || []
      addLog(`📦 Buckets encontrados: [${bucketNames.join(', ')}]`)
      addLog(`🎯 Bucket 'avatars' existe: ${bucketNames.includes('avatars') ? '✅ SIM' : '❌ NÃO'}`)
      addLog(`🎯 Bucket 'avatars_novo' existe: ${bucketNames.includes('avatars_novo') ? '✅ SIM' : '❌ NÃO'}`)
      
      // Testar acesso direto aos buckets (mesmo que não apareçam na lista)
      const avatarsExists = await testBucketAccess('avatars')
      const avatarsNovoExists = await testBucketAccess('avatars_novo')
      
      addLog(`🔍 Teste direto 'avatars': ${avatarsExists ? '✅ ACESSÍVEL' : '❌ INACESSÍVEL'}`)
      addLog(`🔍 Teste direto 'avatars_novo': ${avatarsNovoExists ? '✅ ACESSÍVEL' : '❌ INACESSÍVEL'}`)
      
      setSupabaseStatus({ 
        connected: true, 
        buckets: bucketNames,
        bucketsLoaded: true,
        totalBuckets: buckets?.length || 0,
        avatarBucketExists: avatarsExists || avatarsNovoExists,
        avatarsDirectAccess: avatarsExists,
        avatarsNovoDirectAccess: avatarsNovoExists
      })
      
      // Se bucket avatars existe, testar permissões
      if (bucketNames.includes('avatars')) {
        addLog('🔐 Testando permissões do bucket avatars...')
        try {
          const { data: files, error: listError } = await supabase.storage
            .from('avatars')
            .list('', { limit: 1 })
          
          if (listError) {
            addLog(`⚠️ Erro ao listar arquivos: ${listError.message}`)
          } else {
            addLog(`✅ Permissões OK - ${files?.length || 0} arquivos encontrados`)
          }
        } catch (permError: unknown) {
          const errorMessage = permError instanceof Error ? permError.message : 'Erro desconhecido'
          addLog(`⚠️ Erro de permissão: ${errorMessage}`)
        }
      }
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      addLog(`💥 Erro crítico: ${errorMessage}`)
      setSupabaseStatus({ connected: false, buckets: [], error: errorMessage })
    }
  }, [])

  useEffect(() => {
    checkSupabaseStatus()
  }, [checkSupabaseStatus])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadResult(null)
      
      // Criar preview local
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      
      addLog(`Arquivo selecionado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      addLog(`Tipo: ${file.type}`)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadResult(null)
    addLog('🚀 Iniciando upload...')
    addLog(`📁 Arquivo: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)}MB)`)
    addLog(`🏷️ Tipo MIME: ${selectedFile.type}`)
    addLog(`🎯 Bucket selecionado: ${selectedBucket}`)

    try {
      if (selectedBucket === 'avatars') {
        // Usar profileService para bucket avatars (comportamento original)
        addLog('🔄 Usando profileService.uploadAvatar() para bucket "avatars"')
        
        const uploadedUrl = await profileService.uploadAvatar(selectedFile)
        
        setUploadResult({
          success: true,
          url: uploadedUrl
        })
        
        addLog(`✅ Upload realizado com sucesso!`)
        addLog(`🔗 URL gerada: ${uploadedUrl}`)
        
        if (uploadedUrl.startsWith('blob:')) {
          addLog('⚠️ FALLBACK LOCAL USADO - Possíveis causas:')
          addLog('   • Bucket "avatars" não existe')
          addLog('   • Erro de permissões RLS')
          addLog('   • Falha na conexão com Supabase')
          addLog('   • Erro no upload do arquivo')
        } else if (uploadedUrl.includes('supabase')) {
          addLog('🎉 SUPABASE STORAGE USADO - Upload real realizado!')
          addLog('✨ Arquivo salvo na nuvem com sucesso')
        } else {
          addLog('🤔 URL não identificada - Verificar origem')
        }
      } else {
        // Upload direto para bucket avatars_novo
        addLog('🔄 Upload direto para bucket "avatars_novo"')
        
        const fileName = `test-${Date.now()}-${selectedFile.name}`
        addLog(`📝 Nome do arquivo: ${fileName}`)
        
        const { data, error } = await supabase.storage
          .from(selectedBucket)
          .upload(fileName, selectedFile, {
            cacheControl: '3600',
            upsert: false
          })
        
        if (error) {
          throw new Error(`Erro no upload: ${error.message}`)
        }
        
        // Gerar URL pública
        const { data: urlData } = supabase.storage
          .from(selectedBucket)
          .getPublicUrl(fileName)
        
        const uploadedUrl = urlData.publicUrl
        
        setUploadResult({
          success: true,
          url: uploadedUrl
        })
        
        addLog(`✅ Upload direto realizado com sucesso!`)
        addLog(`🔗 URL gerada: ${uploadedUrl}`)
        addLog(`📊 Dados do upload: ${JSON.stringify(data, null, 2)}`)
        addLog('🎉 SUPABASE STORAGE USADO - Upload direto realizado!')
        addLog('✨ Arquivo salvo no bucket "avatars_novo" com sucesso')
      }
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setUploadResult({
        success: false,
        error: errorMessage
      })
      
      addLog(`❌ Erro no upload: ${errorMessage}`)
      addLog(`📋 Stack trace: ${error.stack || 'Não disponível'}`)
    } finally {
      setUploading(false)
      addLog('🏁 Processo de upload finalizado')
    }
  }

  const clearTest = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadResult(null)
    setLogs([])
    
    // Limpar input file
    const fileInput = document.getElementById('photo-input') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🧪 Teste de Upload de Fotos
          </h1>
          <p className="text-gray-600">
            Página dedicada para testar o sistema de upload de imagens do Supabase Storage.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Upload de Foto
            </h2>

            {/* Bucket Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bucket de Destino:
              </label>
              <select
                value={selectedBucket}
                onChange={(e) => setSelectedBucket(e.target.value as 'avatars' | 'avatars_novo')}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="avatars">avatars (bucket original)</option>
                <option value="avatars_novo">avatars_novo (bucket novo)</option>
              </select>
            </div>

            {/* File Input */}
            <div className="mb-4">
              <label 
                htmlFor="photo-input" 
                className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <span className="text-gray-600">
                  Clique para selecionar uma foto
                </span>
                <br />
                <span className="text-sm text-gray-400">
                  Formatos: JPG, PNG, GIF, WebP (máx. 5MB)
                </span>
                <br />
                <span className="text-xs text-blue-600 font-medium">
                  Upload será feito no bucket: {selectedBucket}
                </span>
              </label>
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
                <div className="relative">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Fazer Upload
                  </>
                )}
              </button>
              
              <button
                onClick={clearTest}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Limpar
              </button>
            </div>

            {/* Result */}
            {uploadResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                uploadResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center mb-2">
                  {uploadResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-medium ${
                    uploadResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {uploadResult.success ? 'Upload realizado!' : 'Erro no upload'}
                  </span>
                </div>
                
                {uploadResult.url && (
                  <div className="text-sm text-gray-600">
                    <strong>URL:</strong> 
                    <br />
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                      {uploadResult.url}
                    </code>
                  </div>
                )}
                
                {uploadResult.error && (
                  <div className="text-sm text-red-600">
                    <strong>Erro:</strong> {uploadResult.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Supabase Status Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Status do Supabase
              </h2>
              <button
                onClick={checkSupabaseStatus}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                🔄 Re-verificar
              </button>
            </div>
            
            {supabaseStatus && (
              <div className="space-y-2 text-sm">
                <div className={`flex items-center ${
                  supabaseStatus.connected ? 'text-green-600' : 'text-red-600'
                }`}>
                  {supabaseStatus.connected ? '✅' : '❌'} 
                  Conexão: {supabaseStatus.connected ? 'Conectado' : 'Desconectado'}
                </div>
                
                <div className="text-gray-600">
                  📦 Buckets: [{supabaseStatus.buckets.join(', ') || 'Nenhum'}]
                </div>
                
                <div className={`flex items-center ${
                  supabaseStatus.avatarsDirectAccess ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {supabaseStatus.avatarsDirectAccess ? '✅' : '⚠️'} 
                  Bucket 'avatars': {supabaseStatus.avatarsDirectAccess ? 'Acessível' : 'Inacessível'}
                </div>
                
                <div className={`flex items-center ${
                  supabaseStatus.avatarsNovoDirectAccess ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {supabaseStatus.avatarsNovoDirectAccess ? '✅' : '⚠️'} 
                  Bucket 'avatars_novo': {supabaseStatus.avatarsNovoDirectAccess ? 'Acessível' : 'Inacessível'}
                </div>
                
                {!supabaseStatus.avatarBucketExists && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center gap-2 text-yellow-700 font-medium mb-2">
                      <Info className="w-4 h-4" />
                      Solução: Criar Bucket "avatars"
                    </div>
                    <div className="text-sm text-yellow-700 space-y-2">
                      <p>1. Acesse o Supabase Dashboard</p>
                      <p>2. Vá em Storage → Buckets</p>
                      <p>3. Execute o SQL no SQL Editor:</p>
                      <div className="bg-gray-800 text-green-400 p-2 rounded text-xs font-mono mt-2 overflow-x-auto">
                        <code>
                          INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)<br/>
                          VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])<br/>
                          ON CONFLICT (id) DO NOTHING;
                        </code>
                      </div>
                      <p className="text-xs">Ou use o arquivo: <code>scripts/setup-storage-bucket.sql</code></p>
                    </div>
                  </div>
                )}
                
                {supabaseStatus.error && (
                  <div className="text-red-600">
                    ❌ Erro: {supabaseStatus.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logs Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                📋 Logs Detalhados
              </h2>
              <button
                onClick={() => setLogs([])}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🗑️ Limpar Logs
              </button>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500">Nenhum log ainda...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
            
            <button
              onClick={() => setLogs([])}
              className="mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Limpar logs
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            ℹ️ Informações do Teste
          </h3>
          <div className="text-blue-800 space-y-2">
            <p><strong>Buckets disponíveis:</strong> avatars, avatars_novo</p>
            <p><strong>Bucket "avatars":</strong> Usa profileService (com fallback local)</p>
            <p><strong>Bucket "avatars_novo":</strong> Upload direto via Supabase Storage</p>
            <p><strong>Supabase URL:</strong> https://hudiuukaoxxzxdcydgky.supabase.co</p>
            <p><strong>Fallback:</strong> URLs locais (blob:) quando Supabase indisponível (apenas bucket "avatars")</p>
            <p><strong>Formatos aceitos:</strong> JPG, PNG, GIF, WebP</p>
            <p><strong>Tamanho máximo:</strong> 5MB</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoTest