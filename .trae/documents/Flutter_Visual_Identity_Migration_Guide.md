# Guia de Migração da Identidade Visual Web para Flutter Mobile
## PetShop Romeu & Julieta

---

## 1. Análise da Identidade Visual Atual (Web)

### 1.1 Paleta de Cores Principal

#### Cores Primárias - Rosa Delicado
- **Primary**: `#F8BBD9` (Rosa principal)
- **Primary Light**: `#FDE2F3` (Rosa claro)
- **Primary Dark**: `#F472B6` (Rosa escuro)

#### Cores Secundárias - Azul Suave
- **Secondary**: `#BFDBFE` (Azul principal)
- **Secondary Light**: `#DBEAFE` (Azul claro)
- **Secondary Dark**: `#93C5FD` (Azul escuro)

#### Cores de Destaque - Amarelo Suave
- **Accent**: `#FEF3C7` (Amarelo principal)
- **Accent Light**: `#FFFBEB` (Amarelo claro)
- **Accent Dark**: `#FCD34D` (Amarelo escuro)

#### Cores de Superfície
- **Surface**: `#FEF7FF` (Fundo principal)
- **Surface Dark**: `#FCE7F3` (Fundo secundário)

#### Cores de Texto
- **Text**: `#64748B` (Texto padrão)
- **Text Dark**: `#334155` (Texto escuro)

#### Cores de Status
- **Success**: `#10B981` / Light: `#D1FAE5`
- **Warning**: `#F59E0B` / Light: `#FEF3C7`
- **Danger**: `#EF4444` / Light: `#FEE2E2`
- **Info**: `#3B82F6` / Light: `#DBEAFE`

### 1.2 Tipografia

#### Fontes Principais
- **Sans-serif**: Inter (texto geral)
- **Serif**: Playfair Display (títulos e destaques)

#### Hierarquia Tipográfica
- **H1**: 4xl-6xl (36-60px) - Títulos principais
- **H2**: 3xl (30px) - Subtítulos
- **H3**: xl-2xl (20-24px) - Seções
- **Body**: base-lg (16-18px) - Texto geral
- **Small**: sm-xs (12-14px) - Textos auxiliares

### 1.3 Componentes Visuais Característicos

#### Bordas e Formas
- **Border Radius**: 8px (sm), 12px (base), 16px (lg), 24px (xl), 32px (2xl)
- **Shadows**: Suaves com opacidade baixa
- **Cards**: Fundo branco, bordas arredondadas, sombra sutil

#### Animações
- **Transições**: 200-300ms duration
- **Hover Effects**: Scale (1.05), color transitions
- **Motion**: Framer Motion com easing suave

#### Ícones
- **Biblioteca**: Lucide React
- **Tamanhos**: 16px (sm), 20px (base), 24px (lg)
- **Estilo**: Outline, stroke-width 2

---

## 2. Mapeamento Web → Flutter

### 2.1 Sistema de Cores Flutter

```dart
// lib/core/theme/app_colors.dart
class AppColors {
  // Cores Primárias - Rosa Delicado
  static const Color primary = Color(0xFFF8BBD9);
  static const Color primaryLight = Color(0xFFFDE2F3);
  static const Color primaryDark = Color(0xFFF472B6);
  
  // Cores Secundárias - Azul Suave
  static const Color secondary = Color(0xFFBFDBFE);
  static const Color secondaryLight = Color(0xFFDBEAFE);
  static const Color secondaryDark = Color(0xFF93C5FD);
  
  // Cores de Destaque - Amarelo Suave
  static const Color accent = Color(0xFFFEF3C7);
  static const Color accentLight = Color(0xFFFFFBEB);
  static const Color accentDark = Color(0xFFFCD34D);
  
  // Cores de Superfície
  static const Color surface = Color(0xFFFEF7FF);
  static const Color surfaceDark = Color(0xFFFCE7F3);
  
  // Cores de Texto
  static const Color textColor = Color(0xFF64748B);
  static const Color textColorDark = Color(0xFF334155);
  
  // Cores de Status
  static const Color success = Color(0xFF10B981);
  static const Color successLight = Color(0xFFD1FAE5);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color danger = Color(0xFFEF4444);
  static const Color dangerLight = Color(0xFFFEE2E2);
  static const Color info = Color(0xFF3B82F6);
  static const Color infoLight = Color(0xFFDBEAFE);
}
```

### 2.2 Tema Flutter

```dart
// lib/core/theme/app_theme.dart
class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: AppColors.surface,
        background: AppColors.surface,
      ),
      
      // Tipografia
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.playfairDisplay(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: AppColors.textColorDark,
        ),
        headlineLarge: GoogleFonts.playfairDisplay(
          fontSize: 28,
          fontWeight: FontWeight.bold,
          color: AppColors.textColorDark,
        ),
        titleLarge: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: AppColors.textColorDark,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 16,
          color: AppColors.textColor,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 14,
          color: AppColors.textColor,
        ),
      ),
      
      // Componentes
      cardTheme: CardTheme(
        color: Colors.white,
        elevation: 2,
        shadowColor: Colors.black.withOpacity(0.1),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 2,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.accent),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.primary, width: 2),
        ),
      ),
    );
  }
}
```

### 2.3 Mapeamento de Componentes

| Componente Web | Equivalente Flutter | Observações |
|----------------|--------------------|--------------|
| Header/Navbar | AppBar + BottomNavigationBar | Dividir navegação |
| Cards | Card Widget | Manter bordas arredondadas |
| Buttons | ElevatedButton/OutlinedButton | Preservar estilo |
| Forms | TextFormField | Manter design |
| Modal | showDialog/BottomSheet | Adaptar para mobile |
| Hero Section | Container + Column | Layout vertical |
| Grid Layout | GridView.builder | Responsivo |
| List Items | ListTile/Custom Widget | Otimizar para touch |
| Animations | AnimatedContainer/Hero | Manter suavidade |

---

## 3. Estrutura de Componentes Flutter

### 3.1 Organização de Pastas

```
lib/
├── core/
│   ├── theme/
│   │   ├── app_colors.dart
│   │   ├── app_theme.dart
│   │   └── app_text_styles.dart
│   ├── constants/
│   │   └── app_constants.dart
│   └── utils/
├── shared/
│   ├── widgets/
│   │   ├── buttons/
│   │   │   ├── primary_button.dart
│   │   │   ├── secondary_button.dart
│   │   │   └── outline_button.dart
│   │   ├── cards/
│   │   │   ├── service_card.dart
│   │   │   ├── package_card.dart
│   │   │   └── info_card.dart
│   │   ├── forms/
│   │   │   ├── custom_text_field.dart
│   │   │   └── custom_dropdown.dart
│   │   └── common/
│   │       ├── loading_widget.dart
│   │       ├── error_widget.dart
│   │       └── empty_state.dart
│   └── animations/
│       ├── fade_in_animation.dart
│       └── slide_animation.dart
├── features/
│   ├── home/
│   ├── services/
│   ├── profile/
│   └── booking/
└── main.dart
```

### 3.2 Componentes Reutilizáveis

#### Botão Primário
```dart
// lib/shared/widgets/buttons/primary_button.dart
class PrimaryButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;
  
  const PrimaryButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.icon,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 2,
        ),
        child: isLoading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (icon != null) ..[
                    Icon(icon, size: 18),
                    const SizedBox(width: 8),
                  ],
                  Text(
                    text,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
```

#### Card de Serviço
```dart
// lib/shared/widgets/cards/service_card.dart
class ServiceCard extends StatelessWidget {
  final String title;
  final String description;
  final IconData icon;
  final VoidCallback? onTap;
  
  const ServiceCard({
    Key? key,
    required this.title,
    required this.description,
    required this.icon,
    this.onTap,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.secondaryLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    icon,
                    size: 32,
                    color: AppColors.secondaryDark,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  description,
                  style: Theme.of(context).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

---

## 4. Guidelines de UI/UX Mobile

### 4.1 Princípios de Design Mobile

#### Navegação
- **Bottom Navigation**: 3-5 itens principais
- **Tab Bar**: Para seções dentro de páginas
- **Drawer**: Menu lateral para itens secundários
- **Back Button**: Sempre visível e funcional

#### Touch Targets
- **Mínimo**: 44px x 44px (iOS) / 48dp x 48dp (Android)
- **Recomendado**: 56px x 56px para botões principais
- **Espaçamento**: Mínimo 8px entre elementos tocáveis

#### Layout Responsivo
- **Breakpoints**: 
  - Mobile: < 600px
  - Tablet: 600px - 1024px
  - Desktop: > 1024px
- **Grid**: 4 colunas (mobile), 8 colunas (tablet)
- **Margins**: 16px (mobile), 24px (tablet)

### 4.2 Adaptações Específicas

#### Hero Section → Mobile
- Layout vertical (Column)
- Imagem reduzida ou como background
- CTAs empilhados verticalmente
- Texto otimizado para leitura mobile

#### Cards Grid → Mobile
- 1 coluna em telas pequenas
- 2 colunas em telas médias
- Scroll vertical suave
- Loading states visíveis

#### Forms → Mobile
- Campos full-width
- Labels flutuantes
- Validação em tempo real
- Keyboard types apropriados
- Submit button sempre visível

### 4.3 Microinterações

#### Feedback Visual
- **Tap**: Ripple effect + scale (0.95)
- **Loading**: Skeleton screens + spinners
- **Success**: Checkmark animation + green color
- **Error**: Shake animation + red color

#### Transições
- **Page**: Slide horizontal (300ms)
- **Modal**: Slide up + fade (250ms)
- **Cards**: Fade in + slide up (200ms)
- **Buttons**: Scale + color (150ms)

---

## 5. Plano de Implementação por Fases

### Fase 1: Fundação (Semana 1-2)

#### Objetivos
- Setup do projeto Flutter
- Configuração do tema e cores
- Componentes base

#### Entregáveis
- [x] Projeto Flutter criado
- [ ] Sistema de cores implementado
- [ ] Tema base configurado
- [ ] Componentes básicos (Button, Card, TextField)
- [ ] Navegação principal (BottomNavigationBar)

#### Tarefas
1. Configurar `AppColors` e `AppTheme`
2. Implementar componentes base
3. Criar estrutura de navegação
4. Setup de fontes (Google Fonts)
5. Configurar animações básicas

### Fase 2: Telas Principais (Semana 3-4)

#### Objetivos
- Implementar telas core
- Manter identidade visual
- Navegação funcional

#### Entregáveis
- [ ] Tela Home (Hero + Services)
- [ ] Tela de Serviços
- [ ] Tela de Login/Registro
- [ ] Tela de Perfil
- [ ] Integração com Supabase

#### Tarefas
1. Migrar Hero Section para mobile
2. Implementar grid de serviços
3. Criar formulários de auth
4. Configurar navegação entre telas
5. Integrar com backend Supabase

### Fase 3: Funcionalidades Avançadas (Semana 5-6)

#### Objetivos
- Recursos específicos mobile
- Otimizações de performance
- Testes e refinamentos

#### Entregáveis
- [ ] Sistema de agendamento
- [ ] Carrinho de compras
- [ ] Notificações push
- [ ] Câmera/galeria integration
- [ ] Geolocalização

#### Tarefas
1. Implementar booking system
2. Criar carrinho de compras
3. Setup Firebase para push notifications
4. Integrar câmera para fotos de pets
5. Adicionar mapas/localização

### Fase 4: Polimento e Deploy (Semana 7-8)

#### Objetivos
- Refinamentos finais
- Testes extensivos
- Deploy nas stores

#### Entregáveis
- [ ] App testado e otimizado
- [ ] Documentação completa
- [ ] Deploy na Play Store
- [ ] Deploy na App Store
- [ ] Monitoramento configurado

#### Tarefas
1. Testes em dispositivos reais
2. Otimizações de performance
3. Setup de analytics
4. Preparação para stores
5. Deploy e monitoramento

---

## 6. Checklist de Consistência Visual

### ✅ Cores
- [ ] Paleta de cores idêntica à web
- [ ] Gradientes e opacidades corretas
- [ ] Cores de status consistentes
- [ ] Modo escuro (opcional)

### ✅ Tipografia
- [ ] Fontes Inter e Playfair Display
- [ ] Hierarquia tipográfica mantida
- [ ] Tamanhos adaptados para mobile
- [ ] Line heights otimizados

### ✅ Componentes
- [ ] Border radius consistente
- [ ] Shadows e elevações similares
- [ ] Ícones do mesmo estilo
- [ ] Espaçamentos proporcionais

### ✅ Animações
- [ ] Durações similares (200-300ms)
- [ ] Easing curves suaves
- [ ] Microinterações consistentes
- [ ] Loading states uniformes

### ✅ Layout
- [ ] Grid system adaptado
- [ ] Margins e paddings proporcionais
- [ ] Responsividade mantida
- [ ] Touch targets adequados

---

## 7. Recursos e Dependências

### Dependências Flutter
```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # UI e Tema
  google_fonts: ^6.1.0
  flutter_svg: ^2.0.9
  
  # Navegação
  go_router: ^12.1.3
  
  # Estado
  provider: ^6.1.1
  
  # Backend
  supabase_flutter: ^2.0.0
  
  # Animações
  animations: ^2.0.11
  lottie: ^2.7.0
  
  # Utilitários
  cached_network_image: ^3.3.0
  image_picker: ^1.0.4
  geolocator: ^10.1.0
  
  # Push Notifications
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.9
```

### Assets
- Fontes: Inter, Playfair Display
- Ícones: Material Icons + custom SVGs
- Imagens: Otimizadas para mobile (WebP)
- Animações: Lottie files para microinterações

---

## 8. Considerações Técnicas

### Performance
- Lazy loading de imagens
- Pagination em listas longas
- Cache de dados offline
- Otimização de builds

### Acessibilidade
- Semantic labels
- Contrast ratios adequados
- Support para screen readers
- Navegação por teclado

### Testes
- Unit tests para lógica
- Widget tests para UI
- Integration tests para fluxos
- Golden tests para consistência visual

### Monitoramento
- Crashlytics para erros
- Analytics para uso
- Performance monitoring
- User feedback collection

---

**Documento criado em:** Janeiro 2024  
**Versão:** 1.0  
**Status:** Em desenvolvimento  
**Próxima revisão:** Após Fase 1