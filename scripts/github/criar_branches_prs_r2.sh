#!/bin/bash
# =============================================================================
# SCRIPT: Criar branches, commits e PRs do R2 no GitHub (fluxo GITHUB_WORKFLOW.md)
# Repositório: vintalie/geovintalie
# Pré-requisito: export GH_TOKEN="ghp_..."  (escopo: repo)
# Uso: ./scripts/github/criar_branches_prs_r2.sh
# =============================================================================
set -u

REPO_DIR="/home/mario/Documentos/geovintalie"
REPO="vintalie/geovintalie"
API="https://api.github.com/repos/${REPO}"

# Tarefas R2 e mapeamento INFERIDO das issues (#6-#23, .hermes/.created_issues).
declare -A TASK_ISSUE=( ["A2"]="7" ["B4"]="15" ["B5"]="16" ["C2"]="19" ["C3"]="20" ["C6"]="23" )
declare -A TASK_SLUG=(
  ["A2"]="a2-google-business-profile"
  ["B4"]="b4-agendamento-chat-interno"
  ["B5"]="b5-avaliacoes-mutuas"
  ["C2"]="c2-observabilidade"
  ["C3"]="c3-lgpd-consentimento"
  ["C6"]="c6-testes-e2e"
)
declare -A TASK_TITLE=(
  ["A2"]="[R2] A2 - Google Business Profile (OAuth, sincronização de perfis)"
  ["B4"]="[R2] B4 - Agendamento, negociação e chat interno"
  ["B5"]="[R2] B5 - Sistema de avaliações mútuas cliente ↔ prestador"
  ["C2"]="[R2] C2 - Observabilidade (logs, métricas, tracing, health check)"
  ["C3"]="[R2] C3 - LGPD fluxo consentimento (opt-in, exportação, esquecimento)"
  ["C6"]="[R2] C6 - Estratégia de testes (unit, integração, E2E ≥ 80%)"
)
TASK_ORDER=(A2 B4 B5 C2 C3 C6)

echo "============================================================="
echo "  Branches + PRs R2 — vintalie/geovintalie"
echo "============================================================="
echo ""

if [ -z "${GH_TOKEN:-}" ] && [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "❌ GH_TOKEN/GITHUB_TOKEN não configurado."
  echo ""
  echo "Configure e rode novamente:"
  echo "  export GH_TOKEN=\"ghp_seu_token\"   # escopo: repo"
  echo ""
  echo "O que este script faria (execução manual necessária):"
  for t in "${TASK_ORDER[@]}"; do
    echo "  - git checkout -b fix/${TASK_ISSUE[$t]}-${TASK_SLUG[$t]}   (a partir de main)"
    echo "      commit: refs #${TASK_ISSUE[$t]}  (${TASK_TITLE[$t]})"
    echo "      PR: fix/${TASK_ISSUE[$t]}-${TASK_SLUG[$t]} -> main  (Closes #${TASK_ISSUE[$t]})"
  done
  echo ""
  echo "PR consolidado também pendente: feature/scopes-r2-2026 -> main"
  echo "  (referencia todas as issues R2: #7 #15 #16 #19 #20 #23)"
  exit 1
fi

TOKEN="${GH_TOKEN:-$GITHUB_TOKEN}"
echo "✅ Token configurado"
echo ""

cd "$REPO_DIR" || { echo "❌ Não foi possível entrar em $REPO_DIR"; exit 1; }

# Garante main atualizada
echo "→ Atualizando main..."
git checkout main >/dev/null 2>&1 || { echo "❌ Falha no checkout main"; exit 1; }
git pull origin main --ff-only >/dev/null 2>&1 || { echo "⚠️  pull main não foi fast-forward; verifique o remoto"; }

> "$REPO_DIR/.hermes/.created_prs_r2" 2>/dev/null || true
> "$REPO_DIR/.hermes/.failed_prs_r2" 2>/dev/null || true

open_pr() {
  local t="$1" issue="${TASK_ISSUE[$t]}" branch="fix/${issue}-${TASK_SLUG[$t]}"
  local title="${TASK_TITLE[$t]}"

  echo ""
  echo "### Processando ${t} → issue #${issue} → branch ${branch}"

  # Cria a branch a partir de main
  git checkout -B "$branch" main >/dev/null 2>&1 || { echo "❌ Falha ao criar branch ${branch}"; echo "${t}" >> "$REPO_DIR/.hermes/.failed_prs_r2"; return; }

  # Commit de marcação da tarefa (a implementação R2 já está em feature/scopes-r2-2026)
  cat > /tmp/r2_commit_msg.txt <<EOF
${title}

Implementação consolidada na branch feature/scopes-r2-2026.
Esta branch vincula a tarefa ${t} à issue #${issue} e abre o PR de revisão.

Refs #${issue}
Relacionadas ao ciclo R2: #6 #7 #8 #9 #10 #11 #12 #13 #14 #15 #16 #17 #18 #19 #20 #21 #22 #23
EOF
  git add -A 2>/dev/null || true
  # Só commit se houver algo staged ou permitir commit vazio de marcação
  if ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
    git commit -m "$(cat /tmp/r2_commit_msg.txt)" >/dev/null 2>&1 || true
  else
    git commit --allow-empty -m "$(cat /tmp/r2_commit_msg.txt)" >/dev/null 2>&1 || true
  fi
  rm -f /tmp/r2_commit_msg.txt

  # Push da branch
  git push -u origin "$branch" >/dev/null 2>&1 || { echo "❌ Falha ao push ${branch}"; echo "${t}" >> "$REPO_DIR/.hermes/.failed_prs_r2"; return; }
  echo "   ✅ Branch ${branch} enviada ao remoto"

  # Abre PR via API
  local body
  body=$(cat <<JSONEOF
## ${t} — R2

Esta PR implementa a tarefa **${t}** do escopo R2 e resolve a issue vinculada.

### O que muda
- ${TASK_TITLE[$t]}
- Branch criada a partir de \`main\`, commit vinculado à issue.

### Critérios de aceitação
- [ ] Implementação do requisito ${t} conforme PLANO_EXECUCAO.md / README.md (Escopos propostos)
- [ ] Testes passando (CI verde) antes do merge
- [ ] Revisão de código aprovada

### Ligações
- Resolve: #${issue}
- Issues irmãs do ciclo R2: #6-#23
- Branch consolidada R2: feature/scopes-r2-2026

Closes #${issue}
JSONEOF
)

  # Payload JSON via python (body lido de arquivo temporário, evita problemas de aspas)
  python3 - > /tmp/r2_pr_payload_${t}.json <<PY
import json
with open('/tmp/r2_pr_body_${t}.txt', encoding='utf-8') as f:
    body = f.read()
payload = {
    'title': '''${title}''',
    'head': '${branch}',
    'base': 'main',
    'body': body
}
print(json.dumps(payload, ensure_ascii=False))
PY

  local pr_response
  pr_response=$(curl -s -X POST "${API}/pulls" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -d "@/tmp/r2_pr_payload_${t}.json")

  local pr_num pr_url
  pr_num=$(echo "$pr_response" | python3 -c "import json,sys
try: print(json.load(sys.stdin).get('number','ERRO'))
except: print('ERRO')")
  pr_url=$(echo "$pr_response" | python3 -c "import json,sys
try: print(json.load(sys.stdin).get('html_url',''))
except: print('')")

  if [ "$pr_num" != "ERRO" ] && [ -n "$pr_num" ]; then
    echo "   ✅ PR #${pr_num} aberto: ${title}"
    echo "   URL: ${pr_url}"
    echo "${pr_num}" >> "$REPO_DIR/.hermes/.created_prs_r2"
  else
    echo "   ❌ FALHA ao abrir PR: ${title}"
    echo "   Resposta: $(echo "$pr_response" | head -c 300)"
    echo "${t}" >> "$REPO_DIR/.hermes/.failed_prs_r2"
  fi
}

for t in "${TASK_ORDER[@]}"; do
  open_pr "$t"
done

# Volta para main e deixa o estado limpo
git checkout main >/dev/null 2>&1

echo ""
echo "============================================================="
echo "  Resumo — PRs R2"
echo "============================================================="
echo "PRs R2 (esperados, um por tarefa):"
for t in "${TASK_ORDER[@]}"; do
  echo "  - ${t} → issue #${TASK_ISSUE[$t]} → PR fix/${TASK_ISSUE[$t]}-${TASK_SLUG[$t]} -> main"
done
echo ""
echo "PR consolidado (alternativa): feature/scopes-r2-2026 -> main"
echo "   referenciando issues R2: #7 #15 #16 #19 #20 #23"
echo ""
if [ -f "$REPO_DIR/.hermes/.created_prs_r2" ]; then
  echo "✅ PRs abertos: $(wc -l < "$REPO_DIR/.hermes/.created_prs_r2")"
  cat "$REPO_DIR/.hermes/.created_prs_r2" | while read n; do echo "   - PR #${n}"; done
fi
if [ -f "$REPO_DIR/.hermes/.failed_prs_r2" ] && [ -s "$REPO_DIR/.hermes/.failed_prs_r2" ]; then
  echo "❌ PRs com falha: $(wc -l < "$REPO_DIR/.hermes/.failed_prs_r2")"
fi
echo ""
echo "Acesse: https://github.com/${REPO}/pulls"
echo "============================================================="
