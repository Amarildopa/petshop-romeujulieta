-- Script de migração para adicionar colunas faltantes na tabela products_pet
-- Execute este script no Supabase SQL Editor para corrigir a estrutura da tabela

-- Adicionar coluna original_price (preço original para cálculo de desconto)
ALTER TABLE products_pet 
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2);

-- Adicionar coluna in_stock (controle de estoque booleano)
ALTER TABLE products_pet 
ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;

-- Adicionar coluna rating (avaliação do produto)
ALTER TABLE products_pet 
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0;

-- Adicionar coluna reviews_count (número de avaliações)
ALTER TABLE products_pet 
ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;

-- Adicionar coluna badge (selo/badge do produto)
ALTER TABLE products_pet 
ADD COLUMN IF NOT EXISTS badge VARCHAR(50);

-- Comentários sobre as colunas adicionadas:
-- original_price: Usado para mostrar preço original e calcular desconto
-- in_stock: Controle booleano de disponibilidade em estoque
-- rating: Avaliação média do produto (0.0 a 5.0)
-- reviews_count: Contador de número de avaliações recebidas
-- badge: Texto para badges como 'Mais Vendido', 'Premium', 'Veterinário', etc.

-- Após executar este script, você poderá executar o script insert_products_data.sql sem erros