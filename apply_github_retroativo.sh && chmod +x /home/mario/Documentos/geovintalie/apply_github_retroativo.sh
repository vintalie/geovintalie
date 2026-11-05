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
# Ler do arquivo issues_to_create.json
python3 << 'PYEOF'
import json
import os
import requests

API = "https://api.github.com/repos/vintalie/geovintalie"
TOKEN = os.environ.get('GH_TOKEN') or os.environ.get('GITHUB_TOKEN')
headers = {
    "Accept": "application/vnd.github+json",
    "Authorization": f"Bearer {TOKEN}",
    "X-GitHub-Api-Version": "2022-11-28"
}

with open('issues_to_create.json', 'r', encoding='utf-8') as f:
    issues = json.load(f)

for issue in issues:
    print(f"Criando: {issue['title']}")
    data = {
        "title": issue['title'],
        "body": issue['body'],
        "labels": issue['labels']
    }
    r = requests.post(f"{API}/issues", headers=headers, json=data)
    if r.status_code == 201:
        print(f"  ✓ Criada #{r.json()['number']}")
    else:
        print(f"  ✗ Erro {r.status_code}: {r.text}")
PYEOF

echo -e "\n=== Vinculando PR #5 à issue #5 ==="
curl -s -X POST "$API/issues/5/comments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d '{"body": "Vinculado ao PR #5 (Add CI workflow). Branch: vintalie-pedagios-y-caronas → main. Workflow adicionado em .github/workflows/main.yml."}'

echo -e "\n=== Comentário adicionado ==="
