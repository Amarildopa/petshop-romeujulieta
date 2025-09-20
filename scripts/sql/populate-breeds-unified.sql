-- Arquivo unificado de população de raças - SEM DUPLICATAS
-- Combina dados dos arquivos: populate-breeds-table.sql, populate-dog-breeds.sql, populate-cat-breeds.sql
-- Eliminando raças repetidas e mantendo as melhores definições

-- ========================================
-- RAÇAS DE CÃES (DOGS)
-- ========================================

INSERT INTO public.breeds_pet (name, species, size_category, origin_country, temperament, life_expectancy_min, life_expectancy_max, weight_min_kg, weight_max_kg, height_min_cm, height_max_cm, coat_type, grooming_needs, exercise_needs, good_with_children, good_with_pets, description) VALUES

-- === RAÇAS TOY/PEQUENAS ===
('Chihuahua', 'dog', 'toy', 'México', 'Alerta, corajoso, leal', 14, 16, 1.5, 3.0, 15, 23, 'Liso ou longo', 'low', 'low', true, false, 'Menor raça de cão do mundo, muito leal ao dono'),
('Yorkshire Terrier', 'dog', 'toy', 'Inglaterra', 'Corajoso, determinado, energético', 13, 15, 2.0, 3.2, 18, 23, 'Longo e sedoso', 'high', 'medium', true, false, 'Pequeno terrier com pelagem sedosa e personalidade forte'),
('Poodle Toy', 'dog', 'toy', 'França', 'Inteligente, ativo, elegante', 12, 15, 2.0, 4.0, 24, 28, 'Cacheado', 'high', 'medium', true, true, 'Versão miniatura do Poodle, muito inteligente'),
('Maltês', 'dog', 'toy', 'Malta', 'Gentil, brincalhão, destemido', 12, 15, 2.0, 4.0, 20, 25, 'Longo e sedoso', 'high', 'low', true, true, 'Cão de companhia com pelagem branca sedosa'),
('Spitz Alemão (Lulu da Pomerânia)', 'dog', 'toy', 'Alemanha', 'Vivaz, esperto, carinhoso', 12, 16, 1, 3, 18, 22, 'Duplo e fofo', 'high', 'medium', true, false, 'Pequeno spitz alemão, muito vivaz e carinhoso'),

-- === RAÇAS PEQUENAS ===
('Pug', 'dog', 'small', 'China', 'Charmoso, travesso, amoroso', 12, 15, 6.0, 8.0, 25, 30, 'Curto e liso', 'low', 'low', true, true, 'Cão de face achatada, muito sociável'),
('Shih Tzu', 'dog', 'small', 'Tibet', 'Afetuoso, extrovertido, brincalhão', 10, 18, 4.0, 7.2, 23, 28, 'Longo e duplo', 'high', 'low', true, true, 'Cão de companhia com pelagem longa e fluente'),
('Lhasa Apso', 'dog', 'small', 'Tibet', 'Confiante, engraçado, afetuoso', 12, 15, 5.0, 8.0, 25, 28, 'Longo e duplo', 'high', 'medium', true, true, 'Cão guardião tibetano de pequeno porte'),
('Poodle Anão', 'dog', 'small', 'França', 'Inteligente, sociável, ativo', 12, 15, 6, 7, 28, 35, 'Cacheado', 'high', 'medium', true, true, 'Variedade pequena do Poodle, excelente cão de companhia'),
('Pinscher', 'dog', 'small', 'Alemanha', 'Enérgico, alerta, protetor', 12, 16, 4, 6, 25, 30, 'Curto e liso', 'low', 'high', true, false, 'Pequeno cão alemão, muito alerta e protetor'),
('Dachshund (Teckel)', 'dog', 'small', 'Alemanha', 'Brincalhão, teimoso, destemido', 12, 16, 7, 15, 20, 27, 'Curto ou longo', 'medium', 'medium', true, true, 'Cão alemão de corpo alongado, originalmente caçador de texugos'),
('Schnauzer Miniatura', 'dog', 'small', 'Alemanha', 'Vigilante, sociável, inteligente', 12, 15, 5, 8, 30, 36, 'Duplo e áspero', 'high', 'medium', true, true, 'Menor variedade do Schnauzer, muito alerta'),
('West Highland White Terrier', 'dog', 'small', 'Escócia', 'Dócil, extrovertido, brincalhão', 13, 15, 6, 10, 25, 28, 'Duplo e áspero', 'high', 'medium', true, true, 'Terrier escocês de pelagem branca, muito extrovertido'),
('Terrier Brasileiro (Fox Paulistinha)', 'dog', 'small', 'Brasil', 'Ágil, energético, inteligente', 12, 15, 6, 10, 33, 40, 'Curto e liso', 'low', 'high', true, true, 'Raça brasileira desenvolvida no século XX, muito ágil'),

-- === RAÇAS MÉDIAS ===
('Beagle', 'dog', 'medium', 'Inglaterra', 'Amigável, curioso, alegre', 12, 15, 9.0, 11.0, 33, 41, 'Curto e denso', 'low', 'high', true, true, 'Cão de caça com excelente olfato'),
('Cocker Spaniel', 'dog', 'medium', 'Inglaterra', 'Gentil, inteligente, feliz', 12, 15, 12.0, 15.0, 36, 43, 'Médio e sedoso', 'high', 'medium', true, true, 'Cão esportivo com orelhas longas'),
('Border Collie', 'dog', 'medium', 'Escócia', 'Inteligente, enérgico, alerta', 12, 15, 14.0, 20.0, 46, 56, 'Duplo e médio', 'medium', 'high', true, true, 'Cão pastor extremamente inteligente'),
('Australian Shepherd', 'dog', 'medium', 'Estados Unidos', 'Inteligente, trabalhador, exuberante', 12, 15, 16.0, 32.0, 46, 58, 'Duplo e médio', 'medium', 'high', true, true, 'Cão pastor australiano muito ativo'),
('Bulldog Francês', 'dog', 'small', 'França', 'Adaptável, brincalhão, inteligente', 10, 12, 8.0, 13.0, 28, 33, 'Curto e liso', 'low', 'low', true, true, 'Cão de companhia com orelhas de morcego'),
('Basset Hound', 'dog', 'medium', 'França', 'Paciente, baixo-chave, charmoso', 10, 12, 20.0, 29.0, 33, 38, 'Curto e denso', 'low', 'medium', true, true, 'Cão de caça com pernas curtas e orelhas longas'),
('Poodle Médio', 'dog', 'medium', 'França', 'Inteligente, sociável, ativo', 12, 15, 15, 20, 35, 45, 'Cacheado', 'high', 'high', true, true, 'Variedade média do Poodle, equilibrado entre tamanho e energia'),
('Buldogue Inglês', 'dog', 'medium', 'Inglaterra', 'Calmo, afetuoso, obstinado', 8, 10, 18, 25, 31, 40, 'Curto e liso', 'low', 'low', true, true, 'Bulldog inglês tradicional, calmo e afetuoso'),
('Schnauzer Standard', 'dog', 'medium', 'Alemanha', 'Vigilante, sociável, inteligente', 12, 15, 14, 20, 44, 50, 'Duplo e áspero', 'high', 'high', true, true, 'Variedade média do Schnauzer, equilibrado e versátil'),
('Dálmata', 'dog', 'large', 'Croácia', 'Brincalhão, sociável, ativo', 11, 13, 16, 32, 48, 61, 'Curto e denso', 'low', 'high', true, true, 'Cão croata famoso por suas pintas características'),
('Pit Bull', 'dog', 'medium', 'Estados Unidos', 'Enérgico, fiel, protetor', 8, 15, 14, 36, 43, 53, 'Curto e liso', 'low', 'high', true, true, 'Cão americano forte e atlético, muito leal à família'),
('Shar-pei', 'dog', 'medium', 'China', 'Independente, leal, reservado', 8, 12, 18, 25, 46, 51, 'Curto e áspero', 'low', 'medium', true, true, 'Cão chinês com pele enrugada característica'),
('Pastor Shetland', 'dog', 'medium', 'Escócia', 'Inteligente, amigável, ativo', 12, 14, 5, 11, 33, 41, 'Duplo e longo', 'high', 'high', true, true, 'Pastor escocês de porte médio, muito inteligente'),
('Vira-lata (SRD)', 'dog', 'medium', 'Brasil', 'Amigável, adaptável, companheiro', 12, 16, 10, 25, 30, 60, 'Variado', 'low', 'medium', true, true, 'Cão sem raça definida, muito comum no Brasil. Conhecido por sua adaptabilidade e temperamento amigável'),

-- === RAÇAS GRANDES ===
('Labrador Retriever', 'dog', 'large', 'Canadá', 'Amigável, extrovertido, ativo', 10, 12, 25.0, 36.0, 55, 62, 'Curto e denso', 'low', 'high', true, true, 'Cão retriever muito popular e amigável'),
('Golden Retriever', 'dog', 'large', 'Escócia', 'Amigável, inteligente, devotado', 10, 12, 25.0, 34.0, 51, 61, 'Longo e denso', 'medium', 'high', true, true, 'Cão retriever com pelagem dourada'),
('Pastor Alemão', 'dog', 'large', 'Alemanha', 'Confiante, corajoso, inteligente', 9, 13, 22.0, 40.0, 55, 65, 'Duplo e médio', 'medium', 'high', true, true, 'Cão pastor versátil e leal'),
('Rottweiler', 'dog', 'large', 'Alemanha', 'Leal, amoroso, guardião confiante', 8, 10, 35.0, 60.0, 56, 69, 'Curto e duplo', 'low', 'medium', false, false, 'Cão de guarda poderoso e leal'),
('Boxer', 'dog', 'large', 'Alemanha', 'Brincalhão, energético, brilhante', 10, 12, 25.0, 32.0, 53, 63, 'Curto e liso', 'low', 'high', true, true, 'Cão atlético e brincalhão'),
('Husky Siberiano', 'dog', 'large', 'Sibéria', 'Extrovertido, gentil, alerta', 12, 15, 16.0, 27.0, 51, 60, 'Duplo e denso', 'medium', 'high', true, true, 'Cão de trenó resistente ao frio'),
('Poodle Standard', 'dog', 'large', 'França', 'Inteligente, sociável, ativo', 12, 15, 20, 32, 45, 60, 'Cacheado', 'high', 'high', true, true, 'Maior variedade do Poodle, originalmente cão de caça aquática'),
('Dobermann', 'dog', 'large', 'Alemanha', 'Protetor, atento, obediente', 10, 13, 27, 45, 61, 72, 'Curto e liso', 'low', 'high', false, false, 'Cão alemão elegante e atlético, excelente guardião'),
('Fila Brasileiro', 'dog', 'large', 'Brasil', 'Protetor, leal, corajoso', 9, 11, 40, 50, 60, 75, 'Curto e denso', 'low', 'medium', false, false, 'Raça brasileira de grande porte, muito leal à família'),
('Akita', 'dog', 'large', 'Japão', 'Calmo, leal, reservado', 10, 13, 32, 59, 61, 71, 'Duplo e denso', 'medium', 'medium', false, false, 'Cão japonês de grande porte, muito leal e reservado'),
('Braco Alemão de pelo curto', 'dog', 'large', 'Alemanha', 'Ativo, versátil, inteligente', 10, 12, 20, 32, 53, 64, 'Curto e denso', 'low', 'high', true, true, 'Cão de caça alemão, muito versátil e ativo'),

-- === RAÇAS GIGANTES ===
('Great Dane', 'dog', 'giant', 'Alemanha', 'Amigável, paciente, confiável', 8, 10, 45.0, 90.0, 71, 86, 'Curto e liso', 'low', 'medium', true, true, 'Gigante gentil, uma das maiores raças'),
('São Bernardo', 'dog', 'giant', 'Suíça', 'Brincalhão, charmoso, inquisitivo', 8, 10, 54.0, 82.0, 66, 76, 'Longo ou curto', 'medium', 'medium', true, true, 'Cão de resgate alpino, muito gentil'),
('Mastiff Inglês', 'dog', 'giant', 'Inglaterra', 'Corajoso, dignificado, bondoso', 6, 10, 54.0, 113.0, 70, 91, 'Curto e duplo', 'low', 'low', true, true, 'Uma das raças mais pesadas do mundo'),
('Terra Nova', 'dog', 'giant', 'Canadá', 'Calmo, gentil, protetor', 8, 10, 45, 70, 63, 74, 'Duplo e denso', 'high', 'medium', true, true, 'Cão canadense gigante, conhecido por suas habilidades aquáticas'),

-- ========================================
-- RAÇAS DE GATOS (CATS)
-- ========================================

-- === RAÇAS PEQUENAS ===
('Munchkin', 'cat', 'small', 'Estados Unidos', 'Extrovertido, inteligente, responsivo', 12, 15, 2.3, 4.1, 13, 20, 'Curto ou longo', 'medium', 'medium', true, true, 'Gato com pernas curtas características'),

-- === RAÇAS MÉDIAS ===
('Persa', 'cat', 'medium', 'Irã', 'Quieto, doce, gentil', 12, 17, 3.2, 5.5, 25, 38, 'Longo e denso', 'high', 'low', true, true, 'Gato de pelagem longa e face achatada'),
('Siamês', 'cat', 'medium', 'Tailândia', 'Ativo, falante, inteligente', 12, 20, 2.7, 4.5, 29, 36, 'Curto e fino', 'low', 'medium', true, true, 'Gato oriental com pontos coloridos'),
('British Shorthair', 'cat', 'medium', 'Reino Unido', 'Calmo, fácil de lidar, afetuoso', 12, 17, 3.2, 7.7, 30, 35, 'Curto e denso', 'low', 'low', true, true, 'Gato robusto com pelagem densa'),
('Abissínio', 'cat', 'medium', 'Etiópia', 'Ativo, brincalhão, inteligente', 9, 15, 2.7, 4.5, 20, 25, 'Curto e fino', 'low', 'high', true, true, 'Gato atlético com pelagem ticked'),
('Scottish Fold', 'cat', 'medium', 'Escócia', 'Calmo, afetuoso, adaptável', 11, 15, 2.7, 6.0, 20, 25, 'Curto ou longo', 'medium', 'low', true, true, 'Gato com orelhas dobradas características'),
('Sphynx', 'cat', 'medium', 'Canadá', 'Energético, amoroso, extrovertido', 8, 14, 3.2, 5.0, 20, 25, 'Sem pelos', 'high', 'medium', true, true, 'Gato sem pelos, muito afetuoso'),
('Bengal', 'cat', 'medium', 'Estados Unidos', 'Ativo, inteligente, energético', 12, 16, 3.6, 6.8, 20, 25, 'Curto e denso', 'low', 'high', true, false, 'Gato com padrão selvagem, muito ativo'),
('Russian Blue', 'cat', 'medium', 'Rússia', 'Gentil, quieto, reservado', 15, 20, 3.2, 5.4, 25, 30, 'Curto e duplo', 'low', 'low', true, true, 'Gato azul-acinzentado com olhos verdes'),
('Angorá Turco', 'cat', 'medium', 'Turquia', 'Inteligente, afetuoso, brincalhão', 12, 18, 2.7, 4.5, 23, 25, 'Longo e sedoso', 'high', 'medium', true, true, 'Gato de pelagem longa e sedosa'),
('SRD (Vira-lata)', 'cat', 'medium', 'Brasil', 'Variado, geralmente afetuoso e adaptável', 12, 18, 3, 6, 23, 30, 'Variado', 'medium', 'medium', true, true, 'Gato sem raça definida, muito comum no Brasil. Conhecido por sua adaptabilidade e temperamento variado'),
('Exótico (Exotic Shorthair)', 'cat', 'medium', 'Estados Unidos', 'Calmo, dócil, carinhoso', 8, 15, 3, 6, 25, 30, 'Curto e denso', 'medium', 'low', true, true, 'Versão de pelo curto do Persa, com temperamento similar mas menos manutenção'),
('American Shorthair', 'cat', 'medium', 'Estados Unidos', 'Adaptável, amigável, independente', 13, 17, 3, 7, 20, 25, 'Curto e denso', 'low', 'medium', true, true, 'Gato americano versátil e adaptável, excelente caçador'),
('Azul Russo', 'cat', 'medium', 'Rússia', 'Reservado, afetuoso, tranquilo', 10, 20, 3, 5, 25, 30, 'Curto e denso', 'low', 'low', true, true, 'Gato russo de pelagem azul-acinzentada, reservado mas leal'),
('Himalaio', 'cat', 'medium', 'Estados Unidos', 'Calmo, dócil, pacífico', 9, 15, 3, 5, 25, 30, 'Longo e sedoso', 'high', 'low', true, true, 'Cruzamento entre Persa e Siamês, com padrão colorpoint'),
('Snowshoe', 'cat', 'medium', 'Estados Unidos', 'Enérgico, carinhoso, apegado', 14, 19, 3, 5, 20, 25, 'Curto e denso', 'low', 'medium', true, true, 'Gato americano com "sapatos" brancos característicos'),
('Pelo Curto Brasileiro', 'cat', 'medium', 'Brasil', 'Ativo, brincalhão, afetuoso', 12, 18, 3, 5, 25, 30, 'Curto e liso', 'low', 'medium', true, true, 'Raça brasileira desenvolvida a partir de gatos locais, muito adaptável'),
('Bobtail Americano', 'cat', 'medium', 'Estados Unidos', 'Brincalhão, amigável, adaptável', 11, 15, 3, 7, 25, 30, 'Semi-longo', 'medium', 'medium', true, true, 'Gato americano com cauda curta natural, muito sociável'),
('Sagrado da Birmânia', 'cat', 'medium', 'França', 'Afeituoso, dócil, sociável', 12, 16, 4, 6, 25, 30, 'Semi-longo', 'medium', 'low', true, true, 'Gato francês com padrão colorpoint e "luvas" brancas'),
('Chantilly-Tiffany', 'cat', 'medium', 'Estados Unidos', 'Meigo, companheiro, tranquilo', 12, 16, 3, 5, 25, 30, 'Semi-longo', 'medium', 'low', true, true, 'Gato americano de pelagem semi-longa, muito apegado aos donos'),

-- === RAÇAS GRANDES ===
('Maine Coon', 'cat', 'large', 'Estados Unidos', 'Gentil, amigável, inteligente', 13, 14, 4.5, 8.2, 25, 41, 'Longo e denso', 'medium', 'medium', true, true, 'Uma das maiores raças de gatos domésticos'),
('Ragdoll', 'cat', 'large', 'Estados Unidos', 'Dócil, calmo, afetuoso', 13, 18, 4.5, 9.1, 23, 28, 'Semi-longo', 'medium', 'low', true, true, 'Gato grande que relaxa quando pego no colo');

-- Nota: IDs são UUIDs gerados automaticamente pelo Supabase, não precisam de ajuste de sequência

-- Verificar inserção das raças
SELECT 
    species,
    COUNT(*) as total_breeds,
    STRING_AGG(name, ', ' ORDER BY name) as breed_names
FROM public.breeds_pet 
GROUP BY species
ORDER BY species;

-- Estatísticas finais
SELECT 
    'TOTAL GERAL' as categoria,
    COUNT(*) as quantidade
FROM public.breeds_pet
UNION ALL
SELECT 
    'CÃES' as categoria,
    COUNT(*) as quantidade
FROM public.breeds_pet 
WHERE species = 'dog'
UNION ALL
SELECT 
    'GATOS' as categoria,
    COUNT(*) as quantidade
FROM public.breeds_pet 
WHERE species = 'cat';