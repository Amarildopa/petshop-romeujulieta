# Google Tag Manager - Tracking de Botões WhatsApp e Instagram
## PetShop Romeo e Julieta

---

## 1. Visão Geral

Este documento fornece instruções detalhadas para implementar o Google Tag Manager (GTM) no PetShop Romeo e Julieta, com foco específico no tracking de cliques dos botões do WhatsApp e Instagram.

### 1.1 Objetivos
- Medir engajamento com botões sociais (WhatsApp e Instagram)
- Acompanhar conversões de contato via WhatsApp
- Analisar interesse em redes sociais
- Otimizar estratégias de marketing digital

### 1.2 Botões Identificados no Site
Baseado na análise do código, foram identificados os seguintes botões sociais:

**WhatsApp:**
- Botão flutuante (canto inferior direito)
- Botão na página inicial (seção hero)
- Botão na página BanhoTosaSpa
- Links diretos com número: `https://wa.me/${whatsappNumber}`

**Instagram:**
- Botão flutuante (canto inferior direito)
- Integração na página SocialIntegration

---

## 2. Configuração Básica do GTM

### 2.1 Instalação no HTML Principal

**Arquivo:** `index.html`

Adicione o código do GTM no `<head>` (após as meta tags existentes):

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->
```

E no início do `<body>`:

```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

> **Nota:** Substitua `GTM-XXXXXXX` pelo seu ID real do GTM.

### 2.2 Declaração Global do DataLayer

Adicione antes do script do GTM:

```html
<script>
  window.dataLayer = window.dataLayer || [];
</script>
```

---

## 3. Implementação TypeScript/React

### 3.1 Utilitário GTM

**Arquivo:** `src/lib/gtm.ts` (novo arquivo)

```typescript
// Tipos para eventos GTM
export interface GTMEvent {
  event: string;
  event_category?: string;
  event_action?: string;
  event_label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

// Declaração global do dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}

/**
 * Envia evento para o Google Tag Manager
 */
export const sendGTMEvent = (eventData: GTMEvent): void => {
  try {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(eventData);
      console.log('GTM Event sent:', eventData);
    } else {
      console.warn('GTM dataLayer not available');
    }
  } catch (error) {
    console.error('Error sending GTM event:', error);
  }
};

/**
 * Eventos específicos para botões sociais
 */
export const GTMEvents = {
  // WhatsApp Events
  whatsappClick: (location: string, message?: string) => {
    sendGTMEvent({
      event: 'social_engagement',
      event_category: 'Social Media',
      event_action: 'WhatsApp Click',
      event_label: location,
      custom_parameters: {
        platform: 'whatsapp',
        button_location: location,
        message_preview: message?.substring(0, 50) || 'default_message'
      }
    });
  },

  // Instagram Events
  instagramClick: (location: string, action_type?: string) => {
    sendGTMEvent({
      event: 'social_engagement',
      event_category: 'Social Media',
      event_action: 'Instagram Click',
      event_label: location,
      custom_parameters: {
        platform: 'instagram',
        button_location: location,
        action_type: action_type || 'profile_visit'
      }
    });
  },

  // Evento genérico para outros botões sociais
  socialClick: (platform: string, location: string, action?: string) => {
    sendGTMEvent({
      event: 'social_engagement',
      event_category: 'Social Media',
      event_action: `${platform} Click`,
      event_label: location,
      custom_parameters: {
        platform: platform.toLowerCase(),
        button_location: location,
        action_type: action || 'click'
      }
    });
  }
};
```

### 3.2 Hook Personalizado

**Arquivo:** `src/hooks/useGTM.ts` (novo arquivo)

```typescript
import { useCallback } from 'react';
import { GTMEvents } from '../lib/gtm';

export const useGTM = () => {
  const trackWhatsAppClick = useCallback((location: string, message?: string) => {
    GTMEvents.whatsappClick(location, message);
  }, []);

  const trackInstagramClick = useCallback((location: string, actionType?: string) => {
    GTMEvents.instagramClick(location, actionType);
  }, []);

  const trackSocialClick = useCallback((platform: string, location: string, action?: string) => {
    GTMEvents.socialClick(platform, location, action);
  }, []);

  return {
    trackWhatsAppClick,
    trackInstagramClick,
    trackSocialClick
  };
};
```

---

## 4. Implementação nos Componentes Existentes

### 4.1 Página Home.tsx

**Modificações necessárias:**

```typescript
// Adicionar import
import { useGTM } from '../hooks/useGTM';

// No componente Home
export default function Home() {
  const { trackWhatsAppClick, trackInstagramClick } = useGTM();
  
  // Função para WhatsApp (seção hero)
  const handleWhatsAppHero = () => {
    trackWhatsAppClick('hero_section', 'Olá! Gostaria de saber mais sobre os serviços do Romeu & Julieta Pet&Spa');
  };

  // Função para WhatsApp (botão flutuante)
  const handleWhatsAppFloat = () => {
    trackWhatsAppClick('floating_button', 'Contato via botão flutuante');
  };

  // Função para Instagram
  const handleInstagramClick = () => {
    trackInstagramClick('floating_button', 'profile_visit');
  };

  // Aplicar nos botões existentes:
  
  // Botão WhatsApp da seção hero (linha ~127)
  <a
    href={`https://wa.me/${whatsappNumber}?text=Olá! Gostaria de saber mais sobre os serviços do Romeu & Julieta Pet&Spa`}
    target="_blank"
    rel="noopener noreferrer"
    onClick={handleWhatsAppHero} // ADICIONAR ESTA LINHA
    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
    // ... resto das props
  >
    WhatsApp
    <WhatsAppIcon className="w-4 h-4" />
  </a>

  // Botão WhatsApp flutuante (linha ~453)
  <a
    href={`https://wa.me/${whatsappNumber}`}
    target="_blank"
    rel="noopener noreferrer"
    onClick={handleWhatsAppFloat} // ADICIONAR ESTA LINHA
    className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center group overflow-hidden hover:rounded-full hover:px-6"
    // ... resto das props
  >
    <WhatsAppIcon size={24} className="flex-shrink-0" />
    {/* ... resto do conteúdo */}
  </a>
}
```

### 4.2 Página BanhoTosaSpa.tsx

**Modificações necessárias:**

```typescript
// Adicionar import
import { useGTM } from '../hooks/useGTM';

// No componente BanhoTosaSpa
export default function BanhoTosaSpa() {
  const { trackWhatsAppClick } = useGTM();

  // Modificar a função handleWhatsApp existente (linha ~408)
  const handleWhatsApp = () => {
    trackWhatsAppClick('banho_tosa_page', 'Interesse em serviços de banho e tosa');
    // Manter a lógica existente se houver
  };

  // O botão já tem onClick={handleWhatsApp}, apenas modificar a função
}
```

### 4.3 Página SocialIntegration.tsx

**Modificações necessárias:**

```typescript
// Adicionar import
import { useGTM } from '../hooks/useGTM';

// No componente SocialIntegration
export default function SocialIntegration() {
  const { trackSocialClick } = useGTM();

  // Modificar função connectAccount (se existir)
  const connectAccount = (platform: string) => {
    trackSocialClick(platform, 'social_integration_page', 'connect_account');
    // Manter lógica existente
  };

  // Para botões de plataformas específicas
  const handlePlatformClick = (platform: string, action: string) => {
    trackSocialClick(platform, 'social_integration_page', action);
  };
}
```

---

## 5. Configuração no Painel do GTM

### 5.1 Variáveis Personalizadas

Crie as seguintes variáveis no GTM:

**1. Event Category**
- Tipo: Variável da Camada de Dados
- Nome da Variável da Camada de Dados: `event_category`

**2. Event Action**
- Tipo: Variável da Camada de Dados
- Nome da Variável da Camada de Dados: `event_action`

**3. Event Label**
- Tipo: Variável da Camada de Dados
- Nome da Variável da Camada de Dados: `event_label`

**4. Platform**
- Tipo: Variável da Camada de Dados
- Nome da Variável da Camada de Dados: `custom_parameters.platform`

**5. Button Location**
- Tipo: Variável da Camada de Dados
- Nome da Variável da Camada de Dados: `custom_parameters.button_location`

### 5.2 Acionadores (Triggers)

**1. WhatsApp Clicks**
- Tipo: Evento Personalizado
- Nome do Evento: `social_engagement`
- Condição: `custom_parameters.platform` equals `whatsapp`

**2. Instagram Clicks**
- Tipo: Evento Personalizado
- Nome do Evento: `social_engagement`
- Condição: `custom_parameters.platform` equals `instagram`

**3. All Social Clicks**
- Tipo: Evento Personalizado
- Nome do Evento: `social_engagement`

### 5.3 Tags

**1. Google Analytics 4 - WhatsApp Events**
- Tipo: Google Analytics: Evento GA4
- ID de Medição: Seu GA4 Measurement ID
- Nome do Evento: `social_click`
- Parâmetros:
  - `platform`: `{{Platform}}`
  - `button_location`: `{{Button Location}}`
  - `event_category`: `{{Event Category}}`
  - `event_action`: `{{Event Action}}`
- Acionador: WhatsApp Clicks

**2. Google Analytics 4 - Instagram Events**
- Configuração similar à anterior
- Acionador: Instagram Clicks

**3. Facebook Pixel (opcional)**
- Tipo: Facebook Pixel
- Evento: `Lead` ou `Contact`
- Acionador: All Social Clicks

---

## 6. Testes e Validação

### 6.1 Teste Local

**1. Verificar DataLayer**
```javascript
// No console do navegador
console.log(window.dataLayer);
```

**2. Testar Eventos**
```javascript
// Simular clique no WhatsApp
window.dataLayer.push({
  event: 'social_engagement',
  event_category: 'Social Media',
  event_action: 'WhatsApp Click',
  event_label: 'test',
  custom_parameters: {
    platform: 'whatsapp',
    button_location: 'test'
  }
});
```

### 6.2 Validação no GTM

1. **Preview Mode**: Ative o modo de visualização no GTM
2. **Tag Assistant**: Use a extensão Tag Assistant do Chrome
3. **Real-time Reports**: Verifique relatórios em tempo real no GA4

### 6.3 Checklist de Testes

- [ ] DataLayer está sendo inicializado
- [ ] Eventos são enviados ao clicar nos botões WhatsApp
- [ ] Eventos são enviados ao clicar nos botões Instagram
- [ ] Parâmetros personalizados estão sendo capturados
- [ ] Tags estão disparando no GTM Preview
- [ ] Eventos aparecem no GA4 Real-time

---

## 7. Monitoramento e Relatórios

### 7.1 Métricas Importantes

**WhatsApp:**
- Total de cliques por localização do botão
- Taxa de conversão por página
- Horários de maior engajamento
- Mensagens mais utilizadas

**Instagram:**
- Cliques no perfil
- Engajamento por página
- Comparação com outras redes sociais

### 7.2 Relatórios Sugeridos no GA4

**1. Relatório de Eventos Sociais**
- Dimensões: Platform, Button Location, Page Title
- Métricas: Event Count, Users, Sessions

**2. Funil de Conversão Social**
- Etapa 1: Page View
- Etapa 2: Social Click
- Etapa 3: Conversion (se aplicável)

### 7.3 Alertas Recomendados

- Queda significativa em cliques do WhatsApp
- Aumento anormal de cliques (possível spam)
- Falhas no tracking (eventos não sendo enviados)

---

## 8. Manutenção e Atualizações

### 8.1 Versionamento

- Sempre testar mudanças em ambiente de desenvolvimento
- Usar workspace do GTM para testes
- Documentar alterações nas tags e triggers

### 8.2 Backup

- Exportar container do GTM regularmente
- Manter histórico de versões
- Documentar configurações personalizadas

### 8.3 Monitoramento Contínuo

- Verificar semanalmente se os eventos estão sendo enviados
- Analisar mensalmente os relatórios de engajamento
- Ajustar estratégias baseadas nos dados coletados

---

## 9. Próximos Passos

1. **Implementação Imediata:**
   - Configurar container GTM
   - Implementar código básico
   - Testar botões WhatsApp e Instagram

2. **Expansão Futura:**
   - Adicionar tracking de outros botões sociais
   - Implementar Enhanced E-commerce
   - Integrar com outras ferramentas de marketing

3. **Otimização:**
   - A/B testing de posicionamento dos botões
   - Personalização de mensagens WhatsApp
   - Análise de jornada do usuário

---

## 10. Suporte e Recursos

### 10.1 Documentação Oficial
- [Google Tag Manager](https://developers.google.com/tag-manager)
- [Google Analytics 4](https://developers.google.com/analytics/ga4)

### 10.2 Ferramentas Úteis
- Tag Assistant Legacy (Chrome Extension)
- GTM Preview Mode
- GA4 DebugView

### 10.3 Troubleshooting Comum

**Problema:** Eventos não aparecem no GA4
**Solução:** Verificar ID de medição e configuração das tags

**Problema:** DataLayer undefined
**Solução:** Verificar se o script GTM está carregando antes dos eventos

**Problema:** Eventos duplicados
**Solução:** Verificar se não há múltiplos listeners nos botões

---

*Documento criado para PetShop Romeo e Julieta - Implementação GTM para Botões Sociais*
*Versão: 1.0 | Data: 2024*