# Dashboard de Chamados TI - GLPI

Um dashboard interativo e especializado para análise de tickets do GLPI, desenvolvido para analistas de TI que precisam organizar e avaliar seus chamados de suporte.

## 🚀 Funcionalidades Principais

### 📊 **Visualizações Múltiplas**
- **Estatísticas**: KPIs principais em cards visuais
- **Gráficos**: Visualizações interativas (status, prioridade, categorias, timeline, SLA)
- **Tabela**: Lista detalhada com busca e filtros avançados
- **Análise por Categoria**: Visualização específica por categoria com avaliação

### 🔍 **Análise Detalhada de Chamados**
- **Visualização Completa**: Modal detalhado com todas as informações do ticket
- **Métricas de Tempo**: Tempo de espera, atribuição e solução
- **Informações de SLA**: Compliance e excedidos
- **Soluções Implementadas**: Visualização das soluções aplicadas

### ⭐ **Sistema de Avaliação**
- **Avaliação Positiva/Negativa**: Botões para avaliar atendimentos
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
- **Tailwind CSS**: Framework de estilização
- **Lucide React**: Ícones modernos

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
- **Estatísticas**: Visão geral dos KPIs
- **Gráficos**: Escolha entre diferentes tipos de análise
- **Tabela**: Lista completa com filtros
- **Por Categoria**: Análise específica por categoria

### 4. **Analisar Chamados**
- Clique em "Ver" na tabela ou "Analisar" na análise por categoria
- Visualize todos os detalhes do chamado
- Avalie a solução (positiva ou negativamente)
- Adicione comentários opcionais

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