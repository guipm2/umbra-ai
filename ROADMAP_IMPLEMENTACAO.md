# Roadmap de Implementacao - Umbra AI

## Objetivo
Evoluir o projeto com foco em qualidade tecnica, estabilidade de release e produtividade de desenvolvimento.

## Regra de execucao
- Cada melhoria vira um commit proprio.
- Cada commit deve usar mensagem padronizada em portugues.
- Cada commit deve ser enviado ao repositorio imediatamente apos validacao local.

## Linha de base atual
- Lint frontend: 0 warnings, 0 errors.
- Typecheck frontend: passando.
- Testes backend: passando.

## Fase 1 - Higiene de lint (curto prazo)
### Meta
Reduzir warnings sem mudar comportamento de negocio.

### Ordem
1. Corrigir warnings de imagens:
- no-img-element
- alt-text

2. Corrigir warnings de hooks:
- exhaustive-deps restantes

3. Corrigir warnings de simbolos nao utilizados:
- imports e variaveis locais

### Criterio de aceite da fase
- Sem erros de lint.
- Warning total significativamente menor.
- Typecheck passando.

## Fase 2 - Tipagem e contratos (medio prazo)
### Meta
Aumentar seguranca de refatoracao e reduzir bugs de integracao.

### Ordem
1. Reduzir uso de any remanescente no frontend.
2. Tipar melhor respostas dos endpoints consumidos por paginas principais.
3. Padronizar tipos compartilhados para payloads de API.

### Criterio de aceite da fase
- Warning de no-explicit-any reduzido de forma consistente.
- Fluxos principais com tipagem mais estrita.

## Fase 3 - Qualidade de pipeline (medio prazo)
### Meta
Evitar regressao de qualidade no CI.

### Ordem
1. Ajustar CI para falhar se warnings crescerem acima da linha de base definida.
2. Restaurar gradualmente regras de lint mais estritas para erro.

### Criterio de aceite da fase
- Pipeline bloqueia regressao de qualidade.
- Regras estritas reativadas com seguranca.

### Status
- Concluida com:
- CI exigindo lint com `--max-warnings=0`.
- CI exigindo `npm run typecheck`.
- Regra `@typescript-eslint/no-explicit-any` elevada para erro.

## Fase 4 - Observabilidade e confiabilidade (medio/longo prazo)
### Meta
Melhorar deteccao e diagnostico de problemas em producao.

### Ordem
1. Expandir metricas com p95/p99 por endpoint e agente.
2. Definir alertas de erro/latencia.
3. Melhorar rastreio por request id ponta-a-ponta.

### Criterio de aceite da fase
- Metricas e alertas acionaveis disponiveis para operacao.

### Status
- Concluida.
- Passo 10.1 concluido: metricas p95/p99 adicionadas por endpoint e por agente no resumo admin.
- Passo 10.2 concluido: alertas iniciais de erro e latencia definidos com thresholds operacionais.
- Passo 10.3 concluido: rastreio ponta-a-ponta reforcado com request id no cliente e no painel admin.

## Fase 5 - Produto e UX (longo prazo)
### Meta
Aumentar valor percebido e eficiencia de uso.

### Ordem
1. Evoluir painel admin para visao temporal.
2. Melhorar biblioteca de copys com filtros e acoes rapidas.
3. Evoluir Brain para gestao completa de arquivos.

### Criterio de aceite da fase
- Fluxos mais rapidos para operacao diaria.

## Proximo passo imediato
Iniciar Fase 5 com evolucao do painel admin para visao temporal inicial de metricas.
