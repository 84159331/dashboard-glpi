# 📧 Trocar Email Firebase - Guia Rápido

## ✅ **Email Atual Detectado**

Você está logado como: **jadney2014@gmail.com**

---

## 🔄 **Como Trocar para Outro Email**

### **Passo 1: Fazer Logout**

```powershell
firebase logout
```

### **Passo 2: Login com Novo Email**

```powershell
firebase login
```

Isso abrirá o navegador. Faça login com o **novo email** desejado.

### **Passo 3: Verificar Nova Conta**

```powershell
firebase login:list
```

### **Passo 4: Listar Projetos do Novo Email**

```powershell
firebase projects:list
```

### **Passo 5: Selecionar Projeto**

Se você já tem um projeto no novo email:

```powershell
firebase use seu-projeto-id
```

OU criar um novo projeto:

```powershell
firebase projects:create nome-do-projeto
```

Depois configure no `.firebaserc`:

```json
{
  "projects": {
    "default": "nome-do-projeto"
  }
}
```

---

## 🚀 **Depois da Troca - Fazer Deploy**

```powershell
npm run build
firebase deploy --only hosting
```

---

## ⚠️ **Importante**

Se o projeto já existe em outro email, você precisa:

1. **Opção A:** Pedir para o dono do projeto adicionar seu novo email como colaborador
   - Acesse: https://console.firebase.google.com/
   - Configurações → Usuários e permissões → Adicionar membro

2. **Opção B:** Criar um novo projeto no novo email
   - Use: `firebase projects:create novo-projeto-id`

3. **Opção C:** Usar um projeto existente do novo email

---

## 📝 **Comandos Rápidos**

```powershell
# 1. Logout
firebase logout

# 2. Login novo email
firebase login

# 3. Ver projetos
firebase projects:list

# 4. Selecionar projeto
firebase use projeto-id

# 5. Deploy
npm run deploy
```

---

**Pronto! Siga os passos acima para trocar de email.** 📧

