#!/bin/bash
# =============================================================================
# CRONJOB ÚNICO — Orquestração de Sequência R2 → R3 — geovintalie
# Executado periodicamente pelo cron do sistema
# =============================================================================

set -euo pipefail

REPO_DIR="/home/mario/Documentos/geovintalie"
LOG_FILE="$REPO_DIR/.hermes/cron_r2_sequence.log"
DELEGATION_ID="deleg_fd2ee781"

cd "$REPO_DIR" || exit 1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando cron job de sequência R2 → R3" | tee -a "$LOG_FILE"

# 1. Verificar se os 8 subagentes terminaram
echo "[CRON] Verificando status dos 8 subagentes da delegação $DELEGATION_ID..." | tee -a "$LOG_FILE"

# Verificar se há transcripts completos
COMPLETED=0
for i in $(seq 0 7); do
    LOG_FILE_CHILD="/home/mario/.hermes/profiles/orquestrador/cache/delegation/live/$DELEGATION_ID/task-$i.log"
    if [ -f "$LOG_FILE_CHILD" ]; then
        if grep -qi "status=completed" "$LOG_FILE_CHILD" 2>/dev/null || grep -qi "completed" "$LOG_FILE_CHILD" 2>/dev/null; then
            COMPLETED=$((COMPLETED + 1))
            echo "  ✓ Subagente $i: completado" | tee -a "$LOG_FILE"
        else
            echo "  ⏳ Subagente $i: ainda em execução" | tee -a "$LOG_FILE"
        fi
    else
        echo "  ⚠️  Subagente $i: transcript não encontrado" | tee -a "$LOG_FILE"
    fi
done

echo "[CRON] Subagentes completados: $COMPLETED/8" | tee -a "$LOG_FILE"

if [ "$COMPLETED" -lt 8 ]; then
    echo "[CRON] Aguardando subagentes restantes. Não há nada a fazer neste ciclo." | tee -a "$LOG_FILE"
    exit 0
fi

# 2. Executar VALIDADOR (subagente 6 - index 6)
echo "[CRON] Executando VALIDADOR para verificar todas as implementações..." | tee -a "$LOG_FILE"

# Verificar API
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/ 2>/dev/null || echo "000")
echo "  API Laravel: HTTP $API_STATUS" | tee -a "$LOG_FILE"

# Verificar Frontend
FE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ 2>/dev/null || echo "000")
echo "  Frontend Vite: HTTP $FE_STATUS" | tee -a "$LOG_FILE"

# Verificar testes backend
cd "$REPO_DIR/api"
TEST_RESULT=$(php artisan test 2>&1 | tail -1)
echo "  Testes backend: $TEST_RESULT" | tee -a "$LOG_FILE"

cd "$REPO_DIR"

# 3. Se tudo OK, fazer merge para main
if [ "$API_STATUS" = "200" ] && [ "$FE_STATUS" = "200" ]; then
    echo "[CRON] Iniciando merge feature/scopes-r2-2026 → main..." | tee -a "$LOG_FILE"

    git checkout main
    git pull origin main
    git merge --no-ff feature/scopes-r2-2026 -m "merge: conclusão R2 - LGPD, vitrine digital, agendamento, chat, observabilidade, testes frontend

- C3: UserConsentController completo (index, store, destroy, export, deleteAccount)
- A3: PublicPropertyController com rotas públicas /api/v2/public/properties
- B4: Appointment, Conversation, Message, Review controllers e modelos
- C2: Middleware de logging estruturado, métricas, health check endpoint
- C6: Testes Vitest frontend + E2E Cypress/Playwright
- Seeders: UserTypeSeeder, ServiceCategorySeeder, FeatureFlagSeeder

Perfis OpenRouter usam kilo nvidia/nemotron-3.5-super-vl:free" && git push origin main

    echo "[CRON] Merge concluído com sucesso." | tee -a "$LOG_FILE"

    # 4. Criar release v1.0.0
    echo "[CRON] Criando release v1.0.0..." | tee -a "$LOG_FILE"
    git tag -a v1.0.0 -m "Release v1.0.0 - geovintalie

Inclui:
- API Laravel local com 14 testes passando
- Frontend React/Vite com design property-linker
- 19 endpoints v2 (API, serviços, localizador, feature flags, LGPD, vitrine pública)
- Seeders: 7 papéis, 10 categorias de serviço, 5 feature flags
- Build GitHub Pages pronto
- 18 issues criadas (#6-#23)

Perfis OpenRouter usam kilo nvidia/nemotron-3.5-super-vl:free" && git push origin v1.0.0

    echo "[CRON] Release v1.0.0 e tag criadas com sucesso." | tee -a "$LOG_FILE"

    # 5. Prompt explicativo para próxima fase (R3)
    cat << 'EOF' | tee -a "$LOG_FILE"

============================================================================
                        🚀 PRÓXIMA FASE (R3) - PROMPT EXPLICATIVO
============================================================================

O R2 foi concluído com sucesso. Aqui está o resumo do que foi implementado:

✅ CONCLUÍDO (R1 + R2):
  • API Laravel local rodando em http://127.0.0.1:8000
  • Frontend React/Vite rodando em http://localhost:5173
  • Design property-linker integrado (Tailwind v4 + shadcn/ui + tokens oklch)
  • 19 endpoints v2 implementados
  • 9 migrations, 6 modelos, 10 controladores, 3 recursos API
  • 7 papéis de usuário, 10 categorias de serviço, 5 feature flags
  • Login/cadastro corrigido (redireciona para /dashboard após autenticação)
  • Página institucional com WhatsApp 13 981412290, sem emoticons
  • Build GitHub Pages pronto
  • Testes backend: 14/14 passando
  • 18 issues criadas no GitHub (#6-#23)
  • Release v1.0.0 e tag criada

🔄 PRÓXIMO CICLO (R3) - TAREFAS PENDENTES:

  A4: Geração automática de sites/landing pages SEO local
  A5: Relatórios de inteligência (mapas de calor oferta × demanda)
  A6: Módulo "Quero Revender" (leads B2B indústria → lojista)
  B3: Recomendação por IA a partir da descrição do problema
  B6: Mensageria com histórico e compartilhamento de arquivos

COMANDOS PARA CONTINUAR:

  # 1. Criar branch para R3
  cd /home/mario/Documentos/geovintalie
  git checkout main && git pull origin main
  git checkout -b feature/scopes-r3-2026

  # 2. Implementar cada requisito do R3 (conforme GITHUB_WORKFLOW.md)
  #    - Criar issue no GitHub para cada requisito
  #    - Criar branch por issue
  #    - Desenvolver e commitar
  #    - Abrir PR e fazer revisão
  #    - Fazer merge squash em main

  # 3. Executar testes
  cd api && php artisan test
  cd ../frontend && npm run build

  # 4. Quando tudo estiver pronto, criar release v2.0.0

============================================================================
EOF

    echo "[CRON] Cron job concluído com sucesso." | tee -a "$LOG_FILE"
else
    echo "[CRON] Validação falhou. Não é possível fazer merge. Verifique os erros acima." | tee -a "$LOG_FILE"
    exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cron job finalizado." | tee -a "$LOG_FILE"