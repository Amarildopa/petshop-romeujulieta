import React, { useState, useRef, useEffect } from 'react'
import { Play, Square, Settings, Wifi, WifiOff, AlertCircle, Server } from 'lucide-react'
import Hls from 'hls.js'

interface RTSPConfig {
  ip: string
  username: string
  password: string
  port: string
  channel: string
  subtype: string
}

interface ConnectionStatus {
  connected: boolean
  error: string | null
  loading: boolean
  streamId?: string
  hlsUrl?: string
}

interface ProxyServerStatus {
  running: boolean
  error: string | null
}

const RTSPStreaming: React.FC = () => {
  const [config, setConfig] = useState<RTSPConfig>({
    ip: '192.168.0.53',
    username: 'admin',
    password: 'Adri1204@',
    port: '554',
    channel: '1',
    subtype: '0'
  })

  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    error: null,
    loading: false
  })

  const [proxyStatus, setProxyStatus] = useState<ProxyServerStatus>({
    running: false,
    error: null
  })

  const [logs, setLogs] = useState<string[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  // Verificar status do servidor proxy ao montar o componente
  useEffect(() => {
    checkProxyServer()
    
    // Cleanup ao desmontar
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [])

  const buildRTSPUrl = () => {
    return `rtsp://${config.username}:${config.password}@${config.ip}:${config.port}/cam/realmonitor?channel=${config.channel}&subtype=${config.subtype}`
  }

  const checkProxyServer = async () => {
    try {
      const response = await fetch('http://localhost:3001/active-streams')
      if (response.ok) {
        setProxyStatus({ running: true, error: null })
        return true
      } else {
        throw new Error('Servidor proxy não está respondendo')
      }
    } catch {
      setProxyStatus({ running: false, error: 'Servidor proxy offline' })
      return false
    }
  }

  const handleConnect = async () => {
    setStatus({ connected: false, error: null, loading: true })
    addLog('Verificando servidor proxy...')
    
    try {
      // Verificar se o servidor proxy está rodando
      const proxyRunning = await checkProxyServer()
      if (!proxyRunning) {
        throw new Error('Servidor proxy não está rodando. Execute: npm run rtsp-proxy')
      }
      
      const rtspUrl = buildRTSPUrl()
      const streamId = `stream_${Date.now()}`
      
      addLog('Iniciando conversão RTSP para HLS...')
      addLog(`URL RTSP: ${rtspUrl.replace(config.password, '***')}`)
      
      // Iniciar stream no servidor proxy
      const startResponse = await fetch('http://localhost:3001/start-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rtspUrl,
          streamId
        })
      })
      
      if (!startResponse.ok) {
        const errorData = await startResponse.json()
        throw new Error(errorData.error || 'Erro ao iniciar stream')
      }
      
      const streamData = await startResponse.json()
      addLog(`Stream iniciado: ${streamData.hlsUrl}`)
      
      // Aguardar um pouco para o FFmpeg gerar os segmentos
      addLog('Aguardando geração dos segmentos HLS...')
      
      // Aguardar mais tempo para garantir que os segmentos sejam gerados
      let attempts = 0
      const maxAttempts = 15
      let hlsReady = false
      
      while (attempts < maxAttempts && !hlsReady) {
        attempts++
        addLog(`Tentativa ${attempts}/${maxAttempts}: Verificando disponibilidade do arquivo HLS...`)
        
        try {
          const hlsCheckResponse = await fetch(streamData.hlsUrl)
          if (hlsCheckResponse.ok) {
            const hlsContent = await hlsCheckResponse.text()
            // Verificar se o manifest tem pelo menos um segmento
            if (hlsContent.includes('.ts')) {
              addLog('Arquivo HLS está disponível com segmentos!')
              addLog(`Conteúdo do manifest (primeiras 200 chars): ${hlsContent.substring(0, 200)}...`)
              hlsReady = true
              break
            } else {
              addLog('Manifest existe mas ainda não tem segmentos')
            }
          } else {
            addLog(`Arquivo HLS não está acessível ainda (${hlsCheckResponse.status})`)
          }
        } catch (error) {
          addLog(`Erro ao verificar arquivo HLS: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        }
        
        if (!hlsReady) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
      
      if (!hlsReady) {
        throw new Error('Timeout: Arquivo HLS não foi gerado após 30 segundos')
      }
      
      // Configurar HLS.js
      if (videoRef.current) {
        if (Hls.isSupported()) {
          if (hlsRef.current) {
            hlsRef.current.destroy()
          }
          
          hlsRef.current = new Hls({
            debug: true,
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90,
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            manifestLoadingTimeOut: 10000,
            manifestLoadingMaxRetry: 3,
            manifestLoadingRetryDelay: 1000,
            levelLoadingTimeOut: 10000,
            levelLoadingMaxRetry: 4,
            levelLoadingRetryDelay: 1000,
            fragLoadingTimeOut: 20000,
            fragLoadingMaxRetry: 6,
            fragLoadingRetryDelay: 1000,
            startLevel: -1,
            testBandwidth: false
          })
          
          hlsRef.current.loadSource(streamData.hlsUrl)
          hlsRef.current.attachMedia(videoRef.current)
          
          // Eventos de debug detalhados
          hlsRef.current.on(Hls.Events.MEDIA_ATTACHING, () => {
            addLog('HLS: Anexando mídia ao elemento video')
          })
          
          hlsRef.current.on(Hls.Events.MEDIA_ATTACHED, () => {
            addLog('HLS: Mídia anexada com sucesso')
          })
          
          hlsRef.current.on(Hls.Events.MANIFEST_LOADING, () => {
            addLog('HLS: Iniciando carregamento do manifest')
          })
          
          hlsRef.current.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            addLog('Manifest HLS carregado com sucesso')
            addLog(`HLS: Níveis disponíveis: ${data.levels.length}`)
            data.levels.forEach((level, index) => {
              addLog(`HLS: Nível ${index}: ${level.width}x${level.height} @ ${level.bitrate}bps`)
            })
            videoRef.current?.play()
            setStatus({ 
              connected: true, 
              error: null, 
              loading: false,
              streamId,
              hlsUrl: streamData.hlsUrl
            })
          })
          
          hlsRef.current.on(Hls.Events.LEVEL_LOADING, (event, data) => {
            addLog(`HLS: Carregando nível ${data.level}`)
          })
          
          hlsRef.current.on(Hls.Events.LEVEL_LOADED, (event, data) => {
            addLog(`HLS: Nível ${data.level} carregado com ${data.details.fragments.length} fragmentos`)
          })
          
          hlsRef.current.on(Hls.Events.FRAG_LOADING, (event, data) => {
            addLog(`HLS: Carregando fragmento ${data.frag.sn}`)
          })
          
          hlsRef.current.on(Hls.Events.FRAG_LOADED, (event, data) => {
            addLog(`HLS: Fragmento ${data.frag.sn} carregado`)
          })
          
          hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
            addLog(`Erro HLS: ${data.type} - ${data.details}`)
            addLog(`Erro HLS detalhado: ${JSON.stringify(data)}`)
            
            // Tratamento específico para manifestLoadError
            if (data.details === 'manifestLoadError') {
              addLog('Erro de carregamento do manifest HLS detectado')
              addLog(`URL do manifest: ${streamData.hlsUrl}`)
              addLog('Verificando se o arquivo .m3u8 existe...')
              
              // Tentar verificar se o arquivo existe
              fetch(streamData.hlsUrl)
                .then(response => {
                  if (response.ok) {
                    addLog('Arquivo .m3u8 existe e é acessível')
                    addLog('Tentando recarregar o manifest...')
                    // Tentar recarregar após um delay
                    setTimeout(() => {
                      if (hlsRef.current) {
                        hlsRef.current.loadSource(streamData.hlsUrl)
                      }
                    }, 2000)
                  } else {
                    addLog(`Arquivo .m3u8 não acessível: ${response.status} ${response.statusText}`)
                  }
                })
                .catch(err => {
                  addLog(`Erro ao verificar arquivo .m3u8: ${err.message}`)
                })
            }
            
            if (data.fatal) {
              setStatus({ connected: false, error: `Erro fatal HLS: ${data.details}`, loading: false })
            }
          })
          
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari nativo
          videoRef.current.src = streamData.hlsUrl
          videoRef.current.addEventListener('loadedmetadata', () => {
            addLog('Stream HLS carregado (Safari nativo)')
            setStatus({ 
              connected: true, 
              error: null, 
              loading: false,
              streamId,
              hlsUrl: streamData.hlsUrl
            })
          })
        } else {
          throw new Error('HLS não é suportado neste navegador')
        }
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setStatus({ connected: false, error: errorMessage, loading: false })
      addLog(`Erro na conexão: ${errorMessage}`)
    }
  }

  const handleDisconnect = async () => {
    setStatus(prev => ({ ...prev, loading: true }))
    addLog('Desconectando do stream...')
    
    try {
      // Parar o HLS
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      
      if (videoRef.current) {
        videoRef.current.src = ''
      }
      
      // Parar stream no servidor proxy se houver streamId
      if (status.streamId) {
        const stopResponse = await fetch(`http://localhost:3001/stop-stream/${status.streamId}`, {
          method: 'DELETE'
        })
        
        if (stopResponse.ok) {
          addLog('Stream parado no servidor proxy')
        } else {
          addLog('Aviso: Não foi possível parar o stream no servidor proxy')
        }
      }
      
      setStatus({ connected: false, error: null, loading: false })
      addLog('Desconectado do stream')
      
    } catch (error) {
      addLog(`Erro ao desconectar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setStatus({ connected: false, error: null, loading: false })
    }
  }

  const handleConfigChange = (field: keyof RTSPConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">RTSP Streaming Test</h1>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Configurações
            </button>
          </div>

          {/* Configurações */}
          {showSettings && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4">Parâmetros de Conexão</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP do Dispositivo</label>
                  <input
                    type="text"
                    value={config.ip}
                    onChange={(e) => handleConfigChange('ip', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="192.168.0.53"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                  <input
                    type="text"
                    value={config.username}
                    onChange={(e) => handleConfigChange('username', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    type="password"
                    value={config.password}
                    onChange={(e) => handleConfigChange('password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Senha"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Porta</label>
                  <input
                    type="text"
                    value={config.port}
                    onChange={(e) => handleConfigChange('port', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="554"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
                  <input
                    type="text"
                    value={config.channel}
                    onChange={(e) => handleConfigChange('channel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtipo</label>
                  <input
                    type="text"
                    value={config.subtype}
                    onChange={(e) => handleConfigChange('subtype', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Status do Servidor Proxy */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Servidor Proxy (localhost:3001)</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                proxyStatus.running 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {proxyStatus.running ? (
                  <><div className="w-2 h-2 bg-green-500 rounded-full" /> Online</>
                ) : (
                  <><div className="w-2 h-2 bg-red-500 rounded-full" /> Offline</>
                )}
              </div>
            </div>
            {!proxyStatus.running && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Para iniciar o servidor proxy, execute: <code className="bg-gray-200 px-2 py-1 rounded">npm run rtsp-proxy</code></p>
              </div>
            )}
          </div>

          {/* Status e Controles */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                status.connected 
                  ? 'bg-green-100 text-green-800' 
                  : status.loading 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {status.connected ? (
                  <><Wifi className="w-4 h-4" /> Conectado</>
                ) : status.loading ? (
                  <><div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" /> Conectando...</>
                ) : (
                  <><WifiOff className="w-4 h-4" /> Desconectado</>
                )}
              </div>
              
              {status.hlsUrl && (
                <div className="text-sm text-gray-600">
                  <span>HLS: </span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">{status.hlsUrl}</code>
                </div>
              )}
              
              {status.error && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{status.error}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleConnect}
                disabled={status.connected || status.loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                Conectar
              </button>
              <button
                onClick={handleDisconnect}
                disabled={!status.connected && !status.loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Square className="w-4 h-4" />
                Desconectar
              </button>
            </div>
          </div>

          {/* Área do Vídeo */}
          <div className="bg-black rounded-lg aspect-video mb-6 flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full h-full rounded-lg"
              controls
              autoPlay
              muted
              style={{ display: status.connected ? 'block' : 'none' }}
            />
            {!status.connected && (
              <div className="text-white text-center">
                <div className="text-6xl mb-4">📹</div>
                <p className="text-lg">Stream não conectado</p>
                <p className="text-sm text-gray-400 mt-2">
                  Configure os parâmetros e clique em "Conectar" para iniciar o streaming
                </p>
              </div>
            )}
          </div>

          {/* Logs */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">Logs de Debug</h3>
            <div className="bg-black rounded p-3 h-32 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum log disponível</p>
              ) : (
                logs.map((log, index) => (
                  <p key={`log-${index}-${Date.now()}`} className="text-green-400 text-sm font-mono">
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Informações Técnicas */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-semibold mb-2">ℹ️ Informações Técnicas</h3>
          <div className="text-blue-700 text-sm space-y-1">
            <p><strong>Solução Implementada:</strong> Servidor proxy Node.js + FFmpeg convertendo RTSP para HLS</p>
            <p><strong>Player:</strong> HLS.js para reprodução no navegador</p>
            <p><strong>URL RTSP:</strong> {buildRTSPUrl().replace(config.password, '***')}</p>
            <p><strong>Servidor Proxy:</strong> http://localhost:3001 (execute: npm run rtsp-proxy)</p>
            <p><strong>Latência:</strong> ~5-10 segundos devido à conversão HLS</p>
            <p><strong>Requisitos:</strong> FFmpeg instalado no sistema</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RTSPStreaming