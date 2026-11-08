# 🔍 Observabilidade — Escopo C2 (GeoVintalie API)

Documenta o formato dos logs estruturados, os middlewares de observabilidade e os endpoints de health check e métricas da API (`api/`).

## 1. Logs estruturados em JSON

Canal padrão: **`json`** (`LOG_CHANNEL=json` em `.env`). Cada linha gravada em `storage/logs/laravel.log` é um objeto JSON de uma linha, pronto para consumo por sistemas de agregação de logs (Loki, ELK, CloudWatch, etc.).

### Formato de cada registro

```json
{
  "datetime": "2026-11-05T17:48:56.123456-03:00",
  "channel": "laravel",
  "level": 200,
  "level_name": "INFO",
  "message": "requerimento processado",
  "context": {
    "chave": "valor"
  },
  "extra": {
    "correlation_id": "c6c1d9e2-1111-4aaa-8a11-a11111111111",
    "service": "GeoVintalie",
    "environment": "production"
  }
}
```

| Campo | Origem | Descrição |
|---|---|---|
| `datetime` | Monolog | Data/hora do registro (ISO 8601 com fuso). |
| `channel` | Canal de log Laravel | Nome do canal (default: `laravel`). |
| `level` / `level_name` | Monolog | Nível numérico e texto (DEBUG, INFO, NOTICE, WARNING, ERROR, CRITICAL, ALERT, EMERGENCY). |
| `message` | Chamada de log | Mensagem principal. |
| `context` | Chamada de log | Dados adicionais passados no segundo argumento de `Log::info('msg', ['chave' => 'valor'])`. |
| `extra.correlation_id` | `App\Logging\CorrelationProcessor` | ID de correlação da requisição (veja seção 2). |
| `extra.service` | `config('app.name')` | Nome da aplicação. |
| `extra.environment` | `app()->environment()` | Ambiente (local, testing, production...). |

### Exemplo de uso

```php
use Illuminate\Support\Facades\Log;

Log::info('pagamento.processado', ['pedido_id' => 42, 'valor' => 129.90]);
Log::error('falha.integracao.google', ['erro' => $e->getMessage()]);
```

## 2. Correlation ID

Toda requisição recebe um `correlation_id` que aparece:
1. No cabeçalho de resposta `X-Correlation-ID`;
2. No campo `extra.correlation_id` de **todos** os logs emitidos durante a requisição.

### Fluxo

1. Middleware `App\Http\Http\Middleware\CorrelationIdMiddleware` (registrado globalmente em `bootstrap/app.php`);
2. Lê o header `X-Correlation-ID` da requisição. Se ausente ou não for um UUID válido, gera um UUID v4;
3. Armazena em `App\Observability\CorrelationContext`;
4. O processador `App\Logging\CorrelationProcessor` injeta o ID em cada registro de log;
5. O ID é reenviado no header de resposta `X-Correlation-ID` e o contexto é limpo ao término.

```http
GET /api/v2/health
X-Correlation-ID: c6c1d9e2-1111-4aaa-8a11-a11111111111
```

```http
HTTP/1.1 200 OK
X-Correlation-ID: c6c1d9e2-1111-4aaa-8a11-a11111111111

{"status":"ok","correlation_id":"c6c1d9e2-1111-4aaa-8a11-a11111111111",...}
```

## 3. Middlewares (globais)

Registrados em `bootstrap/app.php` via `$middleware->append(...)`:

| Middleware | Responsabilidade |
|---|---|
| `CorrelationIdMiddleware` | Gera/propaga `X-Correlation-ID` e vincula ao contexto de log. |
| `MetricsMiddleware` | Mede latência e registra requisições/erros por endpoint e status code no `MetricsRegistry`. |

## 4. Endpoints de observabilidade

Todos sob o prefixo `/api/v2` (definidos em `routes/api.php`).

### GET /api/v2/health — Health check

Controlador: `App\Http\Controllers\Observability\HealthController`

Verifica banco de dados, cache e diretório de logs.

```json
{
  "status": "ok",
  "checked_at": "2026-11-05T17:48:56-03:00",
  "service": "GeoVintalie",
  "environment": "production",
  "correlation_id": "c6c1d9e2-1111-4aaa-8a11-a11111111111",
  "checks": {
    "database": { "status": "ok" },
    "cache": { "status": "ok" },
    "logs": { "status": "ok" }
  }
}
```

Retorna `200` quando tudo está saudável, `503` caso contrário.

### GET /api/v2/metrics — Métricas de negócio

Controlador: `App\Http\Controllers\Observability\MetricsController`

Fonte: `App\Observability\MetricsRegistry` (singleton in-memory, resetado a cada teste).

```json
{
  "service": "GeoVintalie",
  "environment": "production",
  "checked_at": "2026-11-05T17:48:56-03:00",
  "metrics": {
    "requests": {
      "total": 42,
      "by_endpoint": { "v2/health": 10, "v2/service-providers": 32 },
      "by_status": { "status:200": 40, "status:404": 2 }
    },
    "errors": {
      "total": 2,
      "by_endpoint": { "v2/health": 2 },
      "by_status": { "status:500": 2 }
    },
    "latency": {
      "by_endpoint": {
        "v2/health": {
          "count": 10,
          "avg_ms": 12.34,
          "sum_ms": 123.4,
          "buckets": { "<5ms": 3, "<50ms": 7 }
        }
      }
    }
  }
}
```

- `requests`: total de requisições, por endpoint e por status.
- `errors`: total de erros (exceções capturadas pelo middleware), por endpoint e status.
- `latency`: contagem, média em ms, soma em ms e histogramas por bucket (`<5ms`, `<50ms`, `<100ms`, `<250ms`, `<500ms`, `<1000ms`, `<2000ms`, `>2000ms`).

## 5. Arquivos envolvidos

| Caminho | Função |
|---|---|
| `api/routes/api.php` | Rotas `GET /api/v2/health` e `GET /api/v2/metrics`. |
| `api/bootstrap/app.php` | Registra os middlewares globais de observabilidade. |
| `api/app/Http/Middleware/CorrelationIdMiddleware.php` | Geração/propagação do correlation ID. |
| `api/app/Http/Middleware/MetricsMiddleware.php` | Coleta de latência, requisições e erros. |
| `api/app/Observability/CorrelationContext.php` | Contexto estático do correlation ID por requisição. |
| `api/app/Observability/MetricsRegistry.php` | Registro e snapshot das métricas. |
| `api/app/Logging/CorrelationProcessor.php` | Processador Monolog: injeta `correlation_id`, `service`, `environment` em `extra`. |
| `api/config/logging.php` | Canal `json` com `JsonFormatter`; `default = json`. |
| `api/app/Http/Controllers/Observability/HealthController.php` | Endpoint de health check. |
| `api/app/Http/Controllers/Observability/MetricsController.php` | Endpoint de métricas. |

## 6. Testes

```bash
cd api
vendor/bin/phpunit --filter ObservabilityTest
vendor/bin/phpunit --filter CorrelationProcessorTest
```

- `tests/Feature/ObservabilityTest.php`: health endpoint, métricas, geração/eco do correlation ID, rota desconhecida e log estruturado JSON.
- `tests/Unit/Logging/CorrelationProcessorTest.php`: injeção dos campos no registro do Monolog.