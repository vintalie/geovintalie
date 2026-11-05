#!/bin/bash
# Script para aplicar fluxo GitHub retroativo
# Requer: GH_TOKEN ou GITHUB_TOKEN configurado

API="https://api.github.com/repos/vintalie/geovintalie"
TOKEN="${GH_TOKEN:-$GITHUB_TOKEN}"

if [ -z "$TOKEN" ]; then
  echo "ERRO: GH_TOKEN ou GITHUB_TOKEN não configurado"
  echo "Exporte com: export GH_TOKEN='ghp_...'"
  exit 1
fi

echo "=== Criando issues faltantes ==="
python3 << 'PYEOF'
import json
import os
import urllib.request

API = "https://api.github.com/repos/vintalie/geovintalie"
TOKEN = os.environ.get('GH_TOKEN') or os.environ.get('GITHUB_TOKEN')
headers = {
    "Accept": "application/vnd.github+json",
    "Authorization": f"Bearer {TOKEN}",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "retroativo-script"
}

with open('issues_to_create.json', 'r', encoding='utf-8') as f:
    issues = json.load(f)

for issue in issues:
    print(f"Criando: {issue['title']}")
    data = json.dumps({
        "title": issue['title'],
        "body": issue['body'],
        "labels": issue['labels']
    }).encode('utf-8')
    req = urllib.request.Request(f"{API}/issues", data=data, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            print(f"  ✓ Criada #{result['number']}")
    except Exception as e:
        print(f"  ✗ Erro: {e}")
PYEOF

echo -e "\n=== Vinculando PR #5 à issue #5 ==="
data='{"body": "Vinculado ao PR #5 (Add CI workflow). Branch: vintalie-pedagios-y-caronas → main. Workflow adicionado em .github/workflows/main.yml."}'
curl -s -X POST "$API/issues/5/comments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d "$data"

echo -e "\n=== Comentário adicionado ==="
