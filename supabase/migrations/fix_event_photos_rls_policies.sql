-- Verificar e criar políticas RLS para a tabela event_photos_pet

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can insert their own event photos" ON event_photos_pet;
DROP POLICY IF EXISTS "Users can view their own event photos" ON event_photos_pet;
DROP POLICY IF EXISTS "Users can update their own event photos" ON event_photos_pet;
DROP POLICY IF EXISTS "Users can delete their own event photos" ON event_photos_pet;

-- Política para INSERT - usuários autenticados podem inserir fotos de seus próprios eventos
CREATE POLICY "Users can insert their own event photos" ON event_photos_pet
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- Política para SELECT - usuários podem ver fotos de seus próprios eventos
CREATE POLICY "Users can view their own event photos" ON event_photos_pet
    FOR SELECT USING (
        auth.uid() = user_id
    );

-- Política para UPDATE - usuários podem atualizar fotos de seus próprios eventos
CREATE POLICY "Users can update their own event photos" ON event_photos_pet
    FOR UPDATE USING (
        auth.uid() = user_id
    ) WITH CHECK (
        auth.uid() = user_id
    );

-- Política para DELETE - usuários podem deletar fotos de seus próprios eventos
CREATE POLICY "Users can delete their own event photos" ON event_photos_pet
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'event_photos_pet';

-- Garantir que RLS está habilitado
ALTER TABLE event_photos_pet ENABLE ROW LEVEL SECURITY;

-- Verificar permissões para roles anon e authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON event_photos_pet TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;