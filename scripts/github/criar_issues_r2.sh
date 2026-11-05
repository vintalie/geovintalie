#!/bin/bash
# =============================================================================
# SCRIPT: Criar Issues do R2 no GitHub (fluxo GITHUB_WORKFLOW.md)
# Repositório: vintalie/geovintalie
# Pré-requisito: export GH_TOKEN="ghp_..."  (escopo: repo)
# Uso: ./scripts/github/criar_issues_r2.sh
# =============================================================================
set -u

REPO="vintalie/geovintalie"
API="https://api.github.com/repos/${REPO}"

# Tarefas R2 e mapeamento INFERIDO das issues já criadas localmente (#6-#23).
# A ordem segue issues_novos_escopos.json: A1..A6, B1..B6, C1..C6 => #6..#23.
# AVISO: os números abaixo são inferidos do arquivo local .hermes/.created_issues
#        e NÃO foram confirmados no GitHub remoto (sem GH_TOKEN para consultar).
declare -A TASK_ISSUE=( ["A2"]="7"  ["B4"]="15" ["B5"]="16" ["C2"]="19" ["C3"]="20" ["C6"]="23" )

declare -A TASK_TITLE=(
  ["A2"]="[Escopo A] A2 - Gestão e sincronização de perfis no Google Business Profile"
  ["B4"]="[Escopo B] B4 - Agendamento, negociação e chat interno"
  ["B5"]="[Escopo B] B5 - Sistema de avaliações mútuas (cliente ↔ prestador)"
  ["C2"]="[Escopo C] C2 - Observabilidade (logs estruturados, métricas, tracing)"
  ["C3"]="[Escopo C] C3 - LGPD: consentimento, anonimização e direito ao esquecimento"
  ["C6"]="[Escopo C] C6 - Estratégia de testes (unitário, integração, E2E) com meta ≥ 80%"
)

declare -A TASK_LABELS=(
  ["A2"]="escopo-a,o2o,google-business,integracao-externa,prioridade: alta,feature"
  ["B4"]="escopo-b,marketplace,agendamento,chat,negociacao,prioridade: alta,feature"
  ["B5"]="escopo-b,marketplace,avaliacoes,notas,prioridade: alta,feature"
  ["C2"]="escopo-c,transversal,observabilidade,logs,metricas,tracing,prioridade: media,feature"
  ["C3"]="escopo-c,transversal,lgpd,privacidade,anonimizacao,prioridade: media,feature,seguranca"
  ["C6"]="escopo-c,transversal,testes,cobertura,e2e,qualidade,prioridade: media,feature"
)

TASK_ORDER=(A2 B4 B5 C2 C3 C6)

echo "============================================================="
echo "  Criação de Issues R2 — vintalie/geovintalie"
echo "============================================================="
echo ""

# Verifica token
if [ -z "${GH_TOKEN:-}" ] && [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "❌ GH_TOKEN/GITHUB_TOKEN não configurado."
  echo ""
  echo "Configure e rode novamente:"
  echo "  export GH_TOKEN=\"ghp_seu_token\"   # escopo: repo"
  echo "  https://github.com/settings/tokens"
  echo ""
  echo "Issues R2 esperadas (mapeamento inferido #6-#23):"
  for t in "${TASK_ORDER[@]}"; do
    echo "  - ${t} -> issue #${TASK_ISSUE[$t]}: ${TASK_TITLE[$t]}"
  done
  echo ""
  echo "Ou crie manualmente via web: https://github.com/${REPO}/issues/new"
  exit 1
fi

TOKEN="${GH_TOKEN:-$GITHUB_TOKEN}"
echo "✅ Token configurado"
echo ""

# Função: verifica se issue já existe por título (GET /issues)
issue_exists() {
  local title="$1"
  local resp
  resp=$(curl -s -X GET "${API}/issues?state=all&per_page=100" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28")
  echo "$resp" | python3 -c "import json,sys
try:
    data=json.load(sys.stdin)
    titles=[i['title'] for i in data if isinstance(i,dict)]
    print('EXISTE' if '${title}' in titles else 'NAO')
except Exception:
    print('NAO')"
}

# Função: cria issue
create_issue() {
  local t="$1" number="${TASK_ISSUE[$t]}" title="${TASK_TITLE[$t]}"
  local labels="${TASK_LABELS[$t]}"
  local body_file="/tmp/r2_issue_${t}.md"

  # Monta corpo da issue com referência às issues existentes #6-#23
  cat > "$body_file" <<EOF
## Escopo R2
Tarefa: **${t}** — Release R2

## Descrição
${title}

## Critérios de aceitação
- Implementar o requisito funcional ${t} conforme PLANO_EXECUCAO.md e README.md (Escopos propostos).
- Registrar branch, commits e PR vinculados a esta issue.
- Referenciar as issues irmãs do R2: #6-#23 (escopos A1-A6, B1-B6, C1-C6).

## Referência
Consulte .hermes/PROMPT_PROXIMAS_TAREFAS.md para o detalhamento da tarefa ${t}.

## Labels
\`${labels//,/, \`}\``

## Estimativa
Grande (G) — veja issues_novos_escopos.json

## Fase de release
R2

## Ligações
- Issues relacionadas (mesmo ciclo R2): #6-#23
- Branch: a ser criada a partir de \`main\`
- PR: a ser aberto em \`main\` com \`Closes #${number}\`
EOF

  local labels_json
  labels_json=$(python3 -c "import json; print(json.dumps([l.strip() for l in '${labels}'.split(',') if l.strip()]))")

  local response
  response=$(curl -s -X POST "${API}/issues" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -d "$(python3 -c "
import json
with open('${body_file}') as f:
    body=f.read()
print(json.dumps({
  'title': ${python3 -c "import json;print(json.dumps('${title}'))"},
  'body': body,
  'labels': ${labels_json}
}))")")

  local num
  num=$(echo "$response" | python3 -c "import json,sys
try: print(json.load(sys.stdin).get('number','ERRO'))
except: print('ERRO')")
  local url
  url=$(echo "$response" | python3 -c "import json,sys
try: print(json.load(sys.stdin).get('html_url',''))
except: print('')")

  if [ "$num" != "ERRO" ] && [ -n "$num" ]; then
    echo "✅ Issue #${num} criada: ${title}"
    echo "   URL: ${url}"
    echo "${num}" >> /home/mario/Documentos/geovintalie/.hermes/.created_issues_r2
  else
    echo "❌ FALHA ao criar issue: ${title}"
    echo "   Resposta: $(echo "$response" | head -c 300)"
    echo "${title}" >> /home/mario/Documentos/geovintalie/.hermes/.failed_issues_r2
  fi
  rm -f "$body_file"
}

> /home/mario/Documentos/geovintalie/.hermes/.created_issues_r2 2>/dev/null || true
> /home/mario/Documentos/geovintalie/.hermes/.failed_issues_r2 2>/dev/null || true

for t in "${TASK_ORDER[@]}"; do
  echo "--- Processando ${t} (issue esperada #${TASK_ISSUE[$t]}) ---"
  # Se o número já consta localmente, pressupõe que existe e não duplica.
  if grep -qx "${TASK_ISSUE[$t]}" /home/mario/Documentos/geovintalie/.hermes/.created_issues 2>/dev/null; then
    echo "⏭️  Issue #${TASK_ISSUE[$t]} já registada localmente (.created_issues). Pulando criação."
    echo "${TASK_ISSUE[$t]}" >> /home/mario/Documentos/geovintalie/.hermes/.created_issues_r2
  else
    create_issue "$t"
  fi
done

echo ""
echo "============================================================="
echo "  Resumo — Issues R2"
echo "============================================================="
echo "Issues R2 (inferidas #6-#23):"
for t in "${TASK_ORDER[@]}"; do
  echo "  - ${t} → issue #${TASK_ISSUE[$t]}: ${TASK_TITLE[$t]}"
done
echo ""
if [ -f /home/mario/Documentos/geovintalie/.hermes/.created_issues_r2 ]; then
  echo "✅ Processadas: $(wc -l < /home/mario/Documentos/geovintalie/.hermes/.created_issues_r2)"
fi
if [ -f /home/mario/Documentos/geovintalie/.hermes/.failed_issues_r2 ] && [ -s /home/mario/Documentos/geovintalie/.hermes/.failed_issues_r2 ]; then
  echo "❌ Falhas: $(wc -l < /home/mario/Documentos/geovintalie/.hermes/.failed_issues_r2)"
fi
echo ""
echo "Acesse: https://github.com/${REPO}/issues"
echo "============================================================="
