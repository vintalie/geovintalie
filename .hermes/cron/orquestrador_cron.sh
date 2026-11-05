#!/bin/bash
# =============================================================================
# CRON JOB - Orquestrador de Agentes GeoVintalie
# Execucao periodica para monitorar e dar continuidade nas tarefas pendentes
# =============================================================================

PROJECT_DIR="/home/mario/Documentos/geovintalie"
LOG_FILE="/home/mario/Documentos/geovintalie/.hermes/cron/orquestrador_$(date +%Y%m%d_%H%M%S).log"

echo "========================================================" >> "$LOG_FILE"
echo "CRON JOB ORQUESTRADOR - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "========================================================" >> "$LOG_FILE"

cd "$PROJECT_DIR" || exit 1

# Verificar se ha subagentes em andamento
echo "[INFO] Verificando subagentes em andamento..." >> "$LOG_FILE"
delegate_task action=list 2>&1 | tee -a "$LOG_FILE"

echo "" >> "$LOG_FILE"
echo "[INFO] Resumo do estado atual do projeto:" >> "$LOG_FILE"

# Verificar se a API esta rodando
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/ 2>/dev/null | grep -q "200"; then
    echo "[OK] API Laravel rodando em http://127.0.0.1:8000" >> "$LOG_FILE"
else
    echo "[WARN] API Laravel NAO esta rodando. Iniciar com: cd api && php artisan serve" >> "$LOG_FILE"
fi

# Verificar se o frontend esta rodando
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ 2>/dev/null | grep -q "200"; then
    echo "[OK] Frontend Vite rodando em http://localhost:5173" >> "$LOG_FILE"
else
    echo "[WARN] Frontend Vite NAO esta rodando. Iniciar com: cd frontend && npm run dev" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
echo "========================================================" >> "$LOG_FILE"
echo "PROMPT PARA PROXIMA EXECUCAO DO ORQUESTRADOR" >> "$LOG_FILE"
echo "========================================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "Ao ser reativado, o Orquestrador deve executar as seguintes acoes:" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "1. Verificar se os subagentes em background terminaram:" >> "$LOG_FILE"
echo "   - delegate_task(action='list')" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "2. Se algum subagente terminou, verificar os resultados:" >> "$LOG_FILE"
echo "   - Validar se os arquivos modificados estao corretos" >> "$LOG_FILE"
echo "   - Verificar se os testes PHPUnit e Vite passaram" >> "$LOG_FILE"
echo "   - Verificar se o build do frontend passou" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "3. Se todos os subagentes do R2 terminaram:" >> "$LOG_FILE"
echo "   - Fazer commit das mudancas na branch feature/scopes-r2-2026" >> "$LOG_FILE"
echo "   - Fazer push para o GitHub" >> "$LOG_FILE"
echo "   - Abrir PR para mesclar feature/scopes-r2-2026 em main" >> "$LOG_FILE"
echo "   - Fazer merge do PR em main" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "4. Iniciar o R3 (proximo ciclo):" >> "$LOG_FILE"
echo "   - A4: Geração automática de sites/landing pages SEO local" >> "$LOG_FILE"
echo "   - A5: Relatórios de inteligência (mapas de calor)" >> "$LOG_FILE"
echo "   - A6: Módulo 'Quero Revender' (leads B2B indústria → lojista)" >> "$LOG_FILE"
echo "   - B3: Recomendação por IA a partir da descrição do problema" >> "$LOG_FILE"
echo "   - B6: Mensageria com histórico e compartilhamento de arquivos" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "5. Para cada tarefa do R3:" >> "$LOG_FILE"
echo "   - Criar branch: git checkout -b fix/<issue>-<descricao>" >> "$LOG_FILE"
echo "   - Delegar para agente EXECUTOR específico" >> "$LOG_FILE"
echo "   - Apos conclusao, validar com VALIDADOR" >> "$LOG_FILE"
echo "   - Se aprovado, encaminhar para PUBLICADOR" >> "$LOG_FILE"
echo "" >> "$LOG_file"
echo "6. Atualizar .hermes/RELATORIO_LACUNAS.md com o status de cada requisito" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "7. Configurar notificacoes via WhatsApp 13 981412290 ao concluir marcos" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "PERFIS OPENROUTER: Usar sempre 'kilo nvidia/nemotron-3.5-super-vl:free'" >> "$LOG_FILE"
echo "" >> "$LOG_file"
echo "FIM DO PROMPT - $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "========================================================" >> "$LOG_FILE"

echo ""
echo "Cron job executado. Log salvo em: $LOG_FILE"
echo "Prompt para proxima execucao foi gerado no proprio arquivo de log."