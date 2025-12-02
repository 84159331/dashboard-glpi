# 📧 Como Trocar Email no Firebase

## 🔄 **Métodos para Trocar de Email**

### **Método 1: Fazer Logout e Login Novamente (RECOMENDADO)**

#### **Passo 1: Verificar Conta Atual**

```powershell
firebase login:list
```

Isso mostra todas as contas logadas.

#### **Passo 2: Fazer Logout**

```powershell
firebase logout
```

Isso desloga de todas as contas.

#### **Passo 3: Login com Novo Email**

```powershell
firebase login
```

Isso abrirá o navegador. Faça login com o **novo email** desejado.

---

### **Método 2: Logout de Conta Específica**

Se você tem múltiplas contas:

```powershell
firebase logout:add nome-da-conta
```

---

### **Método 3: Adicionar Nova Conta (Manter Ambas)**

Se você quer ter acesso a múltiplos projetos:

```powershell
firebase login:add
```

Isso permite adicionar outra conta sem fazer logout da primeira.

---

## 📋 **Passo a Passo Completo**

### **1. Verificar Conta Atual**

```powershell
firebase login:list
```

### **2. Ver Projeto Atual**

```powershell
firebase use
```

### **3. Fazer Logout Completo**

```powershell
firebase logout
```

### **4. Login com Novo Email**

```powershell
firebase login
```

**Importante:** 
- Isso abrirá o navegador
- Use o **novo email** para fazer login
- Permita acesso ao Firebase

### **5. Verificar Nova Conta**

```powershell
firebase login:list
```

### **6. Listar Projetos do Novo Email**

```powershell
firebase projects:list
```

### **7. Selecionar Projeto (se necessário)**

Se você tem um projeto no novo email:

```powershell
firebase use seu-projeto-id
```

Ou criar um novo projeto:

```powershell
firebase projects:create seu-novo-projeto-id
```

---

## 🔍 **Verificar Permissões no Projeto**

Se você quer adicionar o novo email como colaborador no projeto:

1. Acesse: https://console.firebase.google.com/
2. Selecione o projeto
3. Vá em **Configurações do Projeto** (ícone de engrenagem)
4. Vá na aba **Usuários e permissões**
5. Clique em **Adicionar membro**
6. Adicione o novo email com permissões adequadas

---

## ⚠️ **Importante**

### **Após Trocar de Email:**

1. ✅ Verifique se o novo email tem acesso ao projeto
2. ✅ Atualize o `.firebaserc` se o projeto mudar
3. ✅ Teste o deploy após a troca

### **Se o Projeto Não Estiver Disponível:**

Você pode:
- Pedir para o dono do projeto adicionar seu email
- Criar um novo projeto no novo email
- Usar um projeto existente do novo email

---

## 🚀 **Depois da Troca**

Após fazer login com o novo email:

```powershell
# 1. Ver projetos disponíveis
firebase projects:list

# 2. Selecionar ou criar projeto
firebase use seu-projeto-id

# 3. Verificar
firebase use

# 4. Fazer deploy
npm run build
firebase deploy --only hosting
```

---

## 📝 **Checklist**

- [ ] Fazer logout: `firebase logout`
- [ ] Login com novo email: `firebase login`
- [ ] Verificar projetos: `firebase projects:list`
- [ ] Selecionar projeto: `firebase use projeto-id`
- [ ] Atualizar `.firebaserc` se necessário
- [ ] Testar deploy

---

**Pronto para trocar de email!** 📧

