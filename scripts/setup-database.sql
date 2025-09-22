-- =============================================
-- SCRIPT DE CONFIGURAÇÃO INICIAL DO BANCO
-- PetShop Romeo & Julieta
-- =============================================

-- Este script configura o banco de dados com dados iniciais
-- Execute após criar todas as tabelas

-- =============================================
-- 1. CONFIGURAÇÕES DO SISTEMA
-- =============================================

INSERT INTO system_settings_pet (key, value, description, category, is_public) VALUES
-- Configurações gerais
('app_name', 'Romeu e Julieta Pet&Spa', 'Nome da aplicação', 'general', true),
('app_version', '1.0.0', 'Versão da aplicação', 'general', true),
('app_description', 'Sistema completo de gestão para pet shops', 'Descrição da aplicação', 'general', true),
('app_logo', '/logo.png', 'URL do logo da aplicação', 'general', true),
('app_favicon', '/favicon.ico', 'URL do favicon', 'general', true),

-- Configurações de contato
('contact_email', 'contato@petshop.com', 'Email de contato', 'contact', true),
('contact_phone', '(11) 99380-5117', 'Telefone de contato', 'contact', true),
('contact_address', 'Rua das Flores, 123 - São Paulo/SP', 'Endereço da empresa', 'contact', true),
('contact_cep', '01234-567', 'CEP da empresa', 'contact', true),

-- Configurações de negócio
('business_hours', '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "17:00"}, "sunday": {"open": "09:00", "close": "15:00"}}', 'Horários de funcionamento', 'business', true),
('timezone', 'America/Sao_Paulo', 'Fuso horário da empresa', 'business', true),
('currency', 'BRL', 'Moeda padrão', 'business', true),
('currency_symbol', 'R$', 'Símbolo da moeda', 'business', true),

-- Configurações de segurança
('session_timeout', '3600', 'Timeout da sessão em segundos', 'security', false),
('max_login_attempts', '5', 'Máximo de tentativas de login', 'security', false),
('password_min_length', '8', 'Comprimento mínimo da senha', 'security', false),
('require_email_verification', 'true', 'Exigir verificação de email', 'security', false),

-- Configurações de notificação
('email_notifications_enabled', 'true', 'Notificações por email habilitadas', 'notifications', false),
('sms_notifications_enabled', 'false', 'Notificações por SMS habilitadas', 'notifications', false),
('push_notifications_enabled', 'true', 'Notificações push habilitadas', 'notifications', false),
('notification_sound', 'true', 'Som das notificações', 'notifications', false),

-- Configurações de pagamento
('payment_methods', '["credit_card", "pix", "boleto"]', 'Métodos de pagamento aceitos', 'payment', true),
('pix_enabled', 'true', 'PIX habilitado', 'payment', true),
('credit_card_enabled', 'true', 'Cartão de crédito habilitado', 'payment', true),
('boleto_enabled', 'true', 'Boleto habilitado', 'payment', true),

-- Configurações de agendamento
('appointment_duration_default', '60', 'Duração padrão dos agendamentos em minutos', 'appointments', false),
('appointment_advance_days', '30', 'Dias de antecedência para agendamento', 'appointments', false),
('appointment_cancel_hours', '24', 'Horas mínimas para cancelamento', 'appointments', false),
('appointment_reminder_hours', '24', 'Horas de antecedência para lembrete', 'appointments', false),

-- Configurações de estoque
('low_stock_threshold', '10', 'Limite de estoque baixo', 'inventory', false),
('auto_reorder_enabled', 'false', 'Reordenação automática habilitada', 'inventory', false),
('inventory_tracking_enabled', 'true', 'Controle de estoque habilitado', 'inventory', false),

-- Configurações de relatórios
('reports_retention_days', '365', 'Dias de retenção dos relatórios', 'reports', false),
('reports_auto_generate', 'false', 'Geração automática de relatórios', 'reports', false),
('reports_email_delivery', 'false', 'Entrega de relatórios por email', 'reports', false),

-- Configurações de backup
('backup_enabled', 'true', 'Backup automático habilitado', 'backup', false),
('backup_frequency', 'daily', 'Frequência do backup', 'backup', false),
('backup_retention_days', '30', 'Dias de retenção do backup', 'backup', false),

-- Configurações de integração
('api_rate_limit', '1000', 'Limite de requisições por hora', 'api', false),
('api_timeout', '30', 'Timeout da API em segundos', 'api', false),
('webhook_enabled', 'false', 'Webhooks habilitados', 'api', false),

-- Configurações de marketing
('marketing_emails_enabled', 'true', 'Emails de marketing habilitados', 'marketing', false),
('marketing_sms_enabled', 'false', 'SMS de marketing habilitados', 'marketing', false),
('marketing_push_enabled', 'true', 'Push de marketing habilitados', 'marketing', false),
('marketing_analytics_enabled', 'true', 'Analytics de marketing habilitados', 'marketing', false);

-- =============================================
-- 2. CATEGORIAS DE PRODUTOS
-- =============================================

INSERT INTO product_categories_pet (name, slug, description, is_active, sort_order) VALUES
('Ração', 'racao', 'Alimentos para pets', true, 1),
('Brinquedos', 'brinquedos', 'Brinquedos e entretenimento', true, 2),
('Higiene', 'higiene', 'Produtos de higiene e limpeza', true, 3),
('Acessórios', 'acessorios', 'Coleiras, guias e acessórios', true, 4),
('Medicamentos', 'medicamentos', 'Medicamentos e suplementos', true, 5),
('Camas e Casinhas', 'camas-casinhas', 'Camas, casinhas e conforto', true, 6),
('Transporte', 'transporte', 'Caixas de transporte e carrinhos', true, 7),
('Bebedouros e Comedouros', 'bebedouros-comedouros', 'Acessórios para alimentação', true, 8);

-- =============================================
-- 3. SERVIÇOS PADRÃO
-- =============================================

INSERT INTO services_pet (name, description, price, duration, category, is_active, sort_order) VALUES
('Banho e Tosa', 'Banho completo com tosa higiênica', 80.00, 120, 'grooming', true, 1),
('Banho Simples', 'Banho com secagem e escovação', 50.00, 60, 'grooming', true, 2),
('Tosa Completa', 'Tosa completa com banho', 100.00, 150, 'grooming', true, 3),
('Tosa Higiênica', 'Tosa higiênica com banho', 60.00, 90, 'grooming', true, 4),
('Consulta Veterinária', 'Consulta com veterinário especializado', 120.00, 60, 'veterinary', true, 5),
('Vacinação', 'Aplicação de vacinas', 80.00, 30, 'veterinary', true, 6),
('Exames Laboratoriais', 'Coleta e análise de exames', 150.00, 45, 'veterinary', true, 7),
('Cirurgia', 'Procedimentos cirúrgicos', 500.00, 180, 'veterinary', true, 8),
('Hospedagem', 'Hospedagem com cuidados especiais', 80.00, 1440, 'boarding', true, 9),
('Day Care', 'Cuidados durante o dia', 40.00, 480, 'boarding', true, 10),
('Adestramento', 'Sessões de adestramento', 100.00, 60, 'training', true, 11),
('Fisioterapia', 'Sessões de fisioterapia', 120.00, 60, 'therapy', true, 12);

-- =============================================
-- 4. PLANOS DE ASSINATURA
-- =============================================

INSERT INTO subscription_plans_pet (name, description, price, billing_cycle, features, is_active, sort_order) VALUES
('Básico', 'Plano básico com benefícios essenciais', 29.90, 'monthly', '{"discounts": 5, "free_delivery": false, "priority_support": false, "exclusive_products": false}', true, 1),
('Premium', 'Plano premium com benefícios exclusivos', 59.90, 'monthly', '{"discounts": 15, "free_delivery": true, "priority_support": true, "exclusive_products": true}', true, 2),
('VIP', 'Plano VIP com todos os benefícios', 99.90, 'monthly', '{"discounts": 25, "free_delivery": true, "priority_support": true, "exclusive_products": true, "personal_vet": true}', true, 3),
('Anual Básico', 'Plano básico com desconto anual', 299.90, 'yearly', '{"discounts": 5, "free_delivery": false, "priority_support": false, "exclusive_products": false}', true, 4),
('Anual Premium', 'Plano premium com desconto anual', 599.90, 'yearly', '{"discounts": 15, "free_delivery": true, "priority_support": true, "exclusive_products": true}', true, 5);

-- =============================================
-- 5. TEMPLATES DE NOTIFICAÇÃO
-- =============================================

INSERT INTO notification_templates_pet (name, type, subject, content, is_active) VALUES
('Bem-vindo', 'welcome', 'Bem-vindo ao PetShop Romeo & Julieta!', 'Olá {{user_name}}! Seja bem-vindo ao PetShop Romeo & Julieta. Estamos felizes em tê-lo conosco!', true),
('Agendamento Confirmado', 'appointment_confirmed', 'Agendamento Confirmado', 'Olá {{user_name}}! Seu agendamento para {{pet_name}} foi confirmado para {{appointment_date}} às {{appointment_time}}.', true),
('Lembrete de Agendamento', 'appointment_reminder', 'Lembrete: Seu agendamento é amanhã', 'Olá {{user_name}}! Lembramos que você tem um agendamento para {{pet_name}} amanhã às {{appointment_time}}.', true),
('Agendamento Cancelado', 'appointment_cancelled', 'Agendamento Cancelado', 'Olá {{user_name}}! Seu agendamento para {{pet_name}} foi cancelado. Entre em contato conosco para reagendar.', true),
('Pedido Confirmado', 'order_confirmed', 'Pedido Confirmado', 'Olá {{user_name}}! Seu pedido #{{order_number}} foi confirmado e está sendo processado.', true),
('Pedido Enviado', 'order_shipped', 'Pedido Enviado', 'Olá {{user_name}}! Seu pedido #{{order_number}} foi enviado. Código de rastreamento: {{tracking_code}}', true),
('Pagamento Aprovado', 'payment_approved', 'Pagamento Aprovado', 'Olá {{user_name}}! Seu pagamento foi aprovado com sucesso.', true),
('Pagamento Recusado', 'payment_declined', 'Pagamento Recusado', 'Olá {{user_name}}! Seu pagamento foi recusado. Verifique os dados e tente novamente.', true),
('Assinatura Ativada', 'subscription_activated', 'Assinatura Ativada', 'Olá {{user_name}}! Sua assinatura {{plan_name}} foi ativada com sucesso!', true),
('Assinatura Renovada', 'subscription_renewed', 'Assinatura Renovada', 'Olá {{user_name}}! Sua assinatura {{plan_name}} foi renovada automaticamente.', true);

-- =============================================
-- 6. FAQ INICIAL
-- =============================================

INSERT INTO faq_pet (question, answer, category, is_active, sort_order) VALUES
('Como faço para agendar um serviço?', 'Para agendar um serviço, acesse a seção "Agendamentos" no menu principal, selecione o serviço desejado, escolha a data e horário disponível, e confirme o agendamento.', 'agendamentos', true, 1),
('Quais são os métodos de pagamento aceitos?', 'Aceitamos cartão de crédito, PIX, boleto bancário e dinheiro. Para compras online, aceitamos cartão de crédito e PIX.', 'pagamentos', true, 2),
('Posso cancelar um agendamento?', 'Sim, você pode cancelar um agendamento até 24 horas antes do horário marcado. Acesse "Meus Agendamentos" para cancelar.', 'agendamentos', true, 3),
('Como funciona a entrega dos produtos?', 'Oferecemos entrega para toda a região metropolitana. O prazo de entrega é de 1 a 3 dias úteis. Frete grátis para compras acima de R$ 100.', 'entrega', true, 4),
('Posso trocar ou devolver um produto?', 'Sim, você tem 7 dias para trocar ou devolver produtos não utilizados. Acesse "Meus Pedidos" para solicitar a troca.', 'devolucoes', true, 5),
('Como funciona a assinatura?', 'Nossas assinaturas oferecem descontos exclusivos, frete grátis e produtos exclusivos. Você pode cancelar a qualquer momento.', 'assinaturas', true, 6),
('Preciso de cadastro para comprar?', 'Sim, é necessário criar uma conta para fazer compras e agendamentos. O cadastro é gratuito e rápido.', 'cadastro', true, 7),
('Como entro em contato com o suporte?', 'Você pode entrar em contato através do chat online, email contato@petshop.com ou telefone (11) 99999-9999.', 'suporte', true, 8),
('Oferecem serviços de emergência?', 'Sim, oferecemos serviços de emergência 24h para casos urgentes. Entre em contato pelo telefone de emergência.', 'emergencia', true, 9),
('Posso agendar para o mesmo dia?', 'Dependendo da disponibilidade, é possível agendar para o mesmo dia. Recomendamos agendar com antecedência.', 'agendamentos', true, 10);

-- =============================================
-- 7. ARTIGOS DE AJUDA
-- =============================================

INSERT INTO help_articles_pet (title, content, category, tags, is_published, view_count) VALUES
('Como cuidar do seu pet no verão', 'O verão pode ser um período desafiador para nossos pets. Aqui estão algumas dicas importantes para manter seu animal de estimação saudável e confortável durante os dias mais quentes...', 'cuidados', '["verao", "cuidados", "saude"]', true, 0),
('Alimentação adequada para cães', 'A alimentação é fundamental para a saúde do seu cão. Saiba como escolher a ração ideal, quantas vezes por dia alimentar e quais alimentos evitar...', 'alimentacao', '["alimentacao", "caes", "racao"]', true, 0),
('Primeiros socorros para pets', 'Saber como agir em situações de emergência pode salvar a vida do seu pet. Aprenda as técnicas básicas de primeiros socorros...', 'emergencia', '["primeiros-socorros", "emergencia", "saude"]', true, 0),
('Como escolher brinquedos seguros', 'Brinquedos são essenciais para o bem-estar do seu pet, mas é importante escolher opções seguras. Confira nossas dicas...', 'brinquedos', '["brinquedos", "seguranca", "bem-estar"]', true, 0),
('Cuidados com filhotes', 'Filhotes requerem cuidados especiais. Saiba como cuidar adequadamente do seu novo amigo...', 'filhotes', '["filhotes", "cuidados", "desenvolvimento"]', true, 0);

-- =============================================
-- 8. CONFIGURAÇÕES DE COMUNICAÇÃO
-- =============================================

INSERT INTO communication_settings_pet (channel, is_enabled, config, description) VALUES
('email', true, '{"smtp_host": "smtp.gmail.com", "smtp_port": 587, "from_email": "noreply@petshop.com"}', 'Configurações de email'),
('sms', false, '{"provider": "twilio", "from_number": "+5511999999999"}', 'Configurações de SMS'),
('push', true, '{"vapid_public_key": "your-vapid-public-key", "vapid_private_key": "your-vapid-private-key"}', 'Configurações de notificação push'),
('whatsapp', false, '{"api_url": "https://api.whatsapp.com", "token": "your-whatsapp-token"}', 'Configurações do WhatsApp');

-- =============================================
-- 9. CONFIGURAÇÕES DE PAGAMENTO
-- =============================================

INSERT INTO payment_settings_pet (provider, is_enabled, config, description) VALUES
('stripe', false, '{"publishable_key": "pk_test_...", "secret_key": "sk_test_...", "webhook_secret": "whsec_..."}', 'Configurações do Stripe'),
('pagseguro', false, '{"email": "seu-email@pagseguro.com", "token": "seu-token", "sandbox": true}', 'Configurações do PagSeguro'),
('pix', true, '{"key": "sua-chave-pix", "bank": "001", "account": "12345-6"}', 'Configurações do PIX'),
('boleto', true, '{"bank": "001", "agency": "1234", "account": "12345-6", "wallet": "17"}', 'Configurações do Boleto');

-- =============================================
-- 10. RELATÓRIO FINAL
-- =============================================

DO $$
DECLARE
    settings_count INTEGER;
    categories_count INTEGER;
    services_count INTEGER;
    plans_count INTEGER;
    templates_count INTEGER;
    faq_count INTEGER;
    articles_count INTEGER;
BEGIN
    -- Contar registros inseridos
    SELECT COUNT(*) INTO settings_count FROM system_settings_pet;
    SELECT COUNT(*) INTO categories_count FROM product_categories_pet;
    SELECT COUNT(*) INTO services_count FROM services_pet;
    SELECT COUNT(*) INTO plans_count FROM subscription_plans_pet;
    SELECT COUNT(*) INTO templates_count FROM notification_templates_pet;
    SELECT COUNT(*) INTO faq_count FROM faq_pet;
    SELECT COUNT(*) INTO articles_count FROM help_articles_pet;
    
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'CONFIGURAÇÃO INICIAL CONCLUÍDA!';
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'Configurações do sistema: %', settings_count;
    RAISE NOTICE 'Categorias de produtos: %', categories_count;
    RAISE NOTICE 'Serviços cadastrados: %', services_count;
    RAISE NOTICE 'Planos de assinatura: %', plans_count;
    RAISE NOTICE 'Templates de notificação: %', templates_count;
    RAISE NOTICE 'Perguntas frequentes: %', faq_count;
    RAISE NOTICE 'Artigos de ajuda: %', articles_count;
    RAISE NOTICE '=============================================';
    RAISE NOTICE '✅ BANCO DE DADOS CONFIGURADO COM SUCESSO!';
    RAISE NOTICE '✅ Sistema pronto para uso!';
    RAISE NOTICE '=============================================';
END $$;
