# Script de Configuração do GitHub
# Execute este script após criar o repositório no GitHub

Write-Host "=== Configuração do GitHub ===" -ForegroundColor Cyan
Write-Host ""

# Solicitar URL do repositório
$repoUrl = Read-Host "Cole a URL do seu repositório GitHub (ex: https://github.com/usuario/dashboard-glpi.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "URL não fornecida. Saindo..." -ForegroundColor Red
    exit 1
}

# Verificar se já existe remote
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "Removendo remote existente: $existingRemote" -ForegroundColor Yellow
    git remote remove origin
}

# Adicionar novo remote
Write-Host "Configurando remote origin..." -ForegroundColor Green
git remote add origin $repoUrl

# Renomear branch para main (se necessário)
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "Renomeando branch de $currentBranch para main..." -ForegroundColor Green
    git branch -M main
}

# Verificar status
Write-Host ""
Write-Host "=== Status do Repositório ===" -ForegroundColor Cyan
git remote -v
git branch
Write-Host ""

# Perguntar se deseja fazer push
$push = Read-Host "Deseja fazer push agora? (S/N)"
if ($push -eq "S" -or $push -eq "s") {
    Write-Host "Fazendo push para o GitHub..." -ForegroundColor Green
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Push realizado com sucesso!" -ForegroundColor Green
        Write-Host "Seu código está disponível em: $repoUrl" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "✗ Erro ao fazer push. Verifique suas credenciais do GitHub." -ForegroundColor Red
        Write-Host "Você pode precisar configurar autenticação:" -ForegroundColor Yellow
        Write-Host "  - Personal Access Token (recomendado)" -ForegroundColor Yellow
        Write-Host "  - GitHub CLI (gh auth login)" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Para fazer push manualmente, execute:" -ForegroundColor Yellow
    Write-Host "  git push -u origin main" -ForegroundColor White
}

Write-Host ""
Write-Host "Configuração concluída!" -ForegroundColor Green

