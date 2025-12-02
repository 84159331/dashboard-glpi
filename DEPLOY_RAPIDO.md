# ⚡ Deploy Rápido - Git + Firebase

## 🚀 **Um Comando para Fazer Tudo**

```powershell
npm run deploy:full
```

Isso faz automaticamente:
1. ✅ Git add, commit e push
2. ✅ Build da aplicação
3. ✅ Deploy no Firebase Hosting

---

## 📋 **Configuração Inicial (Uma Vez)**

### **1. Editar Firebase Project ID**

Edite o arquivo `.firebaserc` e coloque seu projeto ID:

```json
{
  "projects": {
    "default": "seu-projeto-id-aqui"
  }
}
```

### **2. Fazer Login no Firebase**

```powershell
firebase login
```

### **3. Pronto!**

Agora é só executar:

```powershell
npm run deploy:full
```

---

## 🎯 **Comandos Disponíveis**

| Comando | O que faz |
|---------|-----------|
| `npm run deploy:full` | Git push + Build + Deploy (RECOMENDADO) |
| `npm run deploy` | Apenas Build + Deploy (sem git) |
| `.\deploy.ps1 "mensagem"` | Deploy com mensagem personalizada |

---

## 🌐 **URL da Aplicação**

Após o deploy:
- `https://seu-projeto-id.web.app`
- `https://seu-projeto-id.firebaseapp.com`

---

## ✅ **Pronto!**

Execute agora:

```powershell
npm run deploy:full
```

E sua aplicação estará no ar! 🎉

