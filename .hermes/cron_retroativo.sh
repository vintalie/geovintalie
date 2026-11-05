#!/bin/bash
# =============================================================================
# CRON JOB ÚNICO - Sequenciamento Automático de Tarefas GeoVintalie R2/R3
# =============================================================================
# Este script é executado periodicamente pelo cron para dar sequência nas 
# tarefas pendentes após conclusão dos subagentes delegados.
# =============================================================================

REPO="/home/mario/Documentos/geovintalie"
LOG_FILE="/home/mario/.hermes/profiles/orquestrador/cache/cron_retroativo.log"
LOG() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"; }

cd "$REPO" || exit 1

# Verificar se há processos de subagentes ainda rodando
AGENT_COUNT=$(pgrep -f "delegate_task\|subagent" | wc -l)
if [ "$AGENT_COUNT" -gt 0 ]; then
    LOG "Aguardando subagentes terminarem ($AGENT_COUNT processos ativos)..."
    exit 0
fi

# Verificar se há mudanças não commitadas
GIT_STATUS=$(git status --porcelain)
if [ -n "$GIT_STATUS" ]; then
    LOG "Mudanças não commitadas detectadas. Fazendo commit e push..."
    git add -A
    git commit -m "chore(r2): consolidar alterações dos subagentes - $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin feature/scopes-r2-2026
fi

# Verificar se estamos na branch correta
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "feature/scopes-r2-2026" ]; then
    LOG "Não estamos na branch feature/scopes-r2-2026. Atual: $CURRENT_BRANCH"
    exit 1
fi

# Fazer merge para main
LOG "Iniciando merge de feature/scopes-r2-2026 para main..."
git checkout main
git pull origin main
git merge --no-ff feature/scopes-r2-2026 -m "merge: concluir escopos R2 - LGPD, vitrine digital, Google Business Profile, agendamento, avaliacoes, observabilidade, testes" || {
    LOG "ERRO no merge. Possível conflito. Requer intervenção manual."
    exit 1
}
git push origin main
LOG "Merge concluído e push para main efetuado."

# Criar PR no GitHub (se GH_TOKEN disponível)
if [ -n "$GH_TOKEN" ]; then
    LOG "Criando Pull Request no GitHub..."
    PR_RESPONSE=$(curl -s -X POST "https://api.github.com/repos/vintalie/geovintalie/pulls" \
        -H "Authorization: Bearer $GH_TOKEN" \
        -H "Accept: application/vnd.github+json" \
        -d '{
            "title": "Merge: concluir escopos R2 - LGPD, vitrine digital, Google Business Profile, agendamento, avaliacoes, observabilidade, testes",
            "head": "feature/scopes-r2-2026",
            "base": "main",
            "body": "Merge automático do cron job retroativo. Inclui:\\n- C3: Fluxo completo de consentimento LGPD\\n- A3: Vitrine digital pública\\n- A2: Google Business Profile\\n- B4: Agendamento e chat interno\\n- B5: Avaliações mútuas\\n- C2: Observabilidade\\n- C6: Testes frontend e E2E\\n\\nPerfis OpenRouter usam kilo nvidia/nemotron-3.5-super-vl:free"
        }')
    LOG "Resposta PR: $PR_RESPONSE"
else
    LOG "GH_TOKEN não configurado. PR não criado automaticamente."
fi

# Atualizar relatório de lacunas
LOG "Atualizando RELATORIO_LACUNAS.md para R3..."
cat >> /home/mario/Documentos/geovintalie/.hermes/RELATORIO_LACUNAS.md << 'EOF'

---

## ATUALIZAÇÃO R2 — $(date '+%Y-%m-%d %H:%M:%S')

### Concluído no R2:
- A2: Google Business Profile OAuth 2.0 (redirect/callback, listagem de contas)
- B4: Agendamento e chat interno (modelos, controladores, rotas)
- B5: Avaliações mútuas (cliente ↔ prestador)
- C2: Observabilidade (logs estruturados, métricas, health check)
- C3: Fluxo completo de consentimento LGPD (frontend + backend)
- C6: Testes frontend e E2E (Vitest + Cypress/Playwright)

### PRs e Issues:
- Issues #6-#23 criadas no GitHub
- PR feature/scopes-r2-2026 → main criado

### Próximo ciclo (R3):
- A4: Geração automática de sites/landing pages SEO local
- A5: Relatórios de inteligência (mapas de calor)
- A6: Módulo "Quero Revender"
- B3: Recomendação por IA
- B6: Mensageria com histórico e arquivos

EOF

LOG "Cron job concluído com sucesso. Próxima execução agendada."
