# Dashboard de Chamados TI - GLPI

Um dashboard interativo e especializado para análise de tickets do GLPI, desenvolvido para analistas de TI que precisam organizar e avaliar seus chamados de suporte.

## 🎨 **Melhorias Gráficas e Estéticas Implementadas**

### ✨ **Design System Moderno**
- **Sistema de Temas**: Alternância entre modo claro e escuro com transições suaves
- **Paleta de Cores Expandida**: Cores primárias, secundárias, de sucesso, aviso, perigo e acento
- **Tipografia Moderna**: Fontes Inter, Poppins e JetBrains Mono do Google Fonts
- **Glassmorphism**: Efeitos de vidro com backdrop-blur e transparências
- **Gradientes Dinâmicos**: Gradientes personalizados para diferentes estados e componentes

### 🎭 **Animações e Transições**
- **Animações de Entrada**: fade-in, slide-up, scale-in, bounce-in
- **Transições Suaves**: Todas as interações com duração de 300ms
- **Efeitos Hover**: Scale, glow, lift e outras transformações
- **Loading States**: Spinners personalizados com múltiplas variantes
- **Micro-interações**: Feedback visual para todas as ações do usuário

### 🎯 **Componentes Modernos**

#### **Cards Inteligentes**
- Gradientes específicos por tipo (primary, success, warning, danger, accent)
- Sombras dinâmicas (soft, medium, large, glow)
- Indicadores de status em tempo real
- Barras de progresso integradas
- Animações de entrada escalonadas

#### **Botões Avançados**
- Gradientes com hover states
- Transformações scale no hover e active
- Variantes para diferentes ações (primary, secondary, success, warning, danger)
- Botões flutuantes com efeitos de brilho

#### **Sistema de Notificações**
- Notificações toast com diferentes tipos (success, warning, error, info)
- Animações de entrada e saída
- Barras de progresso para duração
- Posicionamento inteligente
- Backdrop blur e glassmorphism

#### **Tooltips Inteligentes**
- Posicionamento automático (top, bottom, left, right)
- Prevenção de saída da tela
- Animações suaves
- Variantes específicas (InfoTooltip, StatusTooltip)
- Setas direcionais

#### **Barras de Progresso**
- Múltiplas variantes (linear, circular, steps)
- Animações de preenchimento
- Efeitos de brilho
- Indicadores de progresso
- Tamanhos diferentes (sm, md, lg, xl)

### 🎨 **Melhorias Visuais Específicas**

#### **Header Modernizado**
- Logo com gradiente e indicador de status
- Indicadores de sistema online
- Relógio em tempo real
- Botões de ação com hover effects
- Barra de progresso sutil

#### **Upload de Arquivos**
- Área de drag & drop com feedback visual
- Animações de loading personalizadas
- Cards informativos com gradientes
- Instruções visuais organizadas
- Estados de sucesso e erro melhorados

#### **Dashboard Cards**
- Indicadores de tendência (+12%, -3%, etc.)
- Barras de progresso integradas
- Status indicators animados
- Informações de última atualização
- Efeitos de hover com glow

### 🌈 **Sistema de Cores Inteligente**

#### **Cores por Status**
- **Aberto**: Amarelo com gradiente
- **Fechado**: Verde com gradiente
- **Pendente**: Azul com gradiente
- **Cancelado**: Vermelho com gradiente

#### **Cores por Prioridade**
- **Alta**: Vermelho com gradiente
- **Média**: Amarelo com gradiente
- **Baixa**: Verde com gradiente

#### **Cores por Categoria**
- Cores dinâmicas baseadas no tipo de categoria
- Gradientes únicos para cada categoria
- Contraste otimizado para legibilidade

### 📱 **Responsividade Avançada**
- Grid responsivo automático
- Breakpoints otimizados
- Componentes adaptativos
- Navegação mobile-friendly
- Touch interactions melhoradas

### ⚡ **Performance e UX**
- Lazy loading de componentes
- Animações otimizadas com CSS
- Transições suaves entre estados
- Feedback visual imediato
- Estados de loading elegantes

## 🚀 Funcionalidades Principais

### 📊 **Visualizações Múltiplas**
- **Estatísticas**: KPIs principais em cards visuais modernos
- **Gráficos**: Visualizações interativas com cores dinâmicas
- **Tabela**: Lista detalhada com busca e filtros avançados
- **Análise por Categoria**: Visualização específica com avaliação
- **Avaliações**: Sistema completo de feedback

### 🔍 **Análise Detalhada de Chamados**
- **Visualização Completa**: Modal detalhado com glassmorphism
- **Métricas de Tempo**: Tempo de espera, atribuição e solução
- **Informações de SLA**: Compliance e excedidos com indicadores visuais
- **Soluções Implementadas**: Visualização das soluções aplicadas

### ⭐ **Sistema de Avaliação**
- **Avaliação Positiva/Negativa**: Botões modernos com feedback
- **Comentários Opcionais**: Campo para feedback detalhado
- **Armazenamento Local**: Avaliações salvas no navegador
- **Histórico de Avaliações**: Rastreamento das avaliações realizadas

### 📈 **Métricas Especializadas**
- Tempo médio de resolução
- Taxa de resolução por categoria
- Compliance com SLAs
- Distribuição de prioridades
- Evolução temporal dos chamados

## 🛠️ Tecnologias Utilizadas

- **React 18**: Framework principal
- **Vite**: Build tool e dev server
- **Recharts**: Biblioteca de gráficos
- **PapaParse**: Parser de CSV
- **Tailwind CSS**: Framework de estilização com configuração avançada
- **Lucide React**: Ícones modernos
- **Google Fonts**: Tipografia profissional

## 📋 Pré-requisitos

- Node.js 16+ 
- npm ou yarn

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd dashboard
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

4. **Acesse o dashboard**
```
http://localhost:3000
```

## 📁 Como Usar

### 1. **Exportar do GLPI**
- Acesse o GLPI
- Vá em "Tickets" → "Lista de tickets"
- Aplique os filtros desejados
- Clique em "Exportar" → "CSV"

### 2. **Carregar no Dashboard**
- Arraste o arquivo CSV para a área de upload
- Ou clique para selecionar o arquivo
- O sistema validará automaticamente se é um arquivo GLPI

### 3. **Navegar pelas Visualizações**
- **Estatísticas**: Visão geral dos KPIs com cards modernos
- **Gráficos**: Escolha entre diferentes tipos de análise
- **Tabela**: Lista completa com filtros avançados
- **Por Categoria**: Análise específica por categoria
- **Avaliações**: Resumo e histórico das avaliações

### 4. **Analisar Chamados**
- Clique em "Ver" na tabela ou "Analisar" na análise por categoria
- Visualize todos os detalhes do chamado
- Avalie a solução (positiva ou negativamente)
- Adicione comentários opcionais

## 🎨 **Personalização de Temas**

### **Alternar entre Modos**
- Clique no botão de tema no header
- O tema é salvo automaticamente no localStorage
- Transições suaves entre os modos

### **Cores Personalizáveis**
- Sistema de cores baseado em variáveis CSS
- Fácil customização via Tailwind config
- Paleta de cores consistente em todo o app

## 📊 Campos Esperados do GLPI

O dashboard espera os seguintes campos do GLPI:
- ID do ticket
- Título
- Status
- Prioridade
- Categoria
- Requerente
- Técnico responsável
- Data de abertura
- Tempo de resolução
- Solução implementada
- Informações de SLA

## 🎯 Funcionalidades de Avaliação

### **Como Avaliar**
1. Acesse os detalhes de um chamado
2. Clique em "Avaliar Positivamente" ou "Avaliar Negativamente"
3. Adicione um comentário (opcional)
4. Clique em "Enviar Avaliação"

### **Armazenamento**
- As avaliações são salvas no localStorage do navegador
- Cada avaliação inclui: rating, comentário e data
- As avaliações persistem entre sessões

## 📈 Métricas Calculadas

### **Tempo de Resolução**
- Parse automático de strings "X horas Y minutos"
- Conversão para minutos para cálculos
- Média por categoria e geral

### **SLA Compliance**
- Identificação de tickets que excedem SLA
- Percentual de compliance
- Análise por categoria

### **Taxa de Resolução**
- Chamados resolvidos vs. total
- Por categoria e geral
- Tendências temporais

## 🔧 Personalização

### **Cores e Estilos**
- Tema personalizável via Tailwind CSS
- Cores específicas para status e prioridades
- Design responsivo para diferentes dispositivos

### **Configurações**
- Número de itens por página na tabela
- Tipos de gráficos disponíveis
- Filtros padrão

## 📱 Responsividade

O dashboard é totalmente responsivo e funciona em:
- Desktop (recomendado para análise completa)
- Tablet (visualização otimizada)
- Mobile (navegação básica)

## 🔒 Segurança

- Processamento local dos dados
- Nenhum envio de dados para servidores externos
- Armazenamento local das avaliações
- Validação de arquivos CSV

## 🚀 Deploy

### **Build para Produção**
```bash
npm run build
```

### **Servir Build**
```bash
npm run preview
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Para dúvidas ou problemas:
- Verifique se o arquivo CSV está no formato correto do GLPI
- Confirme se todos os campos necessários estão presentes
- Teste com diferentes navegadores se houver problemas

---

**Desenvolvido para Analistas de TI** 🎯 

*Com design moderno, animações suaves e experiência de usuário excepcional* 