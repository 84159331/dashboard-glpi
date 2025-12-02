# 📧 Trocar Email Firebase - Comandos Rápidos

## ✅ **Email Atual**

Você está logado como: **jadney2014@gmail.com**

---

## 🔄 **Trocar para Outro Email - 3 Passos**

### **1. Fazer Logout**

```powershell
firebase logout
```

### **2. Login com Novo Email**

```powershell
firebase login
```

**⚠️ IMPORTANTE:** 
- Isso abrirá o navegador
- Faça login com o **NOVO EMAIL** que você quer usar
- Permita o acesso ao Firebase

### **3. Verificar e Configurar Projeto**

```powershell
# Ver projetos do novo email
firebase projects:list

# Selecionar projeto (se já existir)
firebase use seu-projeto-id

# OU criar novo projeto
firebase projects:create nome-do-projeto
```

---

## 📋 **Checklist Completo**

- [ ] `firebase logout` - Deslogar da conta atual
- [ ] `firebase login` - Login com NOVO email
- [ ] `firebase projects:list` - Ver projetos disponíveis
- [ ] `firebase use projeto-id` - Selecionar projeto OU
- [ ] `firebase projects:create novo-projeto` - Criar projeto novo
- [ ] Atualizar `.firebaserc` com o ID do projeto (se mudou)
- [ ] `firebase deploy --only hosting` - Fazer deploy

---

## 🚀 **Deploy Após Trocar Email**

```powershell
npm run build
firebase deploy --only hosting
```

---

**Execute os 3 passos acima para trocar de email!** 📧

