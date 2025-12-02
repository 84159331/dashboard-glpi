# 🚀 Deploy Automático - Resumo Rápido

## ⚡ **Deploy com Um Comando**

```powershell
npm run deploy:full
```

Isso vai automaticamente:
1. ✅ Fazer git add, commit e push
2. ✅ Fazer build da aplicação
3. ✅ Fazer deploy no Firebase

---

## 📋 **Antes do Primeiro Deploy**

### **1. Configurar Firebase**

Edite `.firebaserc`:
```json
{
  "projects": {
    "default": "seu-projeto-id"
  }
}
```

### **2. Fazer Login**

```powershell
firebase login
```

### **3. Pronto!**

```powershell
npm run deploy:full
```

---

## 🎯 **Comandos Disponíveis**

```powershell
# Deploy completo (git + build + firebase)
npm run deploy:full

# Deploy apenas Firebase (sem git)
npm run deploy

# Deploy com mensagem personalizada
.\deploy.ps1 "Sua mensagem aqui"
```

---

## 🌐 **URL Após Deploy**

- `https://seu-projeto-id.web.app`
- `https://seu-projeto-id.firebaseapp.com`

---

**É só isso! Execute `npm run deploy:full` e pronto!** 🎉

