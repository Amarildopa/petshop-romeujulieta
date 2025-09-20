import React from 'react';

const TestSupabase = () => {
  const [testResult, setTestResult] = React.useState('Testando...');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const testConnection = async () => {
      try {
        // Testar variáveis de ambiente
        const url = (import.meta as { env: Record<string, string> }).env.VITE_SUPABASE_URL;
        const key = (import.meta as { env: Record<string, string> }).env.VITE_SUPABASE_ANON_KEY;
        
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
        setTestResult(`❌ ERRO: ${error}`);
      } finally {
        setIsLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-surface pt-8 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-color-dark mb-4">
            Teste de Conexão Supabase
          </h1>
          <p className="text-text-color">
            Verificando conectividade e configuração
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-text-color-dark mb-4">
            Status da Conexão
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
              <p>URL: {(import.meta as { env: Record<string, string> }).env.VITE_SUPABASE_URL || 'Não definida'}</p>
              <p>Key: {(import.meta as { env: Record<string, string> }).env.VITE_SUPABASE_ANON_KEY ? 'Definida' : 'Não definida'}</p>
              <p>Ambiente: {(import.meta as { env: Record<string, string> }).env.MODE}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSupabase;
