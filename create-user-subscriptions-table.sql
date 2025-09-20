-- Criar tabela user_subscriptions_pet
CREATE TABLE IF NOT EXISTS user_subscriptions_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans_pet(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active', -- active, paused, cancelled, expired
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  billing_cycle VARCHAR(20) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50), -- credit_card, pix, boleto
  auto_renew BOOLEAN DEFAULT true,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  stripe_subscription_id VARCHAR(100),
  pagseguro_subscription_id VARCHAR(100)
);

-- Índices para user_subscriptions_pet
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_pet_user ON user_subscriptions_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_pet_plan ON user_subscriptions_pet(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_pet_status ON user_subscriptions_pet(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_pet_billing_date ON user_subscriptions_pet(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_pet_stripe ON user_subscriptions_pet(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_pet_pagseguro ON user_subscriptions_pet(pagseguro_subscription_id);

-- Trigger para user_subscriptions_pet
CREATE OR REPLACE FUNCTION update_user_subscriptions_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_subscriptions_pet_updated_at
BEFORE UPDATE ON user_subscriptions_pet
FOR EACH ROW
EXECUTE FUNCTION update_user_subscriptions_pet_updated_at();

-- RLS para user_subscriptions_pet
ALTER TABLE user_subscriptions_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their subscriptions" ON user_subscriptions_pet
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their subscriptions" ON user_subscriptions_pet
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their subscriptions" ON user_subscriptions_pet
FOR UPDATE USING (auth.uid() = user_id);