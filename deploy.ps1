# Script de Deploy Automático - Git Push + Firebase Hosting
# Uso: .\deploy.ps1 "mensagem do commit"

param(
    [string]$commitMessage = "Deploy automático - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando processo de deploy automático..." -ForegroundColor Cyan

# Verificar se Git está configurado
try {
    $gitConfig = git config user.name 2>$null
    if (-not $gitConfig) {
        Write-Host "⚠️  Git não está configurado. Pulando git push..." -ForegroundColor Yellow
        $skipGit = $true
    }
} catch {
    Write-Host "⚠️  Git não encontrado. Pulando git push..." -ForegroundColor Yellow
    $skipGit = $true
}

# Verificar se há mudanças e fazer git push
if (-not $skipGit) {
    Write-Host "`n📋 Verificando mudanças no Git..." -ForegroundColor Yellow
    $status = git status --porcelain 2>$null
    if ($status -eq "" -or $null -eq $status) {
        Write-Host "⚠️  Nenhuma mudança para commitar. Continuando com build e deploy..." -ForegroundColor Yellow
    } else {
        Write-Host "✅ Mudanças detectadas. Adicionando ao git..." -ForegroundColor Green
        
        try {
            # Adicionar todos os arquivos
            git add . 2>&1 | Out-Null
            
            # Fazer commit
            Write-Host "📝 Fazendo commit..." -ForegroundColor Yellow
            git commit -m "$commitMessage" 2>&1 | Out-Null
            
            # Push para o repositório
            Write-Host "⬆️  Fazendo push para o repositório..." -ForegroundColor Yellow
            git push origin main 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Erro ao fazer push (pode ser que não tenha remote configurado). Continuando com build..." -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️  Erro no Git. Continuando com build..." -ForegroundColor Yellow
        }
    }
}

# Build da aplicação
Write-Host "`n🏗️  Fazendo build da aplicação..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build! Deploy cancelado." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green

# Deploy no Firebase
Write-Host "`n🔥 Fazendo deploy no Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🎉 Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "🌐 Sua aplicação está disponível no Firebase!" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Erro no deploy do Firebase!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Processo completo finalizado!" -ForegroundColor Green

