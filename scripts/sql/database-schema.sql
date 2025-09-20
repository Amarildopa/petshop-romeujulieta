-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles_pet table
CREATE TABLE profiles_pet (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  cep TEXT,
  avatar_url TEXT
);

-- Create pets_pet table
CREATE TABLE pets_pet (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('Cachorro', 'Gato')),
  breed TEXT NOT NULL,
  age TEXT NOT NULL,
  weight TEXT NOT NULL,
  height TEXT NOT NULL,
  color TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Macho', 'Fêmea')),
  image_url TEXT,
  personality TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  medications TEXT[] DEFAULT '{}'
);

-- Create services_pet table
CREATE TABLE services_pet (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Create appointments_pet table
CREATE TABLE appointments_pet (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES pets_pet(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES services_pet(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  total_price DECIMAL(10,2) NOT NULL,
  extras TEXT[] DEFAULT '{}'
);

-- Create products_pet table
CREATE TABLE products_pet (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT NOT NULL,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER DEFAULT 0,
  badge TEXT CHECK (badge IN ('Bestseller', 'Oferta', 'Novo'))
);

-- Create subscriptions_pet table
CREATE TABLE subscriptions_pet (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'premium', 'vip')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  next_billing_date DATE NOT NULL,
  services_used INTEGER DEFAULT 0,
  services_limit INTEGER NOT NULL,
  cashback_accumulated DECIMAL(10,2) DEFAULT 0.0
);

-- Create service_progress_pet table for tracking service progress
CREATE TABLE service_progress_pet (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  appointment_id UUID REFERENCES appointments_pet(id) ON DELETE CASCADE NOT NULL,
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 6,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  notes TEXT
);

-- Create notifications_pet table
CREATE TABLE notifications_pet (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('appointment', 'service_update', 'promotion', 'health_reminder')),
  is_read BOOLEAN DEFAULT false,
  data JSONB
);

-- Create indexes for better performance
CREATE INDEX idx_pets_pet_owner_id ON pets_pet(owner_id);
CREATE INDEX idx_appointments_pet_user_id ON appointments_pet(user_id);
CREATE INDEX idx_appointments_pet_pet_id ON appointments_pet(pet_id);
CREATE INDEX idx_appointments_pet_date ON appointments_pet(appointment_date);
CREATE INDEX idx_products_pet_category ON products_pet(category);
CREATE INDEX idx_subscriptions_pet_user_id ON subscriptions_pet(user_id);
CREATE INDEX idx_notifications_pet_user_id ON notifications_pet(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_pet_updated_at BEFORE UPDATE ON profiles_pet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pets_pet_updated_at BEFORE UPDATE ON pets_pet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_pet_updated_at BEFORE UPDATE ON services_pet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_pet_updated_at BEFORE UPDATE ON appointments_pet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_pet_updated_at BEFORE UPDATE ON products_pet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_pet_updated_at BEFORE UPDATE ON subscriptions_pet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample services
INSERT INTO services_pet (name, description, price, duration, category, image_url) VALUES
('Banho & Tosa', 'Banho completo, tosa higiênica e estética', 65.00, '2-3 horas', 'grooming', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&h=200&fit=crop'),
('Check-up Veterinário', 'Consulta completa com veterinário especializado', 120.00, '45 minutos', 'veterinary', 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=300&h=200&fit=crop'),
('Daycare/Hotelzinho', 'Cuidado e diversão o dia todo para seu pet', 85.00, 'Dia inteiro', 'daycare', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop'),
('Adestramento', 'Sessão de adestramento com profissional certificado', 200.00, '1 hora', 'training', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop');

-- Insert sample products
INSERT INTO products_pet (name, description, price, original_price, category, image_url, rating, reviews_count, badge) VALUES
('Ração Premium para Cães', 'Ração super premium com ingredientes naturais', 89.90, 99.90, 'food', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop', 4.8, 45, 'Bestseller'),
('Petisco Natural de Frango', 'Petiscos naturais sem conservantes', 24.90, 29.90, 'treats', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop', 4.5, 23, 'Oferta'),
('Coleira Premium', 'Coleira de couro legítimo com fivela de metal', 45.90, NULL, 'accessories', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop', 4.7, 12, NULL),
('Brinquedo Interativo', 'Brinquedo que estimula a mente do seu pet', 35.90, 42.90, 'toys', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop', 4.6, 18, 'Novo');

-- Enable Row Level Security (RLS)
ALTER TABLE profiles_pet ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets_pet ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments_pet ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions_pet ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_pet ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_progress_pet ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON profiles_pet FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles_pet FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles_pet FOR INSERT WITH CHECK (auth.uid() = id);

-- Pets: Users can only see and modify their own pets
CREATE POLICY "Users can view own pets" ON pets_pet FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own pets" ON pets_pet FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own pets" ON pets_pet FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own pets" ON pets_pet FOR DELETE USING (auth.uid() = owner_id);

-- Appointments: Users can only see and modify their own appointments
CREATE POLICY "Users can view own appointments" ON appointments_pet FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own appointments" ON appointments_pet FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own appointments" ON appointments_pet FOR UPDATE USING (auth.uid() = user_id);

-- Subscriptions: Users can only see and modify their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions_pet FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions_pet FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions_pet FOR UPDATE USING (auth.uid() = user_id);

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications_pet FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications_pet FOR UPDATE USING (auth.uid() = user_id);

-- Service progress: Users can only see progress for their own appointments
CREATE POLICY "Users can view own service progress" ON service_progress_pet FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM appointments_pet 
    WHERE appointments_pet.id = service_progress_pet.appointment_id 
    AND appointments_pet.user_id = auth.uid()
  )
);

-- Services and products are public (no RLS needed)
-- But we can add policies if needed for admin-only modifications

-- =============================================
-- TABELAS PARA SISTEMA DE AGENDAMENTOS
-- =============================================

-- Tabela para horários disponíveis
CREATE TABLE IF NOT EXISTS available_slots_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  service_id UUID REFERENCES services_pet(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  max_appointments INTEGER DEFAULT 1,
  current_appointments INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles_pet(id) ON DELETE CASCADE
);

-- Tabela para extras de cuidado
CREATE TABLE IF NOT EXISTS care_extras_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  duration_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  category VARCHAR(50) DEFAULT 'extra'
);

-- Tabela para histórico de serviços
CREATE TABLE IF NOT EXISTS service_history_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  appointment_id UUID REFERENCES appointments_pet(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets_pet(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services_pet(id) ON DELETE CASCADE,
  service_name VARCHAR(100) NOT NULL,
  service_price DECIMAL(10,2) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  photos TEXT[], -- Array de URLs das fotos
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles_pet(id) ON DELETE CASCADE
);

-- Tabela para notificações
CREATE TABLE IF NOT EXISTS notifications_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'appointment', 'reminder', 'promotion', 'system'
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  data JSONB, -- Dados adicionais da notificação
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para configurações de notificação do usuário
CREATE TABLE IF NOT EXISTS notification_settings_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  whatsapp_enabled BOOLEAN DEFAULT true,
  appointment_reminders BOOLEAN DEFAULT true,
  promotion_notifications BOOLEAN DEFAULT true,
  system_notifications BOOLEAN DEFAULT true,
  reminder_hours_before INTEGER DEFAULT 24
);

-- =============================================
-- ÍNDICES PARA NOVAS TABELAS
-- =============================================

-- Índices para available_slots_pet
CREATE INDEX IF NOT EXISTS idx_available_slots_pet_service_date ON available_slots_pet(service_id, date);
CREATE INDEX IF NOT EXISTS idx_available_slots_pet_date_available ON available_slots_pet(date, is_available);
CREATE INDEX IF NOT EXISTS idx_available_slots_pet_created_by ON available_slots_pet(created_by);

-- Índices para care_extras_pet
CREATE INDEX IF NOT EXISTS idx_care_extras_pet_category ON care_extras_pet(category);
CREATE INDEX IF NOT EXISTS idx_care_extras_pet_active ON care_extras_pet(is_active);

-- Índices para service_history_pet
CREATE INDEX IF NOT EXISTS idx_service_history_pet_appointment ON service_history_pet(appointment_id);
CREATE INDEX IF NOT EXISTS idx_service_history_pet_pet ON service_history_pet(pet_id);
CREATE INDEX IF NOT EXISTS idx_service_history_pet_service ON service_history_pet(service_id);
CREATE INDEX IF NOT EXISTS idx_service_history_pet_created_by ON service_history_pet(created_by);
CREATE INDEX IF NOT EXISTS idx_service_history_pet_completed_at ON service_history_pet(completed_at);

-- Índices para notifications_pet
CREATE INDEX IF NOT EXISTS idx_notifications_pet_user ON notifications_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_pet_type ON notifications_pet(type);
CREATE INDEX IF NOT EXISTS idx_notifications_pet_read ON notifications_pet(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_pet_expires ON notifications_pet(expires_at);

-- Índices para notification_settings_pet
CREATE INDEX IF NOT EXISTS idx_notification_settings_pet_user ON notification_settings_pet(user_id);

-- =============================================
-- TRIGGERS PARA NOVAS TABELAS
-- =============================================

-- Trigger para available_slots_pet
CREATE OR REPLACE FUNCTION update_available_slots_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_available_slots_pet_updated_at
  BEFORE UPDATE ON available_slots_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_available_slots_pet_updated_at();

-- Trigger para care_extras_pet
CREATE OR REPLACE FUNCTION update_care_extras_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_care_extras_pet_updated_at
  BEFORE UPDATE ON care_extras_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_care_extras_pet_updated_at();

-- Trigger para service_history_pet
CREATE OR REPLACE FUNCTION update_service_history_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_service_history_pet_updated_at
  BEFORE UPDATE ON service_history_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_service_history_pet_updated_at();

-- Trigger para notifications_pet
CREATE OR REPLACE FUNCTION update_notifications_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notifications_pet_updated_at
  BEFORE UPDATE ON notifications_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_pet_updated_at();

-- Trigger para notification_settings_pet
CREATE OR REPLACE FUNCTION update_notification_settings_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_settings_pet_updated_at
  BEFORE UPDATE ON notification_settings_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_settings_pet_updated_at();

-- =============================================
-- RLS POLICIES PARA NOVAS TABELAS
-- =============================================

-- RLS para available_slots_pet
ALTER TABLE available_slots_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view available slots" ON available_slots_pet
  FOR SELECT USING (true);

CREATE POLICY "Users can insert available slots" ON available_slots_pet
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update available slots" ON available_slots_pet
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete available slots" ON available_slots_pet
  FOR DELETE USING (auth.uid() = created_by);

-- RLS para care_extras_pet
ALTER TABLE care_extras_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view care extras" ON care_extras_pet
  FOR SELECT USING (is_active = true);

-- RLS para service_history_pet
ALTER TABLE service_history_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their service history" ON service_history_pet
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert service history" ON service_history_pet
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update service history" ON service_history_pet
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS para notifications_pet
ALTER TABLE notifications_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications" ON notifications_pet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON notifications_pet
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications" ON notifications_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS para notification_settings_pet
ALTER TABLE notification_settings_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notification settings" ON notification_settings_pet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notification settings" ON notification_settings_pet
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notification settings" ON notification_settings_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- DADOS INICIAIS PARA NOVAS TABELAS
-- =============================================

-- Inserir extras de cuidado
INSERT INTO care_extras_pet (name, description, price, duration_minutes, category) VALUES
('Corte de Unhas', 'Corte profissional das unhas', 15.00, 15, 'grooming'),
('Limpeza de Ouvidos', 'Limpeza e higienização dos ouvidos', 20.00, 10, 'grooming'),
('Escovação de Dentes', 'Escovação e limpeza dos dentes', 25.00, 20, 'grooming'),
('Hidratação', 'Tratamento hidratante para pelagem', 30.00, 30, 'grooming'),
('Perfume', 'Aplicação de perfume especial', 10.00, 5, 'grooming'),
('Fotografia', 'Sessão de fotos durante o serviço', 50.00, 45, 'photo'),
('Relatório Detalhado', 'Relatório completo do serviço', 15.00, 0, 'report'),
('Transporte', 'Serviço de busca e entrega', 25.00, 60, 'transport');

-- Inserir configurações padrão de notificação
INSERT INTO notification_settings_pet (user_id, email_enabled, push_enabled, whatsapp_enabled, appointment_reminders, promotion_notifications, system_notifications, reminder_hours_before)
SELECT id, true, true, true, true, true, true, 24
FROM profiles_pet;

-- =============================================
-- TABELAS PARA SISTEMA DE LOJA
-- =============================================

-- Tabela para carrinho de compras
CREATE TABLE IF NOT EXISTS cart_items_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products_pet(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_time DECIMAL(10,2) NOT NULL, -- Preço no momento da adição
  UNIQUE(user_id, product_id)
);

-- Tabela para pedidos
CREATE TABLE IF NOT EXISTS orders_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  final_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50), -- credit_card, pix, boleto
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  notes TEXT,
  tracking_code VARCHAR(100),
  estimated_delivery DATE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para itens do pedido
CREATE TABLE IF NOT EXISTS order_items_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_id UUID REFERENCES orders_pet(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products_pet(id) ON DELETE CASCADE,
  product_name VARCHAR(200) NOT NULL,
  product_description TEXT,
  product_image_url TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);

-- Tabela para cupons de desconto
CREATE TABLE IF NOT EXISTS coupons_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL, -- percentage, fixed_amount, free_shipping
  value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0.00,
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles_pet(id) ON DELETE CASCADE
);

-- Tabela para histórico de uso de cupons
CREATE TABLE IF NOT EXISTS coupon_usage_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  coupon_id UUID REFERENCES coupons_pet(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders_pet(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10,2) NOT NULL
);

-- Tabela para avaliações de produtos
CREATE TABLE IF NOT EXISTS product_reviews_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  product_id UUID REFERENCES products_pet(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders_pet(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_helpful_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  response TEXT, -- Resposta do vendedor
  response_date TIMESTAMP WITH TIME ZONE
);

-- Tabela para favoritos
CREATE TABLE IF NOT EXISTS wishlist_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products_pet(id) ON DELETE CASCADE,
  UNIQUE(user_id, product_id)
);

-- Tabela para categorias de produtos
CREATE TABLE IF NOT EXISTS product_categories_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES product_categories_pet(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  meta_title VARCHAR(200),
  meta_description TEXT
);

-- Tabela para relacionamento produto-categoria
CREATE TABLE IF NOT EXISTS product_category_relations_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products_pet(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories_pet(id) ON DELETE CASCADE,
  UNIQUE(product_id, category_id)
);

-- Tabela para estoque
CREATE TABLE IF NOT EXISTS inventory_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  product_id UUID REFERENCES products_pet(id) ON DELETE CASCADE,
  current_stock INTEGER NOT NULL DEFAULT 0,
  reserved_stock INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  max_stock_level INTEGER,
  reorder_point INTEGER DEFAULT 0,
  last_restocked_at TIMESTAMP WITH TIME ZONE,
  last_sold_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para histórico de movimentação de estoque
CREATE TABLE IF NOT EXISTS stock_movements_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  product_id UUID REFERENCES products_pet(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- in, out, adjustment, return
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason VARCHAR(200),
  reference_id UUID, -- ID do pedido, ajuste, etc.
  created_by UUID REFERENCES profiles_pet(id) ON DELETE CASCADE
);

-- =============================================
-- ÍNDICES PARA TABELAS DE LOJA
-- =============================================

-- Índices para cart_items_pet
CREATE INDEX IF NOT EXISTS idx_cart_items_pet_user ON cart_items_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_pet_product ON cart_items_pet(product_id);

-- Índices para orders_pet
CREATE INDEX IF NOT EXISTS idx_orders_pet_user ON orders_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_pet_status ON orders_pet(status);
CREATE INDEX IF NOT EXISTS idx_orders_pet_payment_status ON orders_pet(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_pet_created_at ON orders_pet(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_pet_order_number ON orders_pet(order_number);

-- Índices para order_items_pet
CREATE INDEX IF NOT EXISTS idx_order_items_pet_order ON order_items_pet(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_pet_product ON order_items_pet(product_id);

-- Índices para coupons_pet
CREATE INDEX IF NOT EXISTS idx_coupons_pet_code ON coupons_pet(code);
CREATE INDEX IF NOT EXISTS idx_coupons_pet_active ON coupons_pet(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_pet_valid ON coupons_pet(valid_from, valid_until);

-- Índices para coupon_usage_pet
CREATE INDEX IF NOT EXISTS idx_coupon_usage_pet_user ON coupon_usage_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_pet_coupon ON coupon_usage_pet(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_pet_order ON coupon_usage_pet(order_id);

-- Índices para product_reviews_pet
CREATE INDEX IF NOT EXISTS idx_product_reviews_pet_product ON product_reviews_pet(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_pet_user ON product_reviews_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_pet_rating ON product_reviews_pet(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_pet_approved ON product_reviews_pet(is_approved);

-- Índices para wishlist_pet
CREATE INDEX IF NOT EXISTS idx_wishlist_pet_user ON wishlist_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_pet_product ON wishlist_pet(product_id);

-- Índices para product_categories_pet
CREATE INDEX IF NOT EXISTS idx_product_categories_pet_slug ON product_categories_pet(slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_pet_parent ON product_categories_pet(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_pet_active ON product_categories_pet(is_active);

-- Índices para product_category_relations_pet
CREATE INDEX IF NOT EXISTS idx_product_category_relations_pet_product ON product_category_relations_pet(product_id);
CREATE INDEX IF NOT EXISTS idx_product_category_relations_pet_category ON product_category_relations_pet(category_id);

-- Índices para inventory_pet
CREATE INDEX IF NOT EXISTS idx_inventory_pet_product ON inventory_pet(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_pet_stock ON inventory_pet(current_stock);

-- Índices para stock_movements_pet
CREATE INDEX IF NOT EXISTS idx_stock_movements_pet_product ON stock_movements_pet(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_pet_type ON stock_movements_pet(type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_pet_created_at ON stock_movements_pet(created_at);

-- =============================================
-- TRIGGERS PARA TABELAS DE LOJA
-- =============================================

-- Trigger para cart_items_pet
CREATE OR REPLACE FUNCTION update_cart_items_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cart_items_pet_updated_at
  BEFORE UPDATE ON cart_items_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_items_pet_updated_at();

-- Trigger para orders_pet
CREATE OR REPLACE FUNCTION update_orders_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_orders_pet_updated_at
  BEFORE UPDATE ON orders_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_pet_updated_at();

-- Trigger para order_items_pet
CREATE OR REPLACE FUNCTION update_order_items_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_order_items_pet_updated_at
  BEFORE UPDATE ON order_items_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_order_items_pet_updated_at();

-- Trigger para coupons_pet
CREATE OR REPLACE FUNCTION update_coupons_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_coupons_pet_updated_at
  BEFORE UPDATE ON coupons_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_coupons_pet_updated_at();

-- Trigger para product_reviews_pet
CREATE OR REPLACE FUNCTION update_product_reviews_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_reviews_pet_updated_at
  BEFORE UPDATE ON product_reviews_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_product_reviews_pet_updated_at();

-- Trigger para product_categories_pet
CREATE OR REPLACE FUNCTION update_product_categories_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_categories_pet_updated_at
  BEFORE UPDATE ON product_categories_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_product_categories_pet_updated_at();

-- Trigger para inventory_pet
CREATE OR REPLACE FUNCTION update_inventory_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_pet_updated_at
  BEFORE UPDATE ON inventory_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_pet_updated_at();

-- =============================================
-- RLS POLICIES PARA TABELAS DE LOJA
-- =============================================

-- RLS para cart_items_pet
ALTER TABLE cart_items_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their cart items" ON cart_items_pet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their cart items" ON cart_items_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their cart items" ON cart_items_pet
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their cart items" ON cart_items_pet
  FOR DELETE USING (auth.uid() = user_id);

-- RLS para orders_pet
ALTER TABLE orders_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their orders" ON orders_pet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their orders" ON orders_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their orders" ON orders_pet
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS para order_items_pet
ALTER TABLE order_items_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their order items" ON order_items_pet
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders_pet 
      WHERE orders_pet.id = order_items_pet.order_id 
      AND orders_pet.user_id = auth.uid()
    )
  );

-- RLS para coupons_pet
ALTER TABLE coupons_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active coupons" ON coupons_pet
  FOR SELECT USING (is_active = true AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until >= NOW()));

-- RLS para coupon_usage_pet
ALTER TABLE coupon_usage_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their coupon usage" ON coupon_usage_pet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their coupon usage" ON coupon_usage_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS para product_reviews_pet
ALTER TABLE product_reviews_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view approved reviews" ON product_reviews_pet
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can insert their reviews" ON product_reviews_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their reviews" ON product_reviews_pet
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS para wishlist_pet
ALTER TABLE wishlist_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their wishlist" ON wishlist_pet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their wishlist items" ON wishlist_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their wishlist items" ON wishlist_pet
  FOR DELETE USING (auth.uid() = user_id);

-- RLS para product_categories_pet
ALTER TABLE product_categories_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active categories" ON product_categories_pet
  FOR SELECT USING (is_active = true);

-- RLS para product_category_relations_pet
ALTER TABLE product_category_relations_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view product categories" ON product_category_relations_pet
  FOR SELECT USING (true);

-- RLS para inventory_pet
ALTER TABLE inventory_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view inventory" ON inventory_pet
  FOR SELECT USING (true);

-- RLS para stock_movements_pet
ALTER TABLE stock_movements_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stock movements" ON stock_movements_pet
  FOR SELECT USING (true);

-- =============================================
-- DADOS INICIAIS PARA TABELAS DE LOJA
-- =============================================

-- Inserir categorias de produtos
INSERT INTO product_categories_pet (name, slug, description, is_active, sort_order) VALUES
('Ração', 'racao', 'Alimentos secos para pets', true, 1),
('Petiscos', 'petiscos', 'Petiscos e guloseimas', true, 2),
('Brinquedos', 'brinquedos', 'Brinquedos para diversão', true, 3),
('Higiene', 'higiene', 'Produtos de higiene e limpeza', true, 4),
('Acessórios', 'acessorios', 'Coleiras, guias e acessórios', true, 5),
('Medicamentos', 'medicamentos', 'Medicamentos e suplementos', true, 6),
('Camas e Casinhas', 'camas-casinhas', 'Camas, casinhas e conforto', true, 7),
('Transporte', 'transporte', 'Caixas de transporte e carrinhos', true, 8);

-- Inserir cupons de desconto
INSERT INTO coupons_pet (code, name, description, type, value, min_order_amount, usage_limit, valid_until) VALUES
('BEMVINDO10', 'Bem-vindo - 10% OFF', 'Desconto de boas-vindas para novos clientes', 'percentage', 10.00, 50.00, 100, NOW() + INTERVAL '30 days'),
('FRETE15', 'Frete Grátis', 'Frete grátis para compras acima de R$ 100', 'free_shipping', 0.00, 100.00, 50, NOW() + INTERVAL '15 days'),
('PETS20', '20% OFF Pet Shop', 'Desconto especial em produtos selecionados', 'percentage', 20.00, 80.00, 200, NOW() + INTERVAL '60 days'),
('FIXO25', 'R$ 25 OFF', 'Desconto fixo de R$ 25', 'fixed_amount', 25.00, 150.00, 75, NOW() + INTERVAL '45 days');

-- =============================================
-- TABELAS PARA SISTEMA DE ASSINATURAS E PAGAMENTOS
-- =============================================

-- Tabela para planos de assinatura
CREATE TABLE IF NOT EXISTS subscription_plans_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL, -- monthly, quarterly, yearly
  features JSONB NOT NULL, -- Array de features incluídas
  max_pets INTEGER DEFAULT 1,
  max_appointments INTEGER DEFAULT 10,
  max_products_discount DECIMAL(5,2) DEFAULT 0.00, -- Desconto em produtos (%)
  free_delivery BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  stripe_price_id VARCHAR(100), -- ID do preço no Stripe
  pagseguro_plan_id VARCHAR(100) -- ID do plano no PagSeguro
);

-- Tabela para assinaturas dos usuários
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

-- Tabela para histórico de pagamentos
CREATE TABLE IF NOT EXISTS payment_history_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions_pet(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders_pet(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL, -- pending, paid, failed, refunded, cancelled
  payment_provider VARCHAR(50) NOT NULL, -- stripe, pagseguro, pix, boleto
  external_payment_id VARCHAR(100), -- ID do pagamento no provedor
  transaction_id VARCHAR(100), -- ID da transação
  payment_date TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  refund_amount DECIMAL(10,2) DEFAULT 0.00,
  refund_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB -- Dados adicionais do pagamento
);

-- Tabela para métodos de pagamento salvos
CREATE TABLE IF NOT EXISTS saved_payment_methods_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- credit_card, debit_card, pix, boleto
  provider VARCHAR(50) NOT NULL, -- stripe, pagseguro
  external_id VARCHAR(100) NOT NULL, -- ID no provedor
  last_four_digits VARCHAR(4),
  brand VARCHAR(50), -- visa, mastercard, etc
  expiry_month INTEGER,
  expiry_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB
);

-- Tabela para transações de cashback
CREATE TABLE IF NOT EXISTS cashback_transactions_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders_pet(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL, -- Percentual de cashback
  status VARCHAR(50) DEFAULT 'pending', -- pending, available, used, expired
  expires_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE,
  used_order_id UUID REFERENCES orders_pet(id) ON DELETE CASCADE,
  description TEXT
);

-- Tabela para promoções e ofertas
CREATE TABLE IF NOT EXISTS promotions_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- discount, cashback, free_shipping, free_service
  value DECIMAL(10,2) NOT NULL,
  value_type VARCHAR(20) NOT NULL, -- percentage, fixed_amount
  min_order_amount DECIMAL(10,2) DEFAULT 0.00,
  max_discount_amount DECIMAL(10,2),
  applicable_to VARCHAR(50) DEFAULT 'all', -- all, products, services, subscriptions
  target_audience VARCHAR(50) DEFAULT 'all', -- all, new_users, subscribers, vip
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles_pet(id) ON DELETE CASCADE
);

-- Tabela para uso de promoções
CREATE TABLE IF NOT EXISTS promotion_usage_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  promotion_id UUID REFERENCES promotions_pet(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders_pet(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para configurações de pagamento
CREATE TABLE IF NOT EXISTS payment_settings_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  provider VARCHAR(50) NOT NULL, -- stripe, pagseguro, pix, boleto
  is_enabled BOOLEAN DEFAULT true,
  public_key TEXT,
  secret_key TEXT,
  webhook_secret TEXT,
  sandbox_mode BOOLEAN DEFAULT true,
  settings JSONB, -- Configurações específicas do provedor
  created_by UUID REFERENCES profiles_pet(id) ON DELETE CASCADE
);

-- =============================================
-- ÍNDICES PARA TABELAS DE ASSINATURAS E PAGAMENTOS
-- =============================================

-- Índices para subscription_plans_pet
CREATE INDEX IF NOT EXISTS idx_subscription_plans_pet_active ON subscription_plans_pet(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_pet_billing_cycle ON subscription_plans_pet(billing_cycle);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_pet_sort_order ON subscription_plans_pet(sort_order);

-- Índices para user_subscriptions_pet
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_pet_user ON user_subscriptions_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_pet_plan ON user_subscriptions_pet(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_pet_status ON user_subscriptions_pet(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_pet_billing_date ON user_subscriptions_pet(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_pet_stripe ON user_subscriptions_pet(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_pet_pagseguro ON user_subscriptions_pet(pagseguro_subscription_id);

-- Índices para payment_history_pet
CREATE INDEX IF NOT EXISTS idx_payment_history_pet_user ON payment_history_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_pet_subscription ON payment_history_pet(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_pet_order ON payment_history_pet(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_pet_status ON payment_history_pet(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_history_pet_provider ON payment_history_pet(payment_provider);
CREATE INDEX IF NOT EXISTS idx_payment_history_pet_date ON payment_history_pet(payment_date);

-- Índices para saved_payment_methods_pet
CREATE INDEX IF NOT EXISTS idx_saved_payment_methods_pet_user ON saved_payment_methods_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_payment_methods_pet_type ON saved_payment_methods_pet(type);
CREATE INDEX IF NOT EXISTS idx_saved_payment_methods_pet_provider ON saved_payment_methods_pet(provider);
CREATE INDEX IF NOT EXISTS idx_saved_payment_methods_pet_active ON saved_payment_methods_pet(is_active);

-- Índices para cashback_transactions_pet
CREATE INDEX IF NOT EXISTS idx_cashback_transactions_pet_user ON cashback_transactions_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_cashback_transactions_pet_order ON cashback_transactions_pet(order_id);
CREATE INDEX IF NOT EXISTS idx_cashback_transactions_pet_status ON cashback_transactions_pet(status);
CREATE INDEX IF NOT EXISTS idx_cashback_transactions_pet_expires ON cashback_transactions_pet(expires_at);

-- Índices para promotions_pet
CREATE INDEX IF NOT EXISTS idx_promotions_pet_active ON promotions_pet(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_pet_type ON promotions_pet(type);
CREATE INDEX IF NOT EXISTS idx_promotions_pet_dates ON promotions_pet(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_pet_audience ON promotions_pet(target_audience);

-- Índices para promotion_usage_pet
CREATE INDEX IF NOT EXISTS idx_promotion_usage_pet_user ON promotion_usage_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usage_pet_promotion ON promotion_usage_pet(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usage_pet_order ON promotion_usage_pet(order_id);

-- Índices para payment_settings_pet
CREATE INDEX IF NOT EXISTS idx_payment_settings_pet_provider ON payment_settings_pet(provider);
CREATE INDEX IF NOT EXISTS idx_payment_settings_pet_enabled ON payment_settings_pet(is_enabled);

-- =============================================
-- TRIGGERS PARA TABELAS DE ASSINATURAS E PAGAMENTOS
-- =============================================

-- Trigger para subscription_plans_pet
CREATE OR REPLACE FUNCTION update_subscription_plans_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscription_plans_pet_updated_at
  BEFORE UPDATE ON subscription_plans_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_plans_pet_updated_at();

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

-- Trigger para payment_history_pet
CREATE OR REPLACE FUNCTION update_payment_history_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payment_history_pet_updated_at
  BEFORE UPDATE ON payment_history_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_history_pet_updated_at();

-- Trigger para saved_payment_methods_pet
CREATE OR REPLACE FUNCTION update_saved_payment_methods_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_saved_payment_methods_pet_updated_at
  BEFORE UPDATE ON saved_payment_methods_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_payment_methods_pet_updated_at();

-- Trigger para cashback_transactions_pet
CREATE OR REPLACE FUNCTION update_cashback_transactions_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cashback_transactions_pet_updated_at
  BEFORE UPDATE ON cashback_transactions_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_cashback_transactions_pet_updated_at();

-- Trigger para promotions_pet
CREATE OR REPLACE FUNCTION update_promotions_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_promotions_pet_updated_at
  BEFORE UPDATE ON promotions_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_promotions_pet_updated_at();

-- Trigger para payment_settings_pet
CREATE OR REPLACE FUNCTION update_payment_settings_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payment_settings_pet_updated_at
  BEFORE UPDATE ON payment_settings_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_settings_pet_updated_at();

-- =============================================
-- RLS POLICIES PARA TABELAS DE ASSINATURAS E PAGAMENTOS
-- =============================================

-- RLS para subscription_plans_pet
ALTER TABLE subscription_plans_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active subscription plans" ON subscription_plans_pet
  FOR SELECT USING (is_active = true);

-- RLS para user_subscriptions_pet
ALTER TABLE user_subscriptions_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their subscriptions" ON user_subscriptions_pet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their subscriptions" ON user_subscriptions_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their subscriptions" ON user_subscriptions_pet
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS para payment_history_pet
ALTER TABLE payment_history_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their payment history" ON payment_history_pet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their payment history" ON payment_history_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS para saved_payment_methods_pet
ALTER TABLE saved_payment_methods_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their saved payment methods" ON saved_payment_methods_pet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their saved payment methods" ON saved_payment_methods_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their saved payment methods" ON saved_payment_methods_pet
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved payment methods" ON saved_payment_methods_pet
  FOR DELETE USING (auth.uid() = user_id);

-- RLS para cashback_transactions_pet
ALTER TABLE cashback_transactions_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their cashback transactions" ON cashback_transactions_pet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their cashback transactions" ON cashback_transactions_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their cashback transactions" ON cashback_transactions_pet
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS para promotions_pet
ALTER TABLE promotions_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active promotions" ON promotions_pet
  FOR SELECT USING (is_active = true AND start_date <= NOW() AND (end_date IS NULL OR end_date >= NOW()));

-- RLS para promotion_usage_pet
ALTER TABLE promotion_usage_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their promotion usage" ON promotion_usage_pet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their promotion usage" ON promotion_usage_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS para payment_settings_pet
ALTER TABLE payment_settings_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payment settings" ON payment_settings_pet
  FOR SELECT USING (is_enabled = true);

-- =============================================
-- DADOS INICIAIS PARA TABELAS DE ASSINATURAS E PAGAMENTOS
-- =============================================

-- Inserir planos de assinatura
INSERT INTO subscription_plans_pet (name, description, price, billing_cycle, features, max_pets, max_appointments, max_products_discount, free_delivery, priority_support, sort_order) VALUES
('Básico', 'Plano ideal para quem tem 1 pet e poucos agendamentos', 29.90, 'monthly', '["Agendamentos básicos", "Desconto 5% em produtos", "Suporte por email"]', 1, 5, 5.00, false, false, 1),
('Premium', 'Plano completo para famílias com múltiplos pets', 59.90, 'monthly', '["Agendamentos ilimitados", "Desconto 15% em produtos", "Frete grátis", "Suporte prioritário", "Acesso a serviços exclusivos"]', 5, 999, 15.00, true, true, 2),
('Família', 'Plano para famílias grandes com muitos pets', 99.90, 'monthly', '["Agendamentos ilimitados", "Desconto 25% em produtos", "Frete grátis", "Suporte VIP", "Serviços premium", "Cashback 5%"]', 10, 999, 25.00, true, true, 3),
('Anual Premium', 'Plano Premium com desconto anual', 599.90, 'yearly', '["Agendamentos ilimitados", "Desconto 20% em produtos", "Frete grátis", "Suporte prioritário", "2 meses grátis"]', 5, 999, 20.00, true, true, 4);

-- Inserir configurações de pagamento
INSERT INTO payment_settings_pet (provider, is_enabled, sandbox_mode, settings) VALUES
('stripe', true, true, '{"publishable_key": "pk_test_...", "webhook_endpoint": "/api/webhooks/stripe"}'),
('pagseguro', true, true, '{"email": "test@example.com", "token": "test_token", "webhook_url": "/api/webhooks/pagseguro"}'),
('pix', true, false, '{"bank_code": "001", "account_type": "checking"}'),
('boleto', true, false, '{"bank_code": "001", "due_days": 3}');

-- Inserir promoções iniciais
INSERT INTO promotions_pet (name, description, type, value, value_type, min_order_amount, applicable_to, target_audience, usage_limit, end_date) VALUES
('Primeira Assinatura', '50% OFF na primeira mensalidade', 'discount', 50.00, 'percentage', 0.00, 'subscriptions', 'new_users', 1, NOW() + INTERVAL '30 days'),
('Cashback Especial', '10% de cashback em compras acima de R$ 200', 'cashback', 10.00, 'percentage', 200.00, 'products', 'subscribers', 100, NOW() + INTERVAL '60 days'),
('Frete Grátis VIP', 'Frete grátis para assinantes Premium', 'free_shipping', 0.00, 'fixed_amount', 0.00, 'all', 'subscribers', 999, NOW() + INTERVAL '90 days');

-- =============================================
-- TABELAS PARA SISTEMA DE COMUNICAÇÃO E NOTIFICAÇÕES
-- =============================================

-- Tabela para mensagens do chat
CREATE TABLE IF NOT EXISTS chat_messages_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  chat_room_id UUID NOT NULL,
  sender_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  message_type VARCHAR(20) DEFAULT 'text', -- text, image, file, system
  content TEXT NOT NULL,
  file_url TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  reply_to_id UUID REFERENCES chat_messages_pet(id) ON DELETE CASCADE,
  metadata JSONB -- Dados adicionais da mensagem
);

-- Tabela para salas de chat
CREATE TABLE IF NOT EXISTS chat_rooms_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(200),
  description TEXT,
  room_type VARCHAR(20) DEFAULT 'private', -- private, group, support, broadcast
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_id UUID REFERENCES chat_messages_pet(id) ON DELETE SET NULL,
  metadata JSONB
);

-- Tabela para participantes das salas de chat
CREATE TABLE IF NOT EXISTS chat_room_participants_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  room_id UUID REFERENCES chat_rooms_pet(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- member, admin, moderator
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  is_muted BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  UNIQUE(room_id, user_id)
);

-- Tabela para templates de notificações
CREATE TABLE IF NOT EXISTS notification_templates_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- email, sms, push, whatsapp
  subject VARCHAR(200),
  content TEXT NOT NULL,
  variables JSONB, -- Variáveis disponíveis no template
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles_pet(id) ON DELETE CASCADE
);

-- Tabela para campanhas de marketing
CREATE TABLE IF NOT EXISTS marketing_campaigns_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- email, sms, push, whatsapp
  status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, running, paused, completed, cancelled
  target_audience VARCHAR(50) DEFAULT 'all', -- all, subscribers, vip, new_users
  template_id UUID REFERENCES notification_templates_pet(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  metadata JSONB
);

-- Tabela para envio de campanhas
CREATE TABLE IF NOT EXISTS campaign_recipients_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  campaign_id UUID REFERENCES marketing_campaigns_pet(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, failed
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  metadata JSONB
);

-- Tabela para feedback e avaliações
CREATE TABLE IF NOT EXISTS feedback_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- service, product, app, support
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  category VARCHAR(50), -- bug, feature_request, complaint, compliment
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_review, resolved, closed
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  assigned_to UUID REFERENCES profiles_pet(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution TEXT,
  metadata JSONB
);

-- Tabela para FAQ
CREATE TABLE IF NOT EXISTS faq_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  tags TEXT[], -- Array de tags
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles_pet(id) ON DELETE CASCADE
);

-- Tabela para artigos de ajuda
CREATE TABLE IF NOT EXISTS help_articles_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category VARCHAR(100),
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  author_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  meta_title VARCHAR(200),
  meta_description TEXT
);

-- Tabela para configurações de comunicação
CREATE TABLE IF NOT EXISTS communication_settings_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT true,
  appointment_reminders BOOLEAN DEFAULT true,
  order_updates BOOLEAN DEFAULT true,
  system_notifications BOOLEAN DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  language VARCHAR(10) DEFAULT 'pt-BR'
);

-- Tabela para logs de comunicação
CREATE TABLE IF NOT EXISTS communication_logs_pet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- email, sms, push, whatsapp, in_app
  channel VARCHAR(50) NOT NULL, -- email, sms, push, whatsapp, chat
  status VARCHAR(20) NOT NULL, -- sent, delivered, opened, clicked, failed
  recipient VARCHAR(255) NOT NULL, -- email, phone, user_id
  subject VARCHAR(200),
  content TEXT,
  template_id UUID REFERENCES notification_templates_pet(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES marketing_campaigns_pet(id) ON DELETE SET NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  metadata JSONB
);

-- =============================================
-- ÍNDICES PARA TABELAS DE COMUNICAÇÃO
-- =============================================

-- Índices para chat_messages_pet
CREATE INDEX IF NOT EXISTS idx_chat_messages_pet_room ON chat_messages_pet(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_pet_sender ON chat_messages_pet(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_pet_created_at ON chat_messages_pet(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_pet_read ON chat_messages_pet(is_read);

-- Índices para chat_rooms_pet
CREATE INDEX IF NOT EXISTS idx_chat_rooms_pet_type ON chat_rooms_pet(room_type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_pet_active ON chat_rooms_pet(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_pet_last_message ON chat_rooms_pet(last_message_at);

-- Índices para chat_room_participants_pet
CREATE INDEX IF NOT EXISTS idx_chat_room_participants_pet_room ON chat_room_participants_pet(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_participants_pet_user ON chat_room_participants_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_participants_pet_role ON chat_room_participants_pet(role);

-- Índices para notification_templates_pet
CREATE INDEX IF NOT EXISTS idx_notification_templates_pet_type ON notification_templates_pet(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_pet_active ON notification_templates_pet(is_active);

-- Índices para marketing_campaigns_pet
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_pet_status ON marketing_campaigns_pet(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_pet_type ON marketing_campaigns_pet(type);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_pet_scheduled ON marketing_campaigns_pet(scheduled_at);

-- Índices para campaign_recipients_pet
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_pet_campaign ON campaign_recipients_pet(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_pet_user ON campaign_recipients_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_pet_status ON campaign_recipients_pet(status);

-- Índices para feedback_pet
CREATE INDEX IF NOT EXISTS idx_feedback_pet_user ON feedback_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_pet_type ON feedback_pet(type);
CREATE INDEX IF NOT EXISTS idx_feedback_pet_status ON feedback_pet(status);
CREATE INDEX IF NOT EXISTS idx_feedback_pet_priority ON feedback_pet(priority);

-- Índices para faq_pet
CREATE INDEX IF NOT EXISTS idx_faq_pet_category ON faq_pet(category);
CREATE INDEX IF NOT EXISTS idx_faq_pet_active ON faq_pet(is_active);
CREATE INDEX IF NOT EXISTS idx_faq_pet_sort_order ON faq_pet(sort_order);

-- Índices para help_articles_pet
CREATE INDEX IF NOT EXISTS idx_help_articles_pet_slug ON help_articles_pet(slug);
CREATE INDEX IF NOT EXISTS idx_help_articles_pet_published ON help_articles_pet(is_published);
CREATE INDEX IF NOT EXISTS idx_help_articles_pet_category ON help_articles_pet(category);

-- Índices para communication_settings_pet
CREATE INDEX IF NOT EXISTS idx_communication_settings_pet_user ON communication_settings_pet(user_id);

-- Índices para communication_logs_pet
CREATE INDEX IF NOT EXISTS idx_communication_logs_pet_user ON communication_logs_pet(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_pet_type ON communication_logs_pet(type);
CREATE INDEX IF NOT EXISTS idx_communication_logs_pet_status ON communication_logs_pet(status);
CREATE INDEX IF NOT EXISTS idx_communication_logs_pet_created_at ON communication_logs_pet(created_at);

-- =============================================
-- TRIGGERS PARA TABELAS DE COMUNICAÇÃO
-- =============================================

-- Trigger para chat_messages_pet
CREATE OR REPLACE FUNCTION update_chat_messages_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_messages_pet_updated_at
  BEFORE UPDATE ON chat_messages_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_messages_pet_updated_at();

-- Trigger para chat_rooms_pet
CREATE OR REPLACE FUNCTION update_chat_rooms_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_rooms_pet_updated_at
  BEFORE UPDATE ON chat_rooms_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_rooms_pet_updated_at();

-- Trigger para notification_templates_pet
CREATE OR REPLACE FUNCTION update_notification_templates_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_templates_pet_updated_at
  BEFORE UPDATE ON notification_templates_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_templates_pet_updated_at();

-- Trigger para marketing_campaigns_pet
CREATE OR REPLACE FUNCTION update_marketing_campaigns_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_marketing_campaigns_pet_updated_at
  BEFORE UPDATE ON marketing_campaigns_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_campaigns_pet_updated_at();

-- Trigger para feedback_pet
CREATE OR REPLACE FUNCTION update_feedback_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feedback_pet_updated_at
  BEFORE UPDATE ON feedback_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_pet_updated_at();

-- Trigger para faq_pet
CREATE OR REPLACE FUNCTION update_faq_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_faq_pet_updated_at
  BEFORE UPDATE ON faq_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_faq_pet_updated_at();

-- Trigger para help_articles_pet
CREATE OR REPLACE FUNCTION update_help_articles_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_help_articles_pet_updated_at
  BEFORE UPDATE ON help_articles_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_help_articles_pet_updated_at();

-- Trigger para communication_settings_pet
CREATE OR REPLACE FUNCTION update_communication_settings_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_communication_settings_pet_updated_at
  BEFORE UPDATE ON communication_settings_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_communication_settings_pet_updated_at();

-- =============================================
-- RLS POLICIES PARA TABELAS DE COMUNICAÇÃO
-- =============================================

-- RLS para chat_messages_pet
ALTER TABLE chat_messages_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their rooms" ON chat_messages_pet
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_room_participants_pet 
      WHERE chat_room_participants_pet.room_id = chat_messages_pet.chat_room_id 
      AND chat_room_participants_pet.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their rooms" ON chat_messages_pet
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_room_participants_pet 
      WHERE chat_room_participants_pet.room_id = chat_messages_pet.chat_room_id 
      AND chat_room_participants_pet.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" ON chat_messages_pet
  FOR UPDATE USING (auth.uid() = sender_id);

-- RLS para chat_rooms_pet
ALTER TABLE chat_rooms_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rooms they participate in" ON chat_rooms_pet
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_room_participants_pet 
      WHERE chat_room_participants_pet.room_id = chat_rooms_pet.id 
      AND chat_room_participants_pet.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rooms" ON chat_rooms_pet
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- RLS para chat_room_participants_pet
ALTER TABLE chat_room_participants_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants in their rooms" ON chat_room_participants_pet
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_room_participants_pet p2
      WHERE p2.room_id = chat_room_participants_pet.room_id 
      AND p2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms" ON chat_room_participants_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS para notification_templates_pet
ALTER TABLE notification_templates_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active templates" ON notification_templates_pet
  FOR SELECT USING (is_active = true);

-- RLS para marketing_campaigns_pet
ALTER TABLE marketing_campaigns_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view campaigns" ON marketing_campaigns_pet
  FOR SELECT USING (true);

-- RLS para campaign_recipients_pet
ALTER TABLE campaign_recipients_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their campaign recipients" ON campaign_recipients_pet
  FOR SELECT USING (auth.uid() = user_id);

-- RLS para feedback_pet
ALTER TABLE feedback_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their feedback" ON feedback_pet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert feedback" ON feedback_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their feedback" ON feedback_pet
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS para faq_pet
ALTER TABLE faq_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active FAQ" ON faq_pet
  FOR SELECT USING (is_active = true);

-- RLS para help_articles_pet
ALTER TABLE help_articles_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view published articles" ON help_articles_pet
  FOR SELECT USING (is_published = true);

-- RLS para communication_settings_pet
ALTER TABLE communication_settings_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their communication settings" ON communication_settings_pet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their communication settings" ON communication_settings_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their communication settings" ON communication_settings_pet
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS para communication_logs_pet
ALTER TABLE communication_logs_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their communication logs" ON communication_logs_pet
  FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- DADOS INICIAIS PARA TABELAS DE COMUNICAÇÃO
-- =============================================

-- Inserir templates de notificação
INSERT INTO notification_templates_pet (name, type, subject, content, variables) VALUES
('Bem-vindo', 'email', 'Bem-vindo ao PetShop Romeo & Julieta!', 'Olá {{user_name}}, bem-vindo ao nosso pet shop! Estamos felizes em ter você conosco.', '["user_name", "user_email"]'),
('Lembrete de Agendamento', 'email', 'Lembrete: Seu agendamento está chegando', 'Olá {{user_name}}, seu agendamento para {{pet_name}} está marcado para {{appointment_date}} às {{appointment_time}}.', '["user_name", "pet_name", "appointment_date", "appointment_time"]'),
('Confirmação de Pedido', 'email', 'Pedido confirmado - {{order_number}}', 'Seu pedido {{order_number}} foi confirmado e está sendo processado. Total: R$ {{total_amount}}', '["order_number", "total_amount"]'),
('Notificação Push', 'push', 'Nova notificação', '{{message}}', '["message"]');

-- Inserir FAQ inicial
INSERT INTO faq_pet (question, answer, category, tags, sort_order) VALUES
('Como agendar um serviço?', 'Você pode agendar um serviço através do nosso app ou site. Acesse a seção "Agendamentos" e escolha o serviço desejado.', 'Agendamentos', '["agendamento", "serviços"]', 1),
('Quais formas de pagamento vocês aceitam?', 'Aceitamos cartão de crédito, débito, PIX e boleto bancário.', 'Pagamentos', '["pagamento", "cartão", "pix"]', 2),
('Posso cancelar um agendamento?', 'Sim, você pode cancelar até 24 horas antes do agendamento sem custos.', 'Agendamentos', '["cancelamento", "agendamento"]', 3),
('Como funciona o frete grátis?', 'O frete grátis é válido para pedidos acima de R$ 100 ou para assinantes Premium.', 'Entregas', '["frete", "entrega"]', 4),
('Vocês atendem fins de semana?', 'Sim, atendemos de segunda a sábado das 8h às 18h.', 'Horários', '["horário", "atendimento"]', 5);

-- Inserir artigos de ajuda
INSERT INTO help_articles_pet (title, slug, content, excerpt, category, tags, is_published, author_id) VALUES
('Como cuidar do seu pet em casa', 'como-cuidar-pet-casa', 'Guia completo para cuidar do seu pet em casa...', 'Dicas essenciais para o bem-estar do seu pet', 'Cuidados', '["cuidados", "pet", "casa"]', true, (SELECT id FROM profiles_pet LIMIT 1)),
('Primeiros socorros para pets', 'primeiros-socorros-pets', 'Saiba como agir em situações de emergência...', 'Guia de primeiros socorros para emergências', 'Saúde', '["primeiros-socorros", "emergência", "saúde"]', true, (SELECT id FROM profiles_pet LIMIT 1));

-- Inserir configurações padrão de comunicação
INSERT INTO communication_settings_pet (user_id, email_enabled, sms_enabled, push_enabled, whatsapp_enabled, marketing_emails, appointment_reminders, order_updates, system_notifications)
SELECT id, true, false, true, false, true, true, true, true
FROM profiles_pet;

-- =============================================
-- TABELAS ADMINISTRATIVAS
-- =============================================

-- Tabela de administradores
CREATE TABLE admin_users_pet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'admin', -- admin, super_admin, manager
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de administração
CREATE TABLE admin_logs_pet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users_pet(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL, -- user, pet, appointment, product, order
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações do sistema
CREATE TABLE system_settings_pet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relatórios
CREATE TABLE admin_reports_pet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL, -- revenue, users, appointments, products, orders
  parameters JSONB DEFAULT '{}',
  data JSONB DEFAULT '{}',
  generated_by UUID REFERENCES admin_users_pet(id) ON DELETE SET NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de notificações administrativas
CREATE TABLE admin_notifications_pet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- info, warning, error, success
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  is_read BOOLEAN DEFAULT false,
  admin_id UUID REFERENCES admin_users_pet(id) ON DELETE CASCADE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de tickets de suporte
CREATE TABLE support_tickets_pet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  category VARCHAR(50) NOT NULL, -- technical, billing, general, complaint
  assigned_to UUID REFERENCES admin_users_pet(id) ON DELETE SET NULL,
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de mensagens dos tickets
CREATE TABLE support_messages_pet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets_pet(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles_pet(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL, -- user, admin
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA TABELAS ADMINISTRATIVAS
-- =============================================

-- Índices para admin_users_pet
CREATE INDEX idx_admin_users_user_id ON admin_users_pet(user_id);
CREATE INDEX idx_admin_users_role ON admin_users_pet(role);
CREATE INDEX idx_admin_users_active ON admin_users_pet(is_active);

-- Índices para admin_logs_pet
CREATE INDEX idx_admin_logs_admin_id ON admin_logs_pet(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs_pet(action);
CREATE INDEX idx_admin_logs_resource ON admin_logs_pet(resource_type, resource_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs_pet(created_at);

-- Índices para system_settings_pet
CREATE INDEX idx_system_settings_key ON system_settings_pet(key);
CREATE INDEX idx_system_settings_category ON system_settings_pet(category);
CREATE INDEX idx_system_settings_public ON system_settings_pet(is_public);

-- Índices para admin_reports_pet
CREATE INDEX idx_admin_reports_type ON admin_reports_pet(type);
CREATE INDEX idx_admin_reports_generated_by ON admin_reports_pet(generated_by);
CREATE INDEX idx_admin_reports_generated_at ON admin_reports_pet(generated_at);

-- Índices para admin_notifications_pet
CREATE INDEX idx_admin_notifications_admin_id ON admin_notifications_pet(admin_id);
CREATE INDEX idx_admin_notifications_type ON admin_notifications_pet(type);
CREATE INDEX idx_admin_notifications_priority ON admin_notifications_pet(priority);
CREATE INDEX idx_admin_notifications_read ON admin_notifications_pet(is_read);
CREATE INDEX idx_admin_notifications_created_at ON admin_notifications_pet(created_at);

-- Índices para support_tickets_pet
CREATE INDEX idx_support_tickets_user_id ON support_tickets_pet(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets_pet(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets_pet(priority);
CREATE INDEX idx_support_tickets_category ON support_tickets_pet(category);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets_pet(assigned_to);
CREATE INDEX idx_support_tickets_created_at ON support_tickets_pet(created_at);

-- Índices para support_messages_pet
CREATE INDEX idx_support_messages_ticket_id ON support_messages_pet(ticket_id);
CREATE INDEX idx_support_messages_sender ON support_messages_pet(sender_id, sender_type);
CREATE INDEX idx_support_messages_created_at ON support_messages_pet(created_at);

-- =============================================
-- TRIGGERS PARA TABELAS ADMINISTRATIVAS
-- =============================================

-- Trigger para updated_at em admin_users_pet
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admin_users_updated_at
  BEFORE UPDATE ON admin_users_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- Trigger para updated_at em system_settings_pet
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_system_settings_updated_at
  BEFORE UPDATE ON system_settings_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();

-- Trigger para updated_at em support_tickets_pet
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets_pet
  FOR EACH ROW
  EXECUTE FUNCTION update_support_tickets_updated_at();

-- =============================================
-- RLS PARA TABELAS ADMINISTRATIVAS
-- =============================================

-- RLS para admin_users_pet
ALTER TABLE admin_users_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view admin users" ON admin_users_pet
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users_pet au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

CREATE POLICY "Only super admins can manage admin users" ON admin_users_pet
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users_pet au 
      WHERE au.user_id = auth.uid() 
      AND au.role = 'super_admin'
      AND au.is_active = true
    )
  );

-- RLS para admin_logs_pet
ALTER TABLE admin_logs_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view admin logs" ON admin_logs_pet
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users_pet au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

-- RLS para system_settings_pet
ALTER TABLE system_settings_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public settings are viewable by all" ON system_settings_pet
  FOR SELECT USING (is_public = true);

CREATE POLICY "Only admins can view all settings" ON system_settings_pet
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users_pet au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

CREATE POLICY "Only admins can manage settings" ON system_settings_pet
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users_pet au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

-- RLS para admin_reports_pet
ALTER TABLE admin_reports_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view reports" ON admin_reports_pet
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users_pet au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

-- RLS para admin_notifications_pet
ALTER TABLE admin_notifications_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their notifications" ON admin_notifications_pet
  FOR SELECT USING (
    admin_id IN (
      SELECT id FROM admin_users_pet 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- RLS para support_tickets_pet
ALTER TABLE support_tickets_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tickets" ON support_tickets_pet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets" ON support_tickets_pet
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users_pet au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

CREATE POLICY "Users can create tickets" ON support_tickets_pet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update tickets" ON support_tickets_pet
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users_pet au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

-- RLS para support_messages_pet
ALTER TABLE support_messages_pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their tickets" ON support_messages_pet
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM support_tickets_pet 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all messages" ON support_messages_pet
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users_pet au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

CREATE POLICY "Users can create messages in their tickets" ON support_messages_pet
  FOR INSERT WITH CHECK (
    ticket_id IN (
      SELECT id FROM support_tickets_pet 
      WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- DADOS INICIAIS PARA TABELAS ADMINISTRATIVAS
-- =============================================

-- Inserir configurações padrão do sistema
INSERT INTO system_settings_pet (key, value, description, category, is_public) VALUES
('app_name', '"PetShop Romeo & Julieta"', 'Nome da aplicação', 'general', true),
('app_version', '"1.0.0"', 'Versão da aplicação', 'general', true),
('maintenance_mode', 'false', 'Modo de manutenção', 'system', false),
('max_file_size', '10485760', 'Tamanho máximo de arquivo em bytes (10MB)', 'system', false),
('allowed_file_types', '["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"]', 'Tipos de arquivo permitidos', 'system', false),
('email_from', '"noreply@petshop.com"', 'Email de origem', 'email', false),
('smtp_host', '""', 'Host SMTP', 'email', false),
('smtp_port', '587', 'Porta SMTP', 'email', false),
('smtp_user', '""', 'Usuário SMTP', 'email', false),
('smtp_password', '""', 'Senha SMTP', 'email', false),
('default_currency', '"BRL"', 'Moeda padrão', 'payment', true),
('tax_rate', '0.1', 'Taxa de imposto (10%)', 'payment', false),
('free_shipping_threshold', '100', 'Valor mínimo para frete grátis', 'shipping', true),
('appointment_advance_days', '30', 'Dias de antecedência para agendamento', 'appointments', true),
('appointment_cancel_hours', '24', 'Horas para cancelamento sem custo', 'appointments', true),
('notification_email', '"admin@petshop.com"', 'Email para notificações administrativas', 'notifications', false),
('backup_frequency', '"daily"', 'Frequência de backup', 'system', false),
('session_timeout', '3600', 'Timeout de sessão em segundos', 'security', false),
('max_login_attempts', '5', 'Máximo de tentativas de login', 'security', false),
('password_min_length', '8', 'Comprimento mínimo da senha', 'security', false);

-- Inserir usuário administrador padrão (será criado quando o primeiro admin for adicionado)
-- Este será feito através da interface administrativa
