# Dashboard CSV

Um dashboard interativo e moderno para visualização de dados CSV, construído com React, Recharts e Tailwind CSS.

## 🚀 Funcionalidades

- **Upload de CSV**: Arraste e solte ou selecione arquivos CSV
- **Visualizações Interativas**: Gráficos de barras, linha, pizza e dispersão
- **Tabela de Dados**: Visualização em formato de tabela com busca e ordenação
- **Estatísticas**: Cards com métricas resumidas dos dados
- **Seleção de Colunas**: Escolha quais colunas visualizar
- **Exportação**: Exporte os dados processados em CSV
- **Interface Responsiva**: Funciona em desktop e mobile

## 🛠️ Tecnologias

- **React 18** - Framework principal
- **Vite** - Build tool e dev server
- **Recharts** - Biblioteca de gráficos
- **PapaParse** - Parser de CSV
- **Tailwind CSS** - Framework de estilização
- **Lucide React** - Ícones

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd dashboard
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no navegador

## 📊 Como Usar

### 1. Upload do Arquivo CSV
- Arraste e solte um arquivo CSV na área indicada
- Ou clique para selecionar um arquivo
- O sistema detectará automaticamente os tipos de dados

### 2. Visualização dos Dados
- **Cards de Estatísticas**: Veja métricas resumidas no topo
- **Gráficos**: Escolha entre diferentes tipos de visualização
- **Tabela**: Visualize os dados em formato tabular

### 3. Configurações
- **Tipo de Gráfico**: Barras, linha, pizza ou dispersão
- **Seleção de Colunas**: Escolha quais colunas incluir
- **Busca e Ordenação**: Na visualização em tabela

### 4. Exportação
- Clique em "Exportar CSV" para baixar os dados processados

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── CSVUploader.jsx      # Upload e processamento de CSV
│   ├── Dashboard.jsx        # Componente principal do dashboard
│   ├── ChartContainer.jsx   # Renderização de gráficos
│   ├── DataTable.jsx        # Tabela de dados
│   ├── StatsCards.jsx       # Cards de estatísticas
│   ├── ColumnSelector.jsx   # Seletor de colunas
│   └── Header.jsx           # Cabeçalho da aplicação
├── App.jsx                  # Componente raiz
├── main.jsx                 # Ponto de entrada
└── index.css               # Estilos globais
```

## 📋 Formato CSV Suportado

O sistema funciona melhor com arquivos CSV que tenham:
- **Cabeçalho**: Primeira linha com nomes das colunas
- **Dados Consistentes**: Valores do mesmo tipo em cada coluna
- **Valores Numéricos**: Para gráficos quantitativos

### Exemplo de CSV:
```csv
Nome,Idade,Cidade,Salário
João,25,São Paulo,5000
Maria,30,Rio de Janeiro,6000
Pedro,28,Belo Horizonte,4500
```

## 🎨 Tipos de Gráficos

### Gráfico de Barras
- Ideal para comparar categorias
- Funciona bem com dados categóricos e numéricos

### Gráfico de Linha
- Perfeito para mostrar tendências
- Melhor com dados sequenciais

### Gráfico de Pizza
- Mostra proporções e distribuições
- Funciona com dados categóricos

### Gráfico de Dispersão
- Analisa correlações entre variáveis
- Requer duas colunas numéricas

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Visualiza o build de produção

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🐛 Problemas Conhecidos

- Arquivos CSV muito grandes podem causar lentidão
- Alguns caracteres especiais podem não ser exibidos corretamente
- Gráficos de dispersão requerem pelo menos 2 colunas numéricas

## 📞 Suporte

Se você encontrar algum problema ou tiver sugestões, abra uma issue no repositório. 