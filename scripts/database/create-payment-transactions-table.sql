-- Criar tabela para transações de pagamento
CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans_pet(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('pix', 'credit_card')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    
    -- Dados específicos do PIX
    pix_code TEXT,
    qr_code TEXT,
    
    -- Dados específicos do cartão
    card_last_digits TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_plan_id ON payment_transactions(plan_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_method ON payment_transactions(method);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_payment_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_transactions_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias transações
CREATE POLICY "Users can view own payment transactions" ON payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários criarem suas próprias transações
CREATE POLICY "Users can create own payment transactions" ON payment_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias transações (limitado)
CREATE POLICY "Users can update own payment transactions" ON payment_transactions
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Adicionar coluna payment_transaction_id na tabela user_subscriptions_pet (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions_pet' 
        AND column_name = 'payment_transaction_id'
    ) THEN
        ALTER TABLE user_subscriptions_pet 
        ADD COLUMN payment_transaction_id TEXT REFERENCES payment_transactions(id);
        
        -- Índice para a nova coluna
        CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment_transaction 
        ON user_subscriptions_pet(payment_transaction_id);
    END IF;
END $$;

-- Comentários para documentação
COMMENT ON TABLE payment_transactions IS 'Tabela para armazenar transações de pagamento dos planos de assinatura';
COMMENT ON COLUMN payment_transactions.id IS 'ID único da transação (gerado pelo gateway de pagamento)';
COMMENT ON COLUMN payment_transactions.user_id IS 'ID do usuário que fez a transação';
COMMENT ON COLUMN payment_transactions.plan_id IS 'ID do plano de assinatura';
COMMENT ON COLUMN payment_transactions.amount IS 'Valor da transação em reais';
COMMENT ON COLUMN payment_transactions.method IS 'Método de pagamento: pix ou credit_card';
COMMENT ON COLUMN payment_transactions.status IS 'Status da transação: pending, approved, rejected, cancelled';
COMMENT ON COLUMN payment_transactions.billing_cycle IS 'Ciclo de cobrança: monthly ou yearly';
COMMENT ON COLUMN payment_transactions.pix_code IS 'Código PIX para pagamento (apenas para método PIX)';
COMMENT ON COLUMN payment_transactions.qr_code IS 'QR Code em base64 para pagamento PIX';
COMMENT ON COLUMN payment_transactions.card_last_digits IS 'Últimos 4 dígitos do cartão (apenas para cartão)';
COMMENT ON COLUMN payment_transactions.confirmed_at IS 'Timestamp de quando o pagamento foi confirmado';
COMMENT ON COLUMN payment_transactions.metadata IS 'Dados adicionais da transação em formato JSON';