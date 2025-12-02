# 🚀 Deploy Automático - Git Push + Firebase Hosting

## ✅ **Sistema Configurado**

Agora você tem scripts automatizados que fazem tudo de uma vez:
1. ✅ Git add, commit e push
2. ✅ Build da aplicação
3. ✅ Deploy no Firebase Hosting

---

## 🎯 **Como Usar**

### **Método 1: Script PowerShell (Windows - RECOMENDADO)**

```powershell
# Deploy automático com mensagem padrão
.\deploy.ps1

# Deploy automático com mensagem personalizada
.\deploy.ps1 "Atualização: Nova funcionalidade X"
```

### **Método 2: Script NPM**

```powershell
# Deploy completo (git + build + firebase)
npm run deploy:full

# OU
npm run deploy:auto

# OU (versão mais simples)
npm run git:deploy
```

### **Método 3: Script Bash (Linux/Mac)**

```bash
# Dar permissão de execução (primeira vez)
chmod +x deploy.sh

# Executar
./deploy.sh "Sua mensagem de commit"
```

---

## 📋 **O Que os Scripts Fazem**

### **1. Verifica Mudanças no Git**
- Verifica se há arquivos modificados
- Se não houver, pula direto para build

### **2. Git Push (se houver mudanças)**
- `git add .` - Adiciona todos os arquivos
- `git commit -m "mensagem"` - Faz commit
- `git push origin main` - Faz push

### **3. Build da Aplicação**
- `npm run build` - Gera a pasta `dist/`
- Verifica se o build foi bem-sucedido

### **4. Deploy no Firebase**
- `firebase deploy --only hosting` - Faz deploy
- Mostra a URL da aplicação ao final

---

## 🚀 **Exemplos de Uso**

### **Deploy Rápido (mensagem automática)**

```powershell
npm run deploy:full
```

### **Deploy com Mensagem Personalizada**

```powershell
.\deploy.ps1 "Correção de bugs na análise individual"
```

### **Deploy Manual (passo a passo)**

```powershell
# 1. Git
git add .
git commit -m "Atualização"
git push

# 2. Build
npm run build

# 3. Deploy
firebase deploy --only hosting
```

---

## ⚙️ **Scripts Disponíveis no package.json**

```json
{
  "scripts": {
    "deploy": "npm run build && firebase deploy --only hosting",
    "deploy:full": "powershell -ExecutionPolicy Bypass -File ./deploy.ps1",
    "deploy:auto": "powershell -ExecutionPolicy Bypass -File ./deploy.ps1",
    "git:deploy": "git add . && git commit -m \"Deploy automático\" && git push && npm run build && firebase deploy --only hosting"
  }
}
```

---

## 📝 **Checklist Antes do Deploy**

- [ ] Firebase configurado (`.firebaserc` com projeto ID)
- [ ] Logado no Firebase (`firebase login`)
- [ ] Repositório Git configurado
- [ ] Build funciona localmente (`npm run build`)

---

## 🔧 **Configuração Inicial (Uma Vez)**

### **1. Configurar Firebase**

Edite `.firebaserc`:
```json
{
  "projects": {
    "default": "seu-projeto-id"
  }
}
```

### **2. Fazer Login no Firebase**

```powershell
firebase login
```

### **3. Testar Build**

```powershell
npm run build
```

Se tudo funcionar, você está pronto!

---

## 🆘 **Solução de Problemas**

### **Erro: "Execution Policy"**

Se o PowerShell bloquear o script:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Erro: "Git push failed"**

Verifique se:
- Você está na branch correta
- Tem permissões no repositório
- O remote está configurado: `git remote -v`

### **Erro: "Build failed"**

Teste o build manualmente:
```powershell
npm run build
```

### **Erro: "Firebase deploy failed"**

Verifique:
- Login: `firebase login`
- Projeto: `firebase use`
- Projeto existe: `firebase projects:list`

---

## ✅ **Fluxo Completo**

```
1. Você faz alterações no código
2. Executa: npm run deploy:full
3. Script faz:
   ├─ Git add .
   ├─ Git commit
   ├─ Git push
   ├─ npm run build
   └─ firebase deploy --only hosting
4. Aplicação disponível na web! 🎉
```

---

## 🌐 **URL Após Deploy**

Após o deploy, sua aplicação estará em:
- `https://seu-projeto-id.web.app`
- `https://seu-projeto-id.firebaseapp.com`

---

## 📚 **Arquivos Criados**

✅ `deploy.ps1` - Script PowerShell (Windows)
✅ `deploy.sh` - Script Bash (Linux/Mac)
✅ Scripts adicionados ao `package.json`

---

**Tudo pronto para deploy automático!** 🚀

Execute: `npm run deploy:full`

