import React, { useState, useEffect } from 'react';

// Função utilitária para validar se uma string é um JWT válido
const isValidJWT = (token: string): boolean => {
  console.log('🔍 Validando JWT...');
  console.log('📝 Token recebido:', token.substring(0, 100) + '...');
  console.log('📏 Tamanho do token:', token.length);
  
  if (!token || typeof token !== 'string') {
    console.log('❌ Token inválido: não é string ou está vazio');
    return false;
  }
  
  // JWT deve começar com 'eyJ' e ter pelo menos 3 partes separadas por '.'
  if (!token.startsWith('eyJ')) {
    console.log('❌ Token não começa com "eyJ"');
    return false;
  }
  
  const parts = token.split('.');
  console.log('📊 Número de partes do JWT:', parts.length);
  console.log('📊 Tamanhos das partes:', parts.map(p => p.length));
  
  if (parts.length !== 3) {
    console.log('❌ JWT deve ter exatamente 3 partes separadas por "."');
    return false;
  }
  
  // Verificar se cada parte tem conteúdo
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].length === 0) {
      console.log(`❌ Parte ${i + 1} do JWT está vazia`);
      return false;
    }
  }
  
  // Tentar decodificar as partes (validação mais flexível)
  try {
    // Decodificar header
    const headerPadded = parts[0] + '='.repeat((4 - parts[0].length % 4) % 4);
    const header = JSON.parse(atob(headerPadded));
    console.log('✅ Header decodificado:', header);
    
    // Decodificar payload
    const payloadPadded = parts[1] + '='.repeat((4 - parts[1].length % 4) % 4);
    const payload = JSON.parse(atob(payloadPadded));
    console.log('✅ Payload decodificado:', payload);
    
    // A assinatura não precisa ser decodificada como JSON
    console.log('✅ Assinatura presente:', parts[2].length > 0);
    
    console.log('✅ JWT válido!');
    return true;
  } catch (error) {
    console.warn('⚠️ Erro ao decodificar JWT (mas pode ser válido):', error);
    // Se não conseguir decodificar, mas tem a estrutura correta, considerar válido
    if (parts.length === 3 && parts.every(part => part.length > 0)) {
      console.log('✅ JWT com estrutura válida (assumindo como válido)');
      return true;
    }
    return false;
  }
};

// Função utilitária para tentar fazer parse seguro de JSON
const safeJsonParse = (text: string, context: string = 'unknown'): unknown => {
  console.log(`🔍 Tentando parse JSON no contexto: ${context}`);
  console.log(`📝 Conteúdo (primeiros 100 chars): ${text.substring(0, 100)}...`);
  
  if (!text || typeof text !== 'string') {
    throw new Error(`Conteúdo inválido para parse JSON no contexto ${context}: ${typeof text}`);
  }
  
  // Verificar se é um JWT
  if (text.startsWith('eyJ')) {
    console.log(`⚠️ DETECTADO JWT no contexto ${context}!`);
    if (isValidJWT(text)) {
      throw new Error(`Resposta contém um JWT válido em vez de JSON no contexto ${context}`);
    } else {
      throw new Error(`Resposta contém um JWT inválido no contexto ${context}`);
    }
  }
  
  try {
    const parsed = JSON.parse(text);
    console.log(`✅ Parse JSON bem-sucedido no contexto ${context}`);
    return parsed;
  } catch (error) {
    console.error(`❌ Erro de parse JSON no contexto ${context}:`, error);
    throw new Error(`Erro ao fazer parse do JSON no contexto ${context}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

// Interfaces para tipagem
interface JwtCredentials {
  doID: string;
  pLogin: string;
  pPass: string;
  pName: string;
}

interface ApiParams {
  doID: string;
  doIDUser: string;
  start: string;
  end: string;
  ids: string;
  executado: string;
  curView: string;
  status: string;
  colaborador: string;
  clie: string;
  taxi: string;
  tipoVisu: string;
  cancelado: string;
  doContexto: string;
  integrados: string;
  [key: string]: string; // Index signature para compatibilidade com URLSearchParams
}

interface JwtResponse {
  token?: string;
  [key: string]: unknown;
}

const TestSupabase: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('Testando...');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Estados para teste da API de eventos
  const [apiToken, setApiToken] = useState<string>('');
  const [apiResult, setApiResult] = useState<string>('');
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  
  // Estados para obtenção de Token JWT
  const [jwtCredentials, setJwtCredentials] = useState<JwtCredentials>({
    doID: '4958',
    pLogin: 'amarildopa',
    pPass: 'suasenha',
    pName: 'amarildopa'
  });
  const [jwtResult, setJwtResult] = useState<string>('');
  const [isJwtLoading, setIsJwtLoading] = useState<boolean>(false);
  
  const [apiParams, setApiParams] = useState<ApiParams>({
    doID: '1003',
    doIDUser: '0',
    start: '2025-08-31',
    end: '2025-10-12',
    ids: '-8,-12,-16,-6,-4,-2,-10,-8,-14,-12,-16,-9,-80,-18,-16,-14,-12,-10,-9,-8,-6,-4,-3,-2,2,13,8',
    executado: '1',
    curView: 'month',
    status: '3,6,4,7,1,2,5,8,9',
    colaborador: '',
    clie: '',
    taxi: '0',
    tipoVisu: '0',
    cancelado: '0',
    doContexto: '0',
    integrados: '-1'
  });

  useEffect(() => {
    const testConnection = async (): Promise<void> => {
      try {
        // Testar variáveis de ambiente
        const url = import.meta.env.VITE_SUPABASE_URL as string;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
        
        if (!url || !key) {
          setTestResult('❌ VARIÁVEIS NÃO ENCONTRADAS!');
          setIsLoading(false);
          return;
        }

        // Testar conexão com Supabase
        const { supabase } = await import('../lib/supabase');
        
        // Testar autenticação
        const { error: authError } = await supabase.auth.getSession();
        
        // Testar uma query simples
        const { error: queryError } = await supabase
          .from('profiles_pet')
          .select('count')
          .limit(1);
        
        if (authError || queryError) {
          setTestResult(`❌ ERRO: ${authError?.message || queryError?.message}`);
        } else {
          setTestResult('✅ CONEXÃO OK!');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        setTestResult(`❌ ERRO: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    testConnection();
  }, []);

  // Função para obter Token JWT
  const getJwtToken = async (): Promise<void> => {
    setIsJwtLoading(true);
    setJwtResult('Obtendo token...');

    try {
      console.log('🔄 Iniciando requisição JWT...');
      console.log('📤 Credenciais enviadas:', jwtCredentials);
      
      const response = await fetch('https://apidev.dataon.com.br/v2/api/security/GetTokenJwt', {
        method: 'POST',
        headers: {
          'authorization': 'Basic ZGF0YW9uOkRhdGFPbkFQSUAj',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jwtCredentials)
      });

      console.log('📡 Status da resposta:', response.status);
      console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Capturar resposta bruta antes do JSON.parse
      const responseText = await response.text();
      console.log('📥 Resposta bruta recebida:', responseText);
      console.log('📥 Tipo da resposta:', typeof responseText);
      console.log('📥 Tamanho da resposta:', responseText.length);
      
      // Verificar se a resposta começa com um token JWT
      if (responseText.startsWith('eyJ')) {
        console.log('⚠️ DETECTADO: Resposta parece ser um token JWT direto, não JSON!');
        console.log('🔍 Iniciando validação detalhada do JWT...');
        
        const isValid = isValidJWT(responseText);
        console.log('📊 Resultado da validação JWT:', isValid);
        
        if (isValid) {
          console.log('✅ JWT válido detectado - usando como token');
          setApiToken(responseText); // Usar diretamente como token
          setJwtResult(`✅ TOKEN OBTIDO COM SUCESSO (formato direto)!\n\nToken: ${responseText.substring(0, 100)}...\n\nNota: A API retornou o token diretamente, não em formato JSON.\n\nToken completo salvo automaticamente no campo de teste da API.`);
          return;
        } else {
          console.log('❌ JWT inválido detectado');
          // Mesmo sendo "inválido" pela validação rigorosa, vamos tentar usar
          console.log('🔄 Tentando usar o token mesmo assim...');
          setApiToken(responseText);
          setJwtResult(`⚠️ TOKEN RECEBIDO (com avisos)!\n\nToken: ${responseText.substring(0, 100)}...\n\nAviso: O token não passou na validação rigorosa, mas foi salvo para teste.\nVerifique os logs do console para mais detalhes.\n\nTente usar este token na API para ver se funciona.`);
          return;
        }
      }

      // Tentar fazer parse do JSON usando função segura
      const data: JwtResponse = safeJsonParse(responseText, 'getJwtToken');
      
      if (data.token) {
        setApiToken(data.token); // Preenche automaticamente o campo de token
        setJwtResult(`✅ TOKEN OBTIDO COM SUCESSO!\n\nToken: ${data.token}\n\nResposta completa: ${JSON.stringify(data, null, 2)}`);
      } else {
        setJwtResult(`⚠️ Resposta recebida mas sem token:\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro na função getJwtToken:', error);
      setJwtResult(`❌ ERRO: ${errorMessage}`);
    } finally {
      setIsJwtLoading(false);
    }
  };

  // Função para atualizar credenciais JWT
  const updateJwtCredential = (key: keyof JwtCredentials, value: string): void => {
    setJwtCredentials(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Função para testar a API de eventos do calendário
  const testCalendarAPI = async (): Promise<void> => {
    if (!apiToken.trim()) {
      setApiResult('❌ Token é obrigatório!');
      return;
    }

    setIsApiLoading(true);
    setApiResult('Testando API...');

    try {
      console.log('🔄 Iniciando teste da API de calendário...');
      console.log('🔑 Token usado:', apiToken.substring(0, 50) + '...');
      console.log('📤 Parâmetros da API:', apiParams);
      
      // Construir URL com parâmetros
      const baseUrl = 'https://apidev.dataon.com.br/v2/api/agenda/CalendarEvents/GetEvents';
      const queryParams = new URLSearchParams(apiParams).toString();
      const fullUrl = `${baseUrl}?${queryParams}`;
      
      console.log('🌐 URL completa:', fullUrl);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Status da resposta API:', response.status);
      console.log('📡 Headers da resposta API:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Capturar resposta bruta antes do JSON.parse
      const responseText = await response.text();
      console.log('📥 Resposta bruta da API:', responseText);
      console.log('📥 Tipo da resposta API:', typeof responseText);
      console.log('📥 Tamanho da resposta API:', responseText.length);
      
      // Verificar se a resposta começa com um token JWT (erro comum)
      if (responseText.startsWith('eyJ')) {
        console.log('⚠️ DETECTADO: API retornou um token JWT em vez de dados!');
        if (isValidJWT(responseText)) {
          setApiResult(`⚠️ PROBLEMA DETECTADO!\n\nA API retornou um JWT válido em vez dos dados esperados:\n${responseText.substring(0, 200)}...\n\nVerifique se o token de autorização está correto ou se a API está funcionando adequadamente.`);
        } else {
          setApiResult(`❌ PROBLEMA CRÍTICO!\n\nA API retornou um JWT inválido:\n${responseText.substring(0, 200)}...\n\nVerifique a configuração da API.`);
        }
        return;
      }

      // Tentar fazer parse do JSON usando função segura
      const data = safeJsonParse(responseText, 'testCalendarAPI');

      setApiResult(`✅ SUCESSO!\n\nStatus: ${response.status}\nDados recebidos: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro na função testCalendarAPI:', error);
      setApiResult(`❌ ERRO: ${errorMessage}`);
    } finally {
      setIsApiLoading(false);
    }
  };

  // Função para atualizar parâmetros da API
  const updateApiParam = (key: keyof ApiParams, value: string): void => {
    setApiParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-surface pt-8 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-color-dark mb-4">
            Teste de Conexão Supabase & API Externa
          </h1>
          <p className="text-text-color">
            Verificando conectividade e configuração
          </p>
        </div>

        {/* Seção Teste Supabase */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-text-color-dark mb-4">
            Status da Conexão Supabase
          </h2>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600 mb-2">Resultado do Teste:</p>
            <p className={`text-lg font-medium ${testResult.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {isLoading ? 'Testando...' : testResult}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Informações de Debug:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>URL: {import.meta.env.VITE_SUPABASE_URL || 'Não definida'}</p>
              <p>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Definida' : 'Não definida'}</p>
              <p>Ambiente: {import.meta.env.MODE}</p>
            </div>
          </div>
        </div>

        {/* Seção Obtenção de Token JWT */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-text-color-dark mb-4">
            🔑 Obter Token JWT
          </h2>
          
          {/* Credenciais para JWT */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Credenciais de Login</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(jwtCredentials).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                    {key === 'doID' ? 'ID da Organização' : 
                     key === 'pLogin' ? 'Login' : 
                     key === 'pPass' ? 'Senha' : 
                     key === 'pName' ? 'Nome' : key}
                  </label>
                  <input
                    type={key === 'pPass' ? 'password' : 'text'}
                    value={value}
                    onChange={(e) => updateJwtCredential(key as keyof JwtCredentials, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Botão para obter JWT */}
          <div className="mb-6">
            <button
              onClick={getJwtToken}
              disabled={isJwtLoading}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isJwtLoading ? 'Obtendo Token...' : 'Obter Token JWT'}
            </button>
          </div>

          {/* Resultado do JWT */}
          {jwtResult && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Resultado:</h3>
              <pre className={`text-sm whitespace-pre-wrap ${jwtResult.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {jwtResult}
              </pre>
            </div>
          )}

          {/* Informações da API JWT */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">📋 Informações da API JWT:</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Endpoint:</strong> https://apidev.dataon.com.br/v2/api/security/GetTokenJwt</p>
              <p><strong>Método:</strong> POST</p>
              <p><strong>Autenticação:</strong> Basic ZGF0YW9uOkRhdGFPbkFQSUAj</p>
              <p><strong>Parâmetros:</strong></p>
              <ul className="ml-4 list-disc space-y-1">
                <li><strong>doID:</strong> ID da organização</li>
                <li><strong>pLogin:</strong> Nome de usuário</li>
                <li><strong>pPass:</strong> Senha do usuário</li>
                <li><strong>pName:</strong> Nome para identificação</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Seção Teste API Externa */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-text-color-dark mb-4">
            🗓️ Teste API de Eventos do Calendário
          </h2>
          
          {/* Campo Token */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token de Autenticação
              <span className="text-green-600 text-xs ml-2">(Preenchido automaticamente após obter JWT)</span>
            </label>
            <input
              type="text"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Cole aqui o token JWT válido ou obtenha um acima..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Parâmetros da API */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Parâmetros da API</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(apiParams).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                    {key}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateApiParam(key as keyof ApiParams, e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Botão de Teste */}
          <div className="mb-6">
            <button
              onClick={testCalendarAPI}
              disabled={isApiLoading || !apiToken.trim()}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isApiLoading ? 'Testando...' : 'Testar API de Eventos'}
            </button>
          </div>

          {/* Resultado da API */}
          {apiResult && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Resultado da API:</h3>
              <pre className={`text-sm whitespace-pre-wrap ${apiResult.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {apiResult}
              </pre>
            </div>
          )}

          {/* Informações da API */}
          <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">📋 Informações da API:</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p><strong>Endpoint:</strong> https://apidev.dataon.com.br/v2/api/agenda/CalendarEvents/GetEvents</p>
              <p><strong>Método:</strong> GET</p>
              <p><strong>Autenticação:</strong> Bearer Token</p>
              <p><strong>Parâmetros principais:</strong></p>
              <ul className="ml-4 list-disc space-y-1">
                <li><strong>doID:</strong> ID da organização (1003)</li>
                <li><strong>start/end:</strong> Período de consulta (2025-08-31 a 2025-10-12)</li>
                <li><strong>ids:</strong> IDs dos eventos/recursos</li>
                <li><strong>status:</strong> Status dos eventos (3,6,4,7,1,2,5,8,9)</li>
                <li><strong>curView:</strong> Visualização atual (month)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSupabase;
