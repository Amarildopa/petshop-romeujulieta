-- Adicionar coluna price_at_time à tabela cart_items_pet
-- Esta coluna armazena o preço do produto no momento da adição ao carrinho

ALTER TABLE cart_items_pet 
ADD COLUMN price_at_time DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Comentário da coluna
COMMENT ON COLUMN cart_items_pet.price_at_time IS 'Preço do produto no momento da adição ao carrinho';

-- Atualizar registros existentes com o preço atual do produto (se houver)
UPDATE cart_items_pet 
SET price_at_time = (
    SELECT COALESCE(price, 0.00) 
    FROM products_pet 
    WHERE products_pet.id = cart_items_pet.product_id
)
WHERE price_at_time = 0.00 AND product_id IS NOT NULL;