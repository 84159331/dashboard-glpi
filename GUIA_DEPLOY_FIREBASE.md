# 🚀 Guia de Deploy - Firebase Hosting

## 📋 **Configuração Inicial**

### **Passo 1: Instalar Firebase CLI**

```bash
npm install -g firebase-tools
```

### **Passo 2: Fazer Login no Firebase**

```bash
firebase login
```

Isso abrirá o navegador para você fazer login com sua conta Google.

---

## 🔧 **Configuração do Projeto**

### **Passo 3: Inicializar Firebase (Se necessário)**

Se ainda não tiver um projeto Firebase:

```bash
firebase init hosting
```

Ou se já tiver um projeto:

```bash
firebase use --add
```

Isso pedirá para você:
- Selecionar ou criar um projeto Firebase
- Configurar o diretório público (use `dist`)
- Configurar como SPA (responder sim)
- Configurar automaticamente como build (responder não)

---

## 📝 **Arquivos Criados**

✅ `firebase.json` - Configuração do Firebase
✅ `.firebaserc` - ID do projeto (você precisa editar)

---

## ⚙️ **Configuração do .firebaserc**

Edite o arquivo `.firebaserc` e substitua `your-project-id` pelo ID do seu projeto Firebase:

```json
{
  "projects": {
    "default": "seu-projeto-id-aqui"
  }
}
```

---

## 🏗️ **Scripts de Build e Deploy**

Adicione estes scripts ao `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "deploy": "npm run build && firebase deploy --only hosting",
    "deploy:preview": "npm run build && firebase hosting:channel:deploy preview"
  }
}
```

---

## 🚀 **Como Fazer Deploy**

### **Método 1: Deploy Completo**

```bash
npm run build
firebase deploy --only hosting
```

### **Método 2: Usando Script**

```bash
npm run deploy
```

### **Método 3: Deploy Apenas Hosting (--only)**

```bash
npm run build
firebase deploy --only hosting
```

---

## 🔍 **Verificar Build Localmente**

Antes de fazer deploy, teste localmente:

```bash
npm run build
npm run preview
```

Isso vai gerar a pasta `dist` e você pode testar localmente em `http://localhost:4173`

---

## ✅ **Comandos Úteis**

### **Ver projetos Firebase:**
```bash
firebase projects:list
```

### **Selecionar projeto:**
```bash
firebase use seu-projeto-id
```

### **Ver configuração atual:**
```bash
firebase use
```

### **Ver deploy:**
```bash
firebase hosting:sites:list
```

### **Fazer deploy em canal de preview:**
```bash
firebase hosting:channel:deploy preview
```

---

## 📦 **Estrutura Após Build**

Depois do `npm run build`, será criada a pasta `dist/` com:
- `index.html`
- `assets/` (JS, CSS, imagens)
- Outros arquivos estáticos

O Firebase Hosting servirá esses arquivos.

---

## 🔒 **Configurações de Segurança**

O `firebase.json` já inclui headers de segurança:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Cache-Control para assets

---

## 🌐 **URL Após Deploy**

Após o deploy, sua aplicação estará disponível em:
- `https://seu-projeto-id.web.app`
- `https://seu-projeto-id.firebaseapp.com`

Você também pode configurar um domínio personalizado no console do Firebase.

---

## 📝 **Próximos Passos**

1. ✅ Instalar Firebase CLI
2. ✅ Fazer login
3. ✅ Configurar projeto no `.firebaserc`
4. ✅ Fazer build
5. ✅ Fazer deploy

---

## 🆘 **Troubleshooting**

### **Erro: "Project not found"**
- Verifique o ID do projeto no `.firebaserc`
- Liste seus projetos: `firebase projects:list`

### **Erro: "Build failed"**
- Teste o build localmente primeiro: `npm run build`
- Verifique se há erros no console

### **Erro: "Permission denied"**
- Verifique se você tem permissão no projeto Firebase
- Faça login novamente: `firebase login`

---

**Pronto para deploy!** 🚀

