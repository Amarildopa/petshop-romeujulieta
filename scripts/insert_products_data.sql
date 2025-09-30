-- Script para inserir massa de dados de produtos na tabela products_pet
-- Execute este script manualmente no Supabase SQL Editor

INSERT INTO products_pet (name, description, price, original_price, category, images, in_stock, rating, reviews_count, badge, stock) VALUES

-- RAÇÕES
('Ração Premium Golden Adulto', 'Ração super premium para cães adultos de todas as raças. Rica em proteínas e vitaminas essenciais.', 89.90, 99.90, 'Ração', ARRAY['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400'], true, 4.8, 156, 'Mais Vendido', 85),
('Ração Royal Canin Filhote', 'Ração específica para filhotes até 12 meses. Fórmula balanceada para crescimento saudável.', 125.50, 139.90, 'Ração', ARRAY['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'], true, 4.9, 203, 'Premium', 65),
('Ração Whiskas Gatos Adultos', 'Ração completa para gatos adultos com sabor peixe. Rico em ômega 3 e 6.', 45.90, 52.90, 'Ração', ARRAY['https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400'], true, 4.5, 89, null, 95),
('Ração Hills Prescription Diet', 'Ração terapêutica para cães com problemas digestivos. Recomendação veterinária.', 189.90, 210.00, 'Ração', ARRAY['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'], true, 4.7, 67, 'Veterinário', 45),

-- BRINQUEDOS
('Bola de Tênis para Cães', 'Bola resistente de tênis, perfeita para brincadeiras e exercícios. Tamanho médio.', 15.90, 19.90, 'Brinquedos', ARRAY['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400'], true, 4.6, 124, null, 150),
('Arranhador Torre para Gatos', 'Torre arranhador com 3 andares, ideal para gatos brincarem e afiarem as unhas.', 159.90, 189.90, 'Brinquedos', ARRAY['https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400'], true, 4.8, 78, 'Mais Vendido', 25),
('Corda Dental para Cães', 'Brinquedo de corda que ajuda na limpeza dos dentes. Material natural e seguro.', 22.90, 27.90, 'Brinquedos', ARRAY['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400'], true, 4.4, 95, null, 80),
('Ratinho de Pelúcia com Catnip', 'Brinquedo para gatos com catnip natural. Estimula o instinto de caça.', 12.90, 16.90, 'Brinquedos', ARRAY['https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400'], true, 4.7, 156, null, 120),

-- ACESSÓRIOS
('Coleira Ajustável Premium', 'Coleira de nylon resistente com fivela de segurança. Disponível em várias cores.', 35.90, 42.90, 'Acessórios', ARRAY['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400'], true, 4.5, 89, null, 75),
('Guia Retrátil 5 metros', 'Guia retrátil automática para cães até 25kg. Sistema de freio e trava.', 67.90, 79.90, 'Acessórios', ARRAY['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400'], true, 4.6, 134, null, 40),
('Bebedouro Automático', 'Bebedouro com sistema de filtragem e circulação de água. Capacidade 2L.', 89.90, 109.90, 'Acessórios', ARRAY['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400'], true, 4.8, 67, 'Inovação', 30),
('Comedouro Antivoracidade', 'Comedouro especial que reduz a velocidade de alimentação. Previne problemas digestivos.', 45.90, 55.90, 'Acessórios', ARRAY['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400'], true, 4.7, 98, null, 55),

-- HIGIENE
('Shampoo Neutro para Cães', 'Shampoo hipoalergênico para peles sensíveis. Fórmula suave e hidratante.', 28.90, 34.90, 'Higiene', ARRAY['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400'], true, 4.5, 112, null, 90),
('Escova Removedora de Pelos', 'Escova profissional para remoção de pelos mortos. Ideal para todas as raças.', 39.90, 49.90, 'Higiene', ARRAY['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400'], true, 4.8, 156, 'Mais Vendido', 65),
('Lenços Umedecidos Pet', 'Lenços hipoalergênicos para limpeza rápida. Pacote com 50 unidades.', 18.90, 22.90, 'Higiene', ARRAY['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400'], true, 4.3, 78, null, 200),
('Cortador de Unhas Profissional', 'Cortador de unhas ergonômico com trava de segurança. Para cães e gatos.', 32.90, 39.90, 'Higiene', ARRAY['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400'], true, 4.6, 89, null, 45),

-- CAMAS E CONFORTO
('Cama Ortopédica Grande', 'Cama ortopédica com espuma viscoelástica. Ideal para cães idosos ou com problemas articulares.', 189.90, 229.90, 'Camas', ARRAY['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'], true, 4.9, 45, 'Premium', 20),
('Almofada Térmica Autoaquecida', 'Almofada que mantém o calor corporal do pet. Ideal para filhotes e pets idosos.', 67.90, 79.90, 'Camas', ARRAY['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'], true, 4.7, 67, null, 35),
('Casinha de Madeira Média', 'Casinha resistente às intempéries. Madeira tratada e telhado impermeável.', 299.90, 349.90, 'Camas', ARRAY['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'], true, 4.8, 34, null, 15),

-- TRANSPORTE
('Caixa de Transporte Rígida', 'Caixa de transporte aprovada para viagens aéreas. Tamanho médio até 15kg.', 159.90, 189.90, 'Transporte', ARRAY['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400'], true, 4.6, 56, null, 25),
('Bolsa de Transporte Flexível', 'Bolsa confortável para transporte de pets pequenos. Material respirável.', 89.90, 109.90, 'Transporte', ARRAY['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400'], true, 4.5, 78, null, 40),
('Assento de Carro para Pets', 'Assento elevado para pets pequenos. Sistema de segurança com cinto.', 129.90, 149.90, 'Transporte', ARRAY['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400'], true, 4.7, 43, 'Segurança', 30),

-- MEDICAMENTOS E SUPLEMENTOS
('Vermífugo Amplo Espectro', 'Vermífugo para cães e gatos. Elimina vermes redondos e chatos. Comprimidos palatáveis.', 45.90, 52.90, 'Medicamentos', ARRAY['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400'], true, 4.8, 89, 'Veterinário', 60),
('Suplemento Articular', 'Suplemento com glucosamina e condroitina para saúde das articulações.', 78.90, 89.90, 'Medicamentos', ARRAY['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400'], true, 4.6, 67, null, 35),
('Antipulgas e Carrapatos', 'Coleira antipulgas com proteção de 8 meses. Resistente à água.', 89.90, 99.90, 'Medicamentos', ARRAY['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400'], true, 4.9, 134, 'Mais Vendido', 80),

-- PETISCOS E TREATS
('Petisco Natural de Frango', 'Petisco desidratado 100% natural. Sem conservantes artificiais. Pacote 200g.', 24.90, 29.90, 'Petiscos', ARRAY['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400'], true, 4.7, 156, null, 100),
('Osso Natural para Cães', 'Osso bovino natural defumado. Rico em cálcio e fósforo. Tamanho grande.', 18.90, 23.90, 'Petiscos', ARRAY['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400'], true, 4.5, 98, null, 75),
('Sachê Premium para Gatos', 'Sachê gourmet com salmão grelhado. Textura cremosa e sabor irresistível.', 8.90, 11.90, 'Petiscos', ARRAY['https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400'], true, 4.8, 234, 'Gourmet', 250),

-- AQUARISMO
('Aquário Completo 20L', 'Aquário com filtro, iluminação LED e termostato. Kit completo para iniciantes.', 189.90, 229.90, 'Aquarismo', ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400'], true, 4.6, 45, null, 12),
('Ração para Peixes Tropicais', 'Ração balanceada em flocos para peixes tropicais. Realça as cores naturais.', 15.90, 19.90, 'Aquarismo', ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400'], true, 4.4, 67, null, 180);

-- Comentário: Este script insere 30 produtos variados para teste da loja
-- Categorias incluídas: Ração, Brinquedos, Acessórios, Higiene, Camas, Transporte, Medicamentos, Petiscos, Aquarismo
-- Todos os produtos têm preços realistas, descrições detalhadas e imagens do Unsplash