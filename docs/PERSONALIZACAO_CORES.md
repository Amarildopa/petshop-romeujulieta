# Sistema de Personalização de Cores - PetShop Romeu & Julieta

## Visão Geral

O sistema de personalização de cores permite que administradores customizem a identidade visual do PetShop Romeu & Julieta de forma dinâmica, sem necessidade de alterações no código.

## Como Funciona

### 1. Arquitetura do Sistema

#### Variáveis CSS Customizadas
- **Localização**: `src/styles/theme-variables.css`
- **Função**: Define variáveis CSS que podem ser alteradas dinamicamente
- **Escopo**: Global (`:root`)

#### Página de Personalização
- **Rota**: `/theme-customizer`
- **Acesso**: Apenas administradores (protegida por `AdminRouteGuard`)
- **Arquivo**: `src/pages/ThemeCustomizer.tsx`

### 2. Paleta de Cores Disponível

#### Cores Primárias
- `--color-primary`: Cor principal do sistema
- `--color-primary-light`: Versão clara da cor primária
- `--color-primary-dark`: Versão escura da cor primária

#### Cores Secundárias
- `--color-secondary`: Cor secundária do sistema
- `--color-secondary-light`: Versão clara da cor secundária
- `--color-secondary-dark`: Versão escura da cor secundária

#### Cores de Destaque
- `--color-accent`: Cor de destaque/accent
- `--color-accent-light`: Versão clara do accent
- `--color-accent-dark`: Versão escura do accent

#### Cores de Superfície
- `--color-surface`: Cor de fundo principal
- `--color-surface-dark`: Cor de fundo secundária

#### Cores de Texto
- `--color-text`: Cor de texto padrão
- `--color-text-dark`: Cor de texto escuro

### 3. Temas Predefinidos

#### Padrão (Roxo)
- Primária: #8B5CF6 (Roxo vibrante)
- Secundária: #06B6D4 (Ciano)
- Accent: #F59E0B (Âmbar)

#### Azul Profissional
- Primária: #3B82F6 (Azul)
- Secundária: #10B981 (Verde esmeralda)
- Accent: #F59E0B (Âmbar)

#### Rosa Delicado
- Primária: #EC4899 (Rosa)
- Secundária: #8B5CF6 (Roxo)
- Accent: #F59E0B (Âmbar)

#### Verde Natural
- Primária: #10B981 (Verde)
- Secundária: #3B82F6 (Azul)
- Accent: #F59E0B (Âmbar)

#### Tema Escuro
- Superfícies escuras para modo noturno
- Texto claro para contraste

### 4. Componentes Personalizáveis

#### Botões
- Botões primários, secundários e de destaque
- Estados hover e focus
- Variações outline e ghost

#### Formulários
- Campos de entrada (input, select, textarea)
- Estados de foco com ring colorido
- Labels e placeholders

#### Cards e Containers
- Bordas coloridas
- Fundos com opacidade
- Ícones temáticos

#### Navegação
- Tabs ativas
- Menu items selecionados
- Breadcrumbs

#### Notificações
- Alertas de sucesso, erro, aviso e informação
- Badges e tags
- Status indicators

### 5. Como Usar (Para Administradores)

#### Acesso à Ferramenta
1. Faça login como administrador
2. Acesse `/theme-customizer`
3. A página será carregada com as configurações atuais

#### Personalização
1. **Temas Predefinidos**: Clique em um dos temas para aplicar instantaneamente
2. **Cores Personalizadas**: Use os seletores de cor para ajustar cada variável
3. **Preview em Tempo Real**: Ative o modo preview para ver as mudanças
4. **Componentes de Teste**: Visualize como cada componente fica com as novas cores

#### Salvamento e Exportação
1. **Exportar Tema**: Baixa um arquivo JSON com as configurações
2. **Importar Tema**: Carrega configurações de um arquivo JSON
3. **Resetar**: Volta às configurações padrão

### 6. Implementação Técnica

#### Aplicação Dinâmica
```javascript
const applyCustomColors = (colors) => {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', colors.primary);
  // ... outras propriedades
};
```

#### Classes CSS Utilitárias
```css
.bg-custom-primary {
  background-color: var(--color-primary);
}

.text-custom-primary {
  color: var(--color-primary);
}
```

#### Uso nos Componentes
```jsx
// Usando style inline
<button style={{ backgroundColor: customColors.primary }}>
  Botão Personalizado
</button>

// Usando classes CSS
<div className="bg-custom-primary text-white">
  Container Personalizado
</div>
```

### 7. Persistência de Dados

#### Armazenamento Local (Atual)
- As configurações são salvas no `localStorage`
- Aplicadas automaticamente no carregamento da página
- Limitado ao navegador atual

#### Armazenamento no Banco (Futuro)
- Configurações salvas no perfil da empresa
- Sincronização entre dispositivos
- Histórico de alterações
- Backup automático

### 8. Benefícios do Sistema

#### Para Administradores
- **Facilidade**: Interface visual intuitiva
- **Flexibilidade**: Personalização completa das cores
- **Preview**: Visualização em tempo real
- **Backup**: Exportação e importação de temas

#### Para o Negócio
- **Identidade Visual**: Alinhamento com a marca
- **Diferenciação**: Visual único e personalizado
- **Adaptabilidade**: Mudanças sazonais ou promocionais
- **Profissionalismo**: Aparência consistente e polida

#### Para Usuários
- **Experiência Consistente**: Visual harmonioso
- **Acessibilidade**: Cores com bom contraste
- **Modernidade**: Interface atual e atrativa

### 9. Considerações de Implementação

#### Performance
- Variáveis CSS são nativas e performáticas
- Não há re-renderização desnecessária
- Carregamento rápido das configurações

#### Acessibilidade
- Contraste adequado entre cores
- Suporte a temas de alto contraste
- Compatibilidade com leitores de tela

#### Compatibilidade
- Suporte a navegadores modernos
- Fallbacks para navegadores antigos
- Responsividade mantida

### 10. Próximos Passos

#### Melhorias Planejadas
1. **Persistência no Banco**: Salvar configurações no servidor
2. **Temas por Usuário**: Permitir preferências individuais
3. **Modo Escuro**: Toggle automático baseado no sistema
4. **Mais Variáveis**: Fontes, espaçamentos, bordas
5. **Templates**: Temas pré-configurados para diferentes ocasiões

#### Integração com Admin
- Adicionar link no painel administrativo
- Permissões granulares para personalização
- Log de alterações de tema
- Aprovação de mudanças em produção

---

## Conclusão

O sistema de personalização de cores oferece uma solução robusta e flexível para customização visual, permitindo que o PetShop Romeu & Julieta mantenha uma identidade visual única e profissional, adaptável às necessidades do negócio e preferências dos administradores.

A implementação atual fornece uma base sólida que pode ser expandida com funcionalidades adicionais conforme a necessidade, sempre mantendo a simplicidade de uso e a performance do sistema.