#!/bin/bash
# =============================================================================
# CRON JOB ÚNICO — GEOVINTALE R2 → R3 SEQUENCIADOR
# =============================================================================
# Este script é executado periodicamente para dar sequência nas tarefas pendentes
# do projeto GeoVintalie, seguindo o PLANO_EXECUCAO.md e o RELATORIO_LACUNAS.md.
#
# Perfis OpenRouter: kilo nvidia/nemotron-3.5-super-vl:free
# =============================================================================

set -e

PROJECT_DIR="/home/mario/Documentos/geovintalie"
LOG_FILE="/home/mario/.hermes/logs/cron_geovintale_$(date '+%Y%m%d_%H%M%S').log"
mkdir -p /home/mario/.hermes/logs

echo "============================================================" | tee -a "$LOG_FILE"
echo "CRON GEOVINTALE — $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
echo "============================================================" | tee -a "$LOG_FILE"

cd "$PROJECT_DIR" || exit 1

# -----------------------------------------------------------------------------
# 1. VERIFICAR ESTADO ATUAL DA BRANCH
# -----------------------------------------------------------------------------
echo "" | tee -a "$LOG_FILE"
echo "[1/6] Verificando branch atual..." | tee -a "$LOG_FILE"
git branch --show-current | tee -a "$LOG_FILE"
git status --short | tee -a "$LOG_FILE"

# -----------------------------------------------------------------------------
# 2. VERIFICAR SERVIDORES RODANDO
# -----------------------------------------------------------------------------
echo "" | tee -a "$LOG_FILE"
echo "[2/6] Verificando servidores (API + Frontend)..." | tee -a "$LOG_FILE"
curl -s -o /dev/null -w "API: %{http_code}\n" http://127.0.0.1:8000/ 2>&1 | tee -a "$LOG_FILE"
curl -s -o /dev/null -w "FE: %{http_code}\n" http://localhost:5173/ 2>&1 | tee -a "$LOG_FILE"

# -----------------------------------------------------------------------------
# 3. RODAR TESTES BACKEND
# -----------------------------------------------------------------------------
echo "" | tee -a "$LOG_FILE"
echo "[3/6] Rodando testes backend (PHPUnit)..." | tee -a "$LOG_FILE"
cd api && php artisan test 2>&1 | tee -a "$LOG_FILE"
cd ..

# -----------------------------------------------------------------------------
# 4. RODAR BUILD FRONTEND
# -----------------------------------------------------------------------------
echo "" | tee -a "$LOG_FILE"
echo "[4/6] Rodando build frontend (Vite)..." | tee -a "$LOG_FILE"
cd frontend && npm run build --mode production 2>&1 | tee -a "$LOG_FILE"
cd ..

# -----------------------------------------------------------------------------
# 5. LISTAR TAREFAS PENDENTES DO R2
# -----------------------------------------------------------------------------
echo "" | tee -a "$LOG_FILE"
echo "[5/6] Tarefas pendentes do R2 (conforme RELATORIO_LACUNAS.md):" | tee -a "$LOG_FILE"
echo "  - A2: Google Business Profile (integracao externa)" | tee -a "$LOG_FILE"
echo "  - B4: Agendamento e chat interno" | tee -a "$LOG_FILE"
echo "  - B5: Avaliacoes mutuas" | tee -a "$LOG_FILE"
echo "  - C2: Observabilidade (logs, metricas, tracing)" | tee -a "$LOG_FILE"
echo "  - C3: Fluxo completo de consentimento LGPD (frontend)" | tee -a "$LOG_FILE"
echo "  - C6: Testes frontend e E2E" | tee -a "$LOG_FILE"

# -----------------------------------------------------------------------------
# 6. PRÓXIMO CICLO (R3)
# -----------------------------------------------------------------------------
echo "" | tee -a "$LOG_FILE"
echo "[6/6] Proximo ciclo (R3) - aguardando conclusao do R2:" | tee -a "$LOG_FILE"
echo "  - A4: Geração automática de sites/landing pages SEO local" | tee -a "$LOG_FILE"
echo "  - A5: Relatórios de inteligência (mapas de calor)" | tee -a "$LOG_FILE"
echo "  - A6: Módulo 'Quero Revender'" | tee -a "$LOG_FILE"
echo "  - B3: Recomendação por IA" | tee -a "$LOG_FILE"
echo "  - B6: Mensageria com histórico e arquivos" | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "============================================================" | tee -a "$LOG_FILE"
echo "CRON FINALIZADO — $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
echo "============================================================" | tee -a "$LOG_FILE"
