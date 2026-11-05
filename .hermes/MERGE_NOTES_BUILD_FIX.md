# NOTA DE MERGE — Correção Build Vite + Testes

**Branch:** `main` (commit `8c56292`)
**Push:** efetuado com sucesso via SSH (`git@github.com:vintalie/geovintalie.git`)
**Arquivos alterados:** 1 (vite.config.ts)

---

## PROBLEMA IDENTIFICADO

O build do Vite falhava com erro:
```
[plugin:vite:import-analysis] Failed to resolve import "@file:`radix-ui/react-tooltip`" from "src/components/ui/tooltip.tsx"
```

O plugin Babel com `reactCompilerPreset` (do `@rolldown/plugin-babel`) estava transformando incorretamente os imports ES modules, adicionando o prefixo inválido `@file:\`...\`` (com backticks) aos caminhos de importação, como:
- `@radix-ui/react-tooltip` → `@file:\`radix-ui/react-tooltip\``
- `@/lib/utils` → `@file:\`/lib/utils\``

Isso quebrava a resolução de módulos do Vite, impedindo o build de produção.

---

## CORREÇÃO APLICADA

### Arquivo modificado: `frontend/vite.config.ts`

**Removido:**
- Import de `babel` do `@rolldown/plugin-babel`
- Import de `reactCompilerPreset` do `@vitejs/plugin-react`
- Plugin `babel({ presets: [reactCompilerPreset()] })` da lista de plugins do Vite

**Mantido:**
- `react()` do `@vitejs/plugin-react`
- `tailwindcss()` do `@tailwindcss/vite`
- `tsconfigPaths()` do `vite-tsconfig-paths`
- Alias `@` → `./src`
- Base path: `/` (dev) / `/geovintalie/` (produção)

---

## TESTES EXECUTADOS

### Backend (Laravel/PHPUnit)
```
Result: passed
Tests: 14
Passed: 14
Assertions: 26
Duration: 5410ms
```

Todos os 14 testes de funcionalidade da API passaram (auth, propriedades, produtos, estoque, localização, autorização admin/user).

### Frontend
Não há testes configurados no frontend (sem arquivos de teste, sem vitest).

### Build de Produção (Vite)
✅ Passou com sucesso — `frontend/dist/index.html` gerado com base `/geovintalie/`, sem Bootstrap CSS, sem erros de importação.

---

## SERVIDORES EM FUNCIONAMENTO (máquina local)

| Serviço | URL | Status |
|---------|-----|--------|
| API Laravel | `http://127.0.0.1:8000` | 200 OK |
| Frontend Vite dev | `http://localhost:5173` | 200 OK |

---

## PERFIS / AGENTES

- **Orquestrador:** planejamento, correção de build, execução de testes, commit e push
- **VALIDADOR:** pendente (validar renderização visual das páginas)
- **PUBLICADOR:** pendente (após validação)

**Perfis OpenRouter configurados:** `kilo nvidia/nemotron-3.5-super-vl:free`

---

## RESUMO EXECUTIVO

- ✅ Erro de build do Vite corrigido (removido babel react compiler que quebrava imports)
- ✅ Build de produção passa limpo (GitHub Pages: base `/geovintalie/`)
- ✅ Testes do backend: 14/14 passando
- ✅ Servidores rodando localmente (API + Frontend)
- ✅ Commit `8c56292` pushado para `main` no GitHub
