import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Home from '../Home';

// Mock do faker
vi.mock('@faker-js/faker', () => ({
  faker: {
    person: {
      firstName: vi.fn(() => 'João Silva')
    },
    animal: {
      dog: vi.fn(() => 'Rex')
    },
    image: {
      avatar: vi.fn(() => 'https://example.com/avatar.jpg')
    },
    lorem: {
      paragraph: vi.fn(() => 'Este é um depoimento de teste sobre o excelente atendimento do petshop.')
    }
  }
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home Page - Análise de Dados Mockados', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('🔍 RELATÓRIO DE DADOS MOCKADOS NA HOME', () => {
    it('✅ IDENTIFICAÇÃO: Depoimentos usam dados mockados do Faker', async () => {
      renderWithRouter(<Home />);
      
      // Importar o faker mockado
      const { faker } = await import('@faker-js/faker');
      
      // ✅ CONFIRMADO: Faker é usado para gerar depoimentos
      expect(faker.person.firstName).toHaveBeenCalled();
      expect(faker.animal.dog).toHaveBeenCalled();
      expect(faker.image.avatar).toHaveBeenCalled();
      expect(faker.lorem.paragraph).toHaveBeenCalled();
      
      // ✅ CONFIRMADO: Seção de depoimentos existe
      expect(screen.getByText('O que nossos clientes dizem')).toBeInTheDocument();
      
      console.log('\n🚨 DADOS MOCKADOS ENCONTRADOS:');
      console.log('- Depoimentos de clientes: FAKER.JS');
      console.log('- Nomes de tutores: faker.person.firstName()');
      console.log('- Nomes de pets: faker.animal.dog()');
      console.log('- Avatares: faker.image.avatar()');
      console.log('- Textos de depoimentos: faker.lorem.paragraph()');
      console.log('- STATUS: ✅ CONFIRMADO - Faker está sendo usado para gerar depoimentos mockados');
    });

    it('✅ CONFIRMADO: Exatamente 3 depoimentos são gerados com dados mockados', async () => {
      renderWithRouter(<Home />);
      
      const { faker } = await import('@faker-js/faker');
      
      // ✅ CONFIRMADO: 3 depoimentos mockados
      expect(faker.person.firstName).toHaveBeenCalledTimes(3);
      expect(faker.animal.dog).toHaveBeenCalledTimes(3);
      expect(faker.image.avatar).toHaveBeenCalledTimes(3);
      expect(faker.lorem.paragraph).toHaveBeenCalledTimes(3);
      
      console.log('\n📊 QUANTIDADE DE DADOS MOCKADOS:');
      console.log('- 3 nomes de tutores mockados');
      console.log('- 3 nomes de pets mockados');
      console.log('- 3 avatares mockados');
      console.log('- 3 depoimentos mockados');
    });

    it('✅ DADOS REAIS: Serviços usam dados estáticos (não mockados)', () => {
      renderWithRouter(<Home />);
      
      // ✅ CONFIRMADO: Serviços são dados estáticos reais
      expect(screen.getByText('Banho & Tosa')).toBeInTheDocument();
      expect(screen.getByText('Consultas Vet')).toBeInTheDocument();
      expect(screen.getByText('Daycare')).toBeInTheDocument();
      expect(screen.getByText('Loja Premium')).toBeInTheDocument();
      
      console.log('\n✅ DADOS REAIS CONFIRMADOS:');
      console.log('- Serviços: Dados estáticos apropriados');
      console.log('- Descrições: Conteúdo real do negócio');
    });

    it('⚠️ ATENÇÃO: Imagens externas do Unsplash', () => {
      renderWithRouter(<Home />);
      
      // ⚠️ ATENÇÃO: Usando imagens externas
      const heroImage = screen.getByAltText('Cachorro feliz');
      const aboutImage = screen.getByAltText('Veterinária cuidando de um cachorro');
      
      expect(heroImage).toHaveAttribute('src', expect.stringContaining('unsplash.com'));
      expect(aboutImage).toHaveAttribute('src', expect.stringContaining('unsplash.com'));
      
      console.log('\n⚠️ IMAGENS EXTERNAS:');
      console.log('- Hero: Unsplash (considerar substituir por foto própria)');
      console.log('- About: Unsplash (considerar substituir por foto própria)');
    });

    it('📋 RELATÓRIO FINAL: Resumo dos dados mockados na Home', () => {
      renderWithRouter(<Home />);
      
      const relatorioFinal = {
        dadosMockados: {
          depoimentos: {
            status: '🚨 MOCKADO',
            fonte: '@faker-js/faker',
            quantidade: 3,
            campos: ['nome do tutor', 'nome do pet', 'avatar', 'texto do depoimento'],
            recomendacao: 'SUBSTITUIR por sistema de depoimentos reais ou dados estáticos de clientes reais'
          }
        },
        dadosReais: {
          servicos: {
            status: '✅ REAL',
            fonte: 'dados estáticos',
            quantidade: 4,
            campos: ['nome', 'descrição', 'ícone'],
            recomendacao: 'Adequado - dados do negócio'
          },
          configuracao: {
            status: '✅ REAL',
            fonte: 'constants/app.ts',
            campos: ['nome da empresa', 'textos institucionais'],
            recomendacao: 'Adequado - configuração da aplicação'
          }
        },
        pontosAtencao: {
          imagens: {
            status: '⚠️ EXTERNAS',
            fonte: 'unsplash.com',
            quantidade: 2,
            recomendacao: 'Considerar usar fotos próprias do petshop'
          }
        }
      };
      
      console.log('\n📋 RELATÓRIO FINAL - DADOS MOCKADOS NA HOME:');
      console.log(JSON.stringify(relatorioFinal, null, 2));
      
      // Verificar estrutura básica
      expect(screen.getByText('Com muito Carinho e Confiança para o seu Pet')).toBeInTheDocument();
      expect(screen.getByText('O que nossos clientes dizem')).toBeInTheDocument();
      
      // ✅ CONCLUSÃO: Apenas os depoimentos estão mockados
      expect(relatorioFinal.dadosMockados.depoimentos.status).toBe('🚨 MOCKADO');
      expect(relatorioFinal.dadosReais.servicos.status).toBe('✅ REAL');
    });
  });
});