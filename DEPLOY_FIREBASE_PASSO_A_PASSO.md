# 🚀 Deploy Firebase - Passo a Passo

## ⚡ **Deploy Rápido (--only hosting)**

Se você já tem tudo configurado, execute:

```bash
npm run build
firebase deploy --only hosting
```

---

## 📋 **Configuração Completa (Primeira Vez)**

### **Passo 1: Instalar Firebase CLI**

```powershell
npm install -g firebase-tools
```

### **Passo 2: Fazer Login**

```powershell
firebase login
```

Isso abrirá o navegador. Faça login com sua conta Google.

### **Passo 3: Listar Seus Projetos Firebase**

```powershell
firebase projects:list
```

### **Passo 4: Configurar Projeto**

Edite o arquivo `.firebaserc` e substitua `your-project-id` pelo ID do seu projeto:

```json
{
  "projects": {
    "default": "seu-projeto-id-aqui"
  }
}
```

**OU** use o comando:

```powershell
firebase use --add
```

Isso vai:
1. Listar seus projetos
2. Você seleciona o projeto
3. Define um alias (pressione Enter para "default")
4. Atualiza o `.firebaserc` automaticamente

### **Passo 5: Fazer Build**

```powershell
npm run build
```

Isso cria a pasta `dist/` com os arquivos prontos para produção.

### **Passo 6: Deploy (Apenas Hosting)**

```powershell
firebase deploy --only hosting
```

---

## ✅ **Scripts Disponíveis**

Já foram adicionados ao `package.json`:

```bash
npm run build          # Build da aplicação
npm run deploy         # Build + Deploy completo
npm run deploy:preview # Build + Deploy em canal preview
```

---

## 🔍 **Verificar Antes do Deploy**

### **1. Testar Build Localmente:**

```powershell
npm run build
npm run preview
```

Isso vai:
- Gerar a pasta `dist/`
- Iniciar servidor local em `http://localhost:4173`
- Você pode testar tudo antes de fazer deploy

### **2. Verificar Configuração Firebase:**

```powershell
firebase use
```

Deve mostrar o projeto selecionado.

---

## 🚀 **Deploy Completo**

### **Opção 1: Comando Único**

```powershell
npm run deploy
```

Isso vai:
1. Fazer build
2. Fazer deploy no Firebase

### **Opção 2: Passo a Passo**

```powershell
# 1. Build
npm run build

# 2. Deploy apenas hosting
firebase deploy --only hosting
```

---

## 🌐 **URL Após Deploy**

Sua aplicação estará disponível em:

- `https://seu-projeto-id.web.app`
- `https://seu-projeto-id.firebaseapp.com`

---

## 🔧 **Configurações Criadas**

✅ **firebase.json** - Configurado para:
- Servir arquivos da pasta `dist/`
- SPA (Single Page Application) com redirects
- Headers de segurança
- Cache otimizado

✅ **package.json** - Scripts adicionados:
- `npm run deploy` - Build + Deploy
- `npm run deploy:preview` - Deploy em canal

✅ **.gitignore** - Criado para ignorar:
- `node_modules/`
- `dist/`
- Arquivos do Firebase

---

## 📝 **Checklist de Deploy**

- [ ] Firebase CLI instalado (`firebase --version`)
- [ ] Login realizado (`firebase login`)
- [ ] Projeto configurado no `.firebaserc`
- [ ] Build testado localmente (`npm run preview`)
- [ ] Deploy realizado (`firebase deploy --only hosting`)

---

## 🆘 **Solução de Problemas**

### **Erro: "firebase: command not found"**

```powershell
npm install -g firebase-tools
```

### **Erro: "Project not found"**

Verifique o ID do projeto:
```powershell
firebase projects:list
firebase use seu-projeto-id
```

### **Erro: "Permission denied"**

```powershell
firebase login --reauth
```

### **Erro no Build**

Teste localmente primeiro:
```powershell
npm run build
```

Verifique se a pasta `dist/` foi criada.

---

## 🎯 **Comandos Úteis**

```powershell
# Ver projeto atual
firebase use

# Listar projetos
firebase projects:list

# Ver status do deploy
firebase hosting:sites:list

# Deploy em canal de preview
firebase hosting:channel:deploy preview

# Ver logs
firebase hosting:channel:list
```

---

## ✅ **Próximos Passos**

1. ✅ Edite `.firebaserc` com seu projeto ID
2. ✅ Execute `firebase login`
3. ✅ Execute `npm run build` (teste)
4. ✅ Execute `firebase deploy --only hosting`

---

**Tudo pronto para deploy!** 🚀

