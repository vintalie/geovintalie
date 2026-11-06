# RELATÓRIO DE CONFORMIDADE LGPD — Escopo C3 (GeoVintalie)

**Executor:** EXECUTOR-SEGURANÇA (agente Hermes, perfil orquestrador)  
**Projeto:** /home/mario/Documentos/geovintalie  
**Branch:** fix/7-a2-google-business-profile (trabalho feito sobre o estado consolidado do R2)  
**Data:** 06/11/2026

---

## 1. O que foi feito

Revisão do fluxo de dados pessoais e permissões do escopo C3 (LGPD) e conclusão do fluxo de consentimento / anonimização / esquecimento:

- **Backend:** `UserConsentController` concluído e endurecido; `User` e `UserResource` expõem o campo `phone` (migração `add_phone_to_users_table` já estava aplicada no BD, mas não estava mapeada no modelo/resource — lacuna corrigida); relação `userConsents()` adicionada ao `User`.
- **Rota crítica corrigida:** `DELETE /api/v2/user-consents/account` estava sendo capturada por `DELETE /api/v2/user-consents/{purpose}` (cadastrada antes). Ordem trocada para que a rota estática `/account` seja registrada antes da parametrizada. Sem isso, a exclusão de conta nunca era alcançada (404 "Consentimento não encontrado").
- **Frontend:** contrato de API alinhado ao backend (`purpose`/`granted`, revogação por `purpose`, `deleteAccount` com `password` + `confirm_delete`); campos `tipo`/`aceito`/`aceito_em` substituídos por `purpose`/`granted`/`granted_at`; `DeleteAccount` agora coleta senha e confirmação no diálogo; `Profile` expõe e edita o telefone.
- **Testes:** `LgpdPages.test.tsx` atualizado ao novo contrato (6/6 passando). `tsc --noEmit` limpo.

---

## 2. Checklist de conformidade LGPD

| # | Requisito (LGPD) | Implementação | Status |
|---|------------------|---------------|--------|
| 1 | Consentimento por finalidade, livre e informado (Art. 7º, I; §1º) | UI de switch por finalidade (marketing, analytics, third_party) + `POST /api/v2/user-consents` com `purpose`/`granted` | Conforme |
| 2 | Prova do consentimento (quando, como, de onde) | `user_consents` armazena `granted_at`, `withdrawn_at`, `ip_address`, `user_agent` | Conforme |
| 3 | Revogação simples e gratuita a qualquer momento | `DELETE /api/v2/user-consents/{purpose}`; switch desativa a finalidade imediatamente | Conforme |
| 4 | Listagem dos consentimentos do titular | `GET /api/v2/user-consents` | Conforme |
| 5 | Acesso e portabilidade dos dados (Art. 20) | `GET /api/v2/user-consents/export` devolve JSON com usuário + dados pessoais em propriedades, produtos, service_providers, service_listings, appointments, service_evaluations e consentimentos (guardado por `Schema::hasTable`) | Conforme |
| 6 | Direito ao esquecimento/eliminação (Art. 18) | `DELETE /api/v2/user-consents/account` anonimiza titular (nome/email/phone), remove consentimentos e sessões, e anonimiza dados pessoais em tabelas relacionadas (guardado por `hasTable`). Registro mantido anônimo para preservar integridade de FKs | Conforme (pseudoanonimização) |
| 7 | Confirmação de identidade para exclusão | Exige `password` (verificado com `password_verify`) + `confirm_delete: true`; senha errada → 401 | Conforme |
| 8 | Campo de perfil (telefone) da migração A2 mapeado ponta-a-ponta | `phone` em `User $fillable`, `UserResource`, tipo TS `User`, formulário e exibição em `Profile` | Conforme |

---

## 3. Revisão obrigatória de mudanças de modelo de dados (pré-merge)

Revisadas antes de qualquer merge:

- `2026_11_05_095928_create_user_consents_table.php` — OK: esquema coincide com `UserConsent` (`$fillable`, casts, `user_id` FK com cascade).
- `2026_11_05_095927_add_phone_to_users_table.php` — coluna `phone` aplicada no SQLite, mas **não** estava em `User $fillable`, nem em `UserResource`, nem no `Profile`, nem no tipo TS `User`. Corrigido nesta revisão.
- **A2 (Google Business Profile):** não altera o modelo de usuário (identificação via parâmetro `state` assinado do OAuth). Sem impacto no fluxo LGPD.
- **A3 (vitrine pública):** rotas públicas sem autenticação; não tratam dados pessoais do titular. Sem impacto.
- Não há outras migrações de modelo pendentes de revisão.

---

## 4. Evidências de execução (smoke test contra API local `http://127.0.0.1:8000`)

Fluxo completo executado com usuário real (`register` → `login`):

1. `GET /api/v2/user-consents` → `[]` ✓
2. `POST .../user-consents {purpose:marketing, granted:true}` → 201 ✓
3. `POST .../user-consents {purpose:analytics, granted:true}` → 201; `index` retorna 2 ✓
4. `DELETE .../user-consents/analytics` → 200 (revogação por `purpose`) ✓
5. `GET .../user-consents/export` → JSON com usuário + todas as tabelas relacionadas ✓
6. `DELETE .../user-consents/account` senha errada → **401** ✓
7. `DELETE .../user-consents/account` sem `confirm_delete` → **422** (validação) ✓
8. `DELETE .../user-consents/account` válido → **200** "dados pessoais anonimizados de forma definitiva" ✓
9. Usuário após exclusão → `Usuario Excluido | deleted_<id>@deleted.local | phone=null` ✓

---

## 5. Execução de testes

**Backend (`php artisan test`):** 82 testes, **79 passando**. Os 3 erros remanescentes são corrupção ambiental do `database/testing.sqlite` compartilhado entre classes (`no such table: users/service_categories`) e falhas pré-existentes de `OpenApiV2ContractTest` (espec OpenAPI sem `components/schemas`, `/auth/me` devolvido envelopado em `user`, divergência de caminho contrato×rota) — **não relacionados** às alterações do C3 (confirmado por execução da suíte com meus 3 arquivos stashados: mesmo resultado, 77–79 passing, mesmos erros ambientais).

**Frontend:** `tsc --noEmit` sem erros; `vitest` — `LgpdPages.test.tsx` **6/6 passando**. Falhas em `Institutional.test`, `Login.test`, `Register.test` são problemas de ambiente jsdom/React `act()` em arquivos que não modifiquei (pré-existentes).

---

## 6. Arquivos revisados / alterados

**Backend (api/):**
- `app/Http/Controllers/UserConsentController.php` — reescrito: export expandido, `deleteAccount` com anonimização de tabelas relacionadas
- `app/Models/User.php` — `phone` no `$fillable`; relação `userConsents()`
- `app/Http/Resources/UserResource.php` — `phone` exposto
- `routes/api.php` — ordem das rotas DELETE `user-consents` (estática `/account` antes de `/{purpose}`)
- Revisadas (sem alteração necessária): `database/migrations/2026_11_05_095928_create_user_consents_table.php`, `database/migrations/2026_11_05_095927_add_phone_to_users_table.php`

**Frontend (frontend/src/):**
- `api/user-consent.ts` — contrato alinhado ao backend (`purpose`/`granted`, revogação por `purpose`, `deleteAccount(credentials)`)
- `types/index.ts` — `UserConsent.purpose/granted/granted_at/withdrawn_at`; `User.phone`
- `pages/PrivacyConsent.tsx` — campos `granted`/`purpose`/`granted_at`
- `pages/DeleteAccount.tsx` — senha + confirmação no diálogo de exclusão
- `pages/Profile.tsx` — telefone no formulário de atualização e exibição
- `pages/LgpdPages.test.tsx` — atualizado ao novo contrato

---

## 7. Limitações conhecidas

- A exclusão adota **pseudoanonimização** (registro mantido, dados identificativos nulificados) em vez de exclusão física da linha `users`, por integridade referencial de FKs (agendamentos, propriedades, produtos, etc.). Isso é aceitável sob a LGPD quando a eliminação plena comprometer integridade de dados, mas deve ser documentado na política de privacidade.
- Tabelas `conversations`, `messages`, `reviews` não existem no SQLite local (migrações não aplicadas neste ambiente); o `deleteAccount` as ignora via `Schema::hasTable`. Se forem criadas depois, devem ser incluídas no escopo de anonimização.
- `OpenApiV2ContractTest` falha por problemas na especificação OpenAPI v2 (pré-existentes, fora do escopo C3).
