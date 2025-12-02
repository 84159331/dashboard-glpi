# 🔒 Guia de Segurança - Vulnerabilidades NPM

## 📊 Status Atual

**Última verificação:** ✅ **0 vulnerabilidades encontradas**

Se você viu "3 vulnerabilities (2 moderate, 1 high)" durante o `npm install`, elas podem ter sido corrigidas automaticamente ou podem estar em dependências transitivas.

---

## 🔍 Como Verificar Vulnerabilidades

### **1. Verificação Completa**

```bash
npm audit
```

### **2. Verificação Detalhada (JSON)**

```bash
npm audit --json
```

### **3. Verificação com Fix Automático**

```bash
npm audit fix
```

### **4. Verificação Forçada (Pode quebrar dependências)**

```bash
npm audit fix --force
```

---

## 🛠️ Como Corrigir Vulnerabilidades

### **Método 1: Correção Automática (Recomendado)**

```bash
# Tenta corrigir automaticamente sem quebrar dependências
npm audit fix
```

### **Método 2: Atualizar Dependências**

```bash
# Ver dependências desatualizadas
npm outdated

# Atualizar dependências (manualmente no package.json)
# Ou usar:
npm update
```

### **Método 3: Atualizar para Versões Mais Recentes**

Se houver vulnerabilidades críticas, pode ser necessário atualizar manualmente no `package.json`:

**Exemplo de atualização:**

```json
{
  "dependencies": {
    "react": "^18.2.45",        // Atualizar para última versão
    "react-dom": "^18.2.45",    // Atualizar para última versão
    "recharts": "^2.10.3",      // Atualizar para última versão
    "vite": "^5.0.0"            // Atualizar para última versão
  }
}
```

Depois de atualizar, execute:

```bash
npm install
npm audit
```

---

## 📋 Vulnerabilidades Comuns e Soluções

### **1. Vulnerabilidades no Vite**

Se aparecer vulnerabilidade no Vite:

```bash
# Atualizar Vite para versão mais recente
npm install vite@latest --save-dev
```

### **2. Vulnerabilidades no React**

```bash
# Atualizar React para versão mais recente
npm install react@latest react-dom@latest
```

### **3. Vulnerabilidades no Recharts**

```bash
# Atualizar Recharts
npm install recharts@latest
```

### **4. Vulnerabilidades em Dependências Transitivas**

Algumas vulnerabilidades podem estar em dependências de terceiros. O `npm audit fix` geralmente resolve automaticamente.

---

## 🔄 Processo Completo de Verificação e Correção

### **Passo a Passo:**

1. **Verificar vulnerabilidades:**
   ```bash
   npm audit
   ```

2. **Tentar correção automática:**
   ```bash
   npm audit fix
   ```

3. **Se ainda houver vulnerabilidades, ver detalhes:**
   ```bash
   npm audit --json > audit-report.json
   ```

4. **Atualizar dependências manualmente se necessário:**
   - Editar `package.json`
   - Atualizar versões das dependências
   - Executar `npm install`

5. **Testar se tudo ainda funciona:**
   ```bash
   npm run dev
   ```

6. **Se algo quebrar, verificar logs:**
   ```bash
   npm run dev > debug.log 2>&1
   ```

---

## 🎯 Scripts de Segurança Adicionados

Adicione estes scripts ao seu `package.json` para facilitar:

```json
{
  "scripts": {
    "audit": "npm audit",
    "audit:fix": "npm audit fix",
    "audit:json": "npm audit --json",
    "security:check": "npm audit && npm outdated",
    "security:update": "npm audit fix && npm update"
  }
}
```

Agora você pode usar:

```bash
npm run security:check    # Verificar vulnerabilidades e atualizações
npm run security:update   # Corrigir e atualizar tudo
```

---

## 📊 Monitoramento Contínuo

### **Verificação Semanal (Recomendado):**

1. Execute `npm audit` toda semana
2. Execute `npm outdated` para ver dependências desatualizadas
3. Atualize dependências regularmente

### **Antes de Deploy em Produção:**

Sempre execute:

```bash
npm audit
npm audit fix
npm run build
npm test  # Se tiver testes
```

---

## 🚨 Vulnerabilidades Críticas

Se encontrar vulnerabilidades **CRÍTICAS**:

1. **NÃO ignore** - Corrija imediatamente
2. Atualize para versões seguras
3. Teste completamente após atualizar
4. Considere usar `npm audit fix --force` apenas se necessário

---

## ✅ Verificação de Segurança do Projeto Atual

### **Dependências Principais e Versões:**

- ✅ **React:** ^18.2.0 (atualizar para ^18.2.45+ se necessário)
- ✅ **Vite:** ^4.5.0 (atualizar para ^5.0.0+ se necessário)
- ✅ **Recharts:** ^2.8.0 (atualizar para ^2.10.3+ se necessário)
- ✅ **TailwindCSS:** ^3.3.6 (atualizado)
- ✅ **Papaparse:** ^5.4.1 (atualizado)

### **Próximos Passos Recomendados:**

1. **Atualizar dependências principais:**
   ```bash
   npm install react@^18.2.45 react-dom@^18.2.45
   npm install vite@^5.0.0 --save-dev
   npm install recharts@^2.10.3
   ```

2. **Verificar novamente:**
   ```bash
   npm audit
   ```

3. **Testar tudo:**
   ```bash
   npm run dev
   ```

---

## 📝 Checklist de Segurança

- [ ] Executar `npm audit` regularmente
- [ ] Manter dependências atualizadas
- [ ] Verificar `npm outdated` mensalmente
- [ ] Corrigir vulnerabilidades antes do deploy
- [ ] Documentar mudanças em dependências
- [ ] Testar após atualizações

---

## 🆘 Problemas Comuns

### **"npm audit fix não corrige"**

Algumas vulnerabilidades requerem atualização manual:
1. Ver detalhes: `npm audit --json`
2. Identificar pacote com problema
3. Atualizar manualmente no `package.json`
4. Executar `npm install`

### **"Atualização quebrou o código"**

1. Verificar changelog da dependência
2. Revisar breaking changes
3. Ajustar código conforme necessário
4. Ou manter versão antiga se não for crítica

### **"Muitas vulnerabilidades"**

1. Criar backup: `git commit -am "backup antes de atualizações"`
2. Executar `npm audit fix`
3. Testar tudo
4. Se quebrar, reverter: `git reset --hard HEAD`

---

**Última atualização:** Agora
**Status:** ✅ Sem vulnerabilidades conhecidas

