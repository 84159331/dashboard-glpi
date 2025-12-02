#!/bin/bash

# Script de Deploy Automático - Git Push + Firebase Hosting
# Uso: ./deploy.sh "mensagem do commit"

COMMIT_MESSAGE=${1:-"Deploy automático - $(date '+%Y-%m-%d %H:%M:%S')"}

echo "🚀 Iniciando processo de deploy automático..."

# Verificar se há mudanças
echo ""
echo "📋 Verificando mudanças..."
if [ -z "$(git status --porcelain)" ]; then
    echo "⚠️  Nenhuma mudança para commitar. Continuando com build e deploy..."
else
    echo "✅ Mudanças detectadas. Adicionando ao git..."
    
    # Adicionar todos os arquivos
    git add .
    
    # Fazer commit
    echo "📝 Fazendo commit..."
    git commit -m "$COMMIT_MESSAGE"
    
    # Push para o repositório
    echo "⬆️  Fazendo push para o repositório..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Push realizado com sucesso!"
    else
        echo "❌ Erro ao fazer push. Continuando com build..."
    fi
fi

# Build da aplicação
echo ""
echo "🏗️  Fazendo build da aplicação..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build! Deploy cancelado."
    exit 1
fi

echo "✅ Build concluído com sucesso!"

# Deploy no Firebase
echo ""
echo "🔥 Fazendo deploy no Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deploy concluído com sucesso!"
    echo "🌐 Sua aplicação está disponível no Firebase!"
else
    echo ""
    echo "❌ Erro no deploy do Firebase!"
    exit 1
fi

echo ""
echo "✅ Processo completo finalizado!"

