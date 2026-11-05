#!/bin/bash
# =============================================================================
# SCRIPT DE APLICAÇÃO DE ISSUES — Novos Escopos GeoVintalie
# =============================================================================
# Pré-requisito: export GH_TOKEN="ghp_..." (escopo: repo)
# Uso: ./apply_github_issues.sh
# =============================================================================

set -e

REPO="vintalie/geovintalie"
API="https://api.github.com/repos/${REPO}"
ISSUES_FILE=".hermes/issues_novos_escopos.json"

echo "============================================================"
echo "  Aplicação de Issues — Novos Escopos GeoVintalie"
echo "============================================================"
echo ""

# Verificar se o token está configurado
if [ -z "$GH_TOKEN" ] && [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ ERRO: GH_TOKEN ou GITHUB_TOKEN não configurado."
  echo ""
  echo "Configure antes de executar:"
  echo "  export GH_TOKEN=\"ghp_seu_token_aqui\""
  echo ""
  echo "Gerar token em: https://github.com/settings/tokens (escopo: repo)"
  echo ""
  echo "Ou criar as issues manualmente via web:"
  echo "  https://github.com/${REPO}/issues/new"
  exit 1
fi

TOKEN="${GH_TOKEN:-$GITHUB_TOKEN}"

# Verificar se o arquivo de issues existe
if [ ! -f "$ISSUES_FILE" ]; then
  echo "❌ ERRO: Arquivo $ISSUES_FILE não encontrado."
  exit 1
fi

echo "✅ Token configurado"
echo "✅ Arquivo de issues encontrado: $ISSUES_FILE"
echo ""

# Contar issues
TOTAL_ISSUES=$(python3 -c "import json; d=json.load(open('$ISSUES_FILE')); print(len(d['issues']))")
echo "📋 Total de issues a criar: $TOTAL_ISSUES"
echo ""

# Função para criar issue
create_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"

  local labels_json=$(echo "$labels" | python3 -c "
import json, sys
labels = sys.stdin.read().strip()
if labels:
    print(json.dumps([l.strip() for l in labels.split(',') if l.strip()]))
else:
    print('[]')
")

  local response=$(curl -s -X POST "${API}/issues" \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -d "{
      \"title\": $(echo "$title" | python3 -c "import json,sys; print(json.dumps(sys.stdin.read().strip()))"),
      \"body\": $(echo "$body" | python3 -c "import json,sys; print(json.dumps(sys.stdin.read().strip()))"),
      \"labels\": ${labels_json}
    }")

  local issue_number=$(echo "$response" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('number','ERRO'))" 2>/dev/null || echo "ERRO")
  local issue_url=$(echo "$response" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('html_url',''))" 2>/dev/null || echo "")

  if [ "$issue_number" != "ERRO" ] && [ -n "$issue_number" ]; then
    echo "  ✅ Issue #${issue_number} criada: ${title}"
    echo "     URL: ${issue_url}"
    echo "${issue_number}" >> .hermes/.created_issues
  else
    echo "  ❌ FALHA ao criar: ${title}"
    echo "     Resposta: $(echo "$response" | head -c 200)"
    echo "${title}" >> .hermes/.failed_issues
  fi
}

# Criar arquivo de controle
> .hermes/.created_issues 2>/dev/null || true
> .hermes/.failed_issues 2>/dev/null || true

# Ler e criar cada issue
python3 -c "
import json

with open('$ISSUES_FILE') as f:
    data = json.load(f)

for i, issue in enumerate(data['issues'], 1):
    print(f'[{i}/{len(data[\"issues\"])}] {issue[\"title\"][:70]}...')
    # Salvar dados temporários para o shell processar
    with open('/tmp/gh_issue_title.txt', 'w') as tf:
        tf.write(issue['title'])
    with open('/tmp/gh_issue_body.txt', 'w') as tf:
        tf.write(issue['body'])
    with open('/tmp/gh_issue_labels.txt', 'w') as tf:
        tf.write(','.join(issue.get('labels', [])))
" 2>&1

# Processar cada issue via shell (para usar curl com token)
python3 -c "
import json, subprocess, os

with open('$ISSUES_FILE') as f:
    data = json.load(f)

for i, issue in enumerate(data['issues'], 1):
    title = issue['title']
    body = issue['body']
    labels = ','.join(issue.get('labels', []))
    
    print(f'[{i}/{len(data[\"issues\"])}] Criando: {title[:60]}...')
    
    # Construir payload JSON
    payload = json.dumps({
        'title': title,
        'body': body,
        'labels': [l.strip() for l in labels.split(',') if l.strip()]
    })
    
    # Chamar curl
    result = subprocess.run([
        'curl', '-s', '-X', 'POST', '${API}/issues',
        '-H', 'Accept: application/vnd.github+json',
        '-H', f'Authorization: Bearer ${TOKEN}',
        '-H', 'X-GitHub-Api-Version: 2022-11-28',
        '-d', payload
    ], capture_output=True, text=True)
    
    try:
        resp = json.loads(result.stdout)
        number = resp.get('number')
        url = resp.get('html_url', '')
        if number:
            print(f'  ✅ Issue #{number}: {title}')
            print(f'     {url}')
            with open('.hermes/.created_issues', 'a') as f:
                f.write(f'{number}\n')
        else:
            print(f'  ❌ FALHA: {title}')
            print(f'     {result.stdout[:200]}')
            with open('.hermes/.failed_issues', 'a') as f:
                f.write(f'{title}\n')
    except:
        print(f'  ❌ FALHA (resposta inválida): {title}')
        print(f'     {result.stdout[:200]}')
        with open('.hermes/.failed_issues', 'a') as f:
            f.write(f'{title}\n')
"

echo ""
echo "============================================================"
echo "  Resumo"
echo "============================================================"
if [ -f .hermes/.created_issues ]; then
  CREATED=$(wc -l < .hermes/.created_issues)
  echo "✅ Issues criadas com sucesso: $CREATED"
  cat .hermes/.created_issues | while read num; do
    echo "   - Issue #${num}"
  done
fi
if [ -f .hermes/.failed_issues ]; then
  FAILED=$(wc -l < .hermes/.failed_issues)
  echo "❌ Issues com falha: $FAILED"
  cat .hermes/.failed_issues | while read title; do
    echo "   - ${title}"
  done
fi
echo ""
echo "Acesse: https://github.com/${REPO}/issues"
echo "============================================================"