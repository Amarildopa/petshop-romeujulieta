-- Script para adicionar campos faltantes na tabela profiles_pet
-- Este script adiciona os campos de endereço e informações pessoais que estão sendo usados no Profile.tsx
-- mas não existem na estrutura atual da tabela

-- Adicionar campo CPF
ALTER TABLE profiles_pet 
ADD COLUMN IF NOT EXISTS cpf VARCHAR;

-- Adicionar campo para rua/logradouro
ALTER TABLE profiles_pet 
ADD COLUMN IF NOT EXISTS street VARCHAR;

-- Adicionar campo para bairro
ALTER TABLE profiles_pet 
ADD COLUMN IF NOT EXISTS neighborhood VARCHAR;

-- Adicionar campo para cidade
ALTER TABLE profiles_pet 
ADD COLUMN IF NOT EXISTS city VARCHAR;

-- Adicionar campo para estado/UF
ALTER TABLE profiles_pet 
ADD COLUMN IF NOT EXISTS state VARCHAR;

-- Adicionar campo para complemento do endereço
ALTER TABLE profiles_pet 
ADD COLUMN IF NOT EXISTS complement VARCHAR;

-- Adicionar campo para número do endereço (novo campo solicitado)
ALTER TABLE profiles_pet 
ADD COLUMN IF NOT EXISTS number VARCHAR;

-- Comentários sobre os campos adicionados:
-- cpf: Documento de identificação do usuário
-- street: Nome da rua/avenida/logradouro
-- neighborhood: Bairro do endereço
-- city: Cidade do endereço
-- state: Estado/UF do endereço
-- complement: Complemento do endereço (apartamento, bloco, etc.)
-- number: Número do endereço (novo campo para completar o endereço)

-- Todos os campos são VARCHAR e permitem NULL para manter compatibilidade
-- com registros existentes na tabela