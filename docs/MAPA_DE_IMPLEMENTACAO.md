# Mapa de Implementação

## Objetivo do próximo ciclo de desenvolvimento

O próximo ciclo deve tirar o projeto do estado de MVP predominantemente de leitura e entregar o primeiro fluxo transacional real, persistido, auditável e compatível com a arquitetura atual.

Fluxo inicial escolhido:

- criação de solicitação de liberação
- base já concluída: iniciar a solicitação, persistir dados mínimos, validar entrada, validar autenticação/autorização no backend e registrar auditoria mínima
- recorte atual: analisar e decidir a solicitação por item, persistindo valor aprovado, decisão, autorização backend e auditoria mínima
- fora do recorte atual: execução financeira, vínculo com lançamento bancário, upload S3 e autenticação corporativa completa

Escopo recomendado para este ciclo:

- estabilizar a base híbrida mock/Prisma sem quebrar as telas existentes
- criar a primeira camada de comandos de escrita no `src/server`
- implementar o primeiro fluxo ponta a ponta para solicitações de liberação
- registrar auditoria nas mutações
- adicionar testes mínimos para impedir regressão

Fora de escopo neste ciclo:

- reescrever toda a autenticação
- construir todos os CRUDs do sistema
- integrar storage S3
- criar importador histórico
- fazer hardening completo de produção

## Checklist por épico

### Épico 1: Estabilização da base

- [ ] Confirmar o contrato atual de `src/features/platform/types.ts` como fonte de verdade do app.
- [ ] Revisar `src/server/db/serializers.ts` para garantir alinhamento total com os tipos do app.
- [x] Remover a dependência direta do `tenant` mock na `Sidebar`, movendo a leitura para o layout autenticado via repositório.
- [ ] Definir onde ficará a futura camada de comandos de escrita em `src/server`.
- [ ] Cobrir com testes o comportamento mínimo de `platform.repository`, serializers e RBAC atual.

### Épico 2: Camada de comandos

- [x] Criar funções explícitas de escrita no `src/server` para o fluxo inicial.
- [ ] Garantir que cada comando valide pré-condições de domínio antes de gravar.
- [x] Garantir que cada comando use transação quando houver múltiplas gravações relacionadas.
- [x] Garantir que cada comando grave auditoria junto da mutação principal.
- [ ] Manter o contrato de retorno compatível com o restante do app.

### Épico 3: Fluxo inicial de criação de solicitação de liberação

- [x] Formalizar o recorte do fluxo inicial como criação de solicitação de liberação.
- [x] Implementar persistência do caso de uso escolhido usando Prisma.
- [x] Implementar server actions para o fluxo.
- [x] Implementar UI mínima para operar o fluxo sem espalhar regra de negócio na página.
- [x] Garantir autorização no backend para a ação executada.

### Épico 4: Análise/decisão da solicitação

- [x] Definir análise/decisão por item como próximo recorte do fluxo inicial.
- [x] Persistir decisão, valor aprovado e status agregado da solicitação.
- [x] Registrar `Approval` e `AuditLog` a cada decisão.
- [x] Expor UI mínima de análise na própria tela de liberações.
- [x] Separar operacionalmente exigência documental, análise e decisão agregada na leitura da solicitação.
- [x] Consolidar aprovação administrativa posterior da solicitação com registro explícito em `Approval`.
- [x] Consolidar o preparo da futura execução financeira sem criar execução bancária real.
- [x] Consolidar a execução financeira efetiva com vínculo controlado a `ReleaseExecution` e `BankEntry`.
- [ ] Expandir a cobertura para múltiplos itens por solicitação com UX mais refinada.
- [x] Definir com mais precisão a fronteira entre aprovação administrativa posterior e execução financeira.

### Épico 5: Exposição controlada no app

- [x] Conectar a UI existente ao fluxo persistido.
- [x] Atualizar consultas e telas impactadas pelo novo dado transacional.
- [x] Consolidar a leitura documental da solicitação com distinção entre documentos esperados na etapa atual, pendências atuais e documentos previstos para etapa posterior.
- [ ] Evitar duplicar regra entre página, API e comando.
- [ ] Se houver rota HTTP nova, manter a mesma regra de negócio centralizada no servidor.

### Épico 6: Proteção contra regressão

- [x] Adicionar teste mínimo de validação do fluxo inicial e script `npm test`.
- [x] Validar `typecheck`, `lint` e testes do fluxo.
- [ ] Validar que o modo sem `DATABASE_URL` continua funcional, se ele for mantido nesta etapa.
- [ ] Validar que o modo com `DATABASE_URL` reflete corretamente o fluxo novo.

## Dependências entre tarefas

### Dependências estruturais

- Nenhuma mutação deve ser implementada antes de fechar o contrato entre `types`, `serializers` e repositório.
- Nenhuma tela de edição deve nascer antes de existir um comando de escrita claro no `src/server`.
- Nenhuma auditoria útil existe sem mutação real; logo, auditoria operacional depende do épico de comandos.
- Nenhuma autorização fina por ação deve ser implementada de forma séria antes de os casos de uso estarem definidos.

### Dependências por épico

- Épico 2 depende do Épico 1.
- Épico 3 depende do Épico 2.
- Épico 4 depende do Épico 3.
- Épico 5 depende do Épico 4.
- Épico 6 depende de todos os anteriores.

### Dependências por fluxo

- Criar solicitação depende de:
  `ReleaseRequest`, `ReleaseRequestItem`, validação de entrada, autenticação e auditoria mínima.
- Analisar e decidir solicitação depende de:
  regra de autorização por perfil, persistência do estado e registro de auditoria.
- Executar financeiramente depende de:
  decisão anterior persistida, vínculo com `BankEntry` ou estratégia explícita para isso.

## Definição de pronto por etapa

### Etapa 1: Base estabilizada

Pronto quando:

- o contrato de dados do app estiver documentado e coerente com serializers e repository
- não houver novo componente de UI lendo mock diretamente quando deveria ler query
- houver testes mínimos para repository, serializers e autorização atual

### Etapa 2: Comandos implementados

Pronto quando:

- existir camada de escrita separada das páginas
- o comando principal usar Prisma corretamente
- falhas de validação retornarem erro previsível
- a auditoria mínima for gravada junto da mutação

### Etapa 3: Fluxo inicial operacional

Pronto quando:

- um caso de uso real puder ser executado de ponta a ponta
- a UI acionar server action ou comando sem duplicar regra
- o dado aparecer corretamente nas páginas de leitura impactadas
- a autorização existir também no backend

### Etapa 4: Proteção contra regressão

Pronto quando:

- `typecheck` passar
- `lint` passar
- houver teste cobrindo o fluxo novo
- o comportamento esperado estiver estável tanto no modo mock quanto no modo Prisma, se ambos continuarem ativos

## Riscos por etapa

### Etapa 1

- risco de consolidar um contrato inconsistente entre mock e Prisma
- risco de tratar como pronto um tipo que ainda não cobre mutações reais

### Etapa 2

- risco de colocar regra de negócio dentro de route handler ou page
- risco de criar escrita sem transação e sem auditoria
- risco de acoplar a nova camada diretamente ao formato Prisma e quebrar o contrato do app

### Etapa 3

- risco de implementar apenas UI com persistência incompleta
- risco de autorizar pela navegação, mas não pela operação server-side
- risco de escolher um fluxo inicial grande demais e travar o ciclo

### Etapa 4

- risco de regressão silenciosa no modo mock
- risco de testes cobrirem apenas caminho feliz
- risco de criar APIs paralelas com regra duplicada

## Ordem recomendada de execução

1. Estabilizar o contrato de dados do app.
2. Corrigir pontos de acoplamento direto ao mock.
3. Criar a camada de comandos no `src/server`.
4. Adotar explicitamente o fluxo inicial de criação de solicitação de liberação.
5. Implementar persistência, validação, autorização e auditoria da criação.
6. Implementar a análise/decisão por item como continuação imediata do mesmo fluxo.
7. Expor o fluxo na UI via server action.
8. Atualizar telas de leitura impactadas.
9. Adicionar testes do fluxo e validar `typecheck` e `lint`.

Regras de ordem para futuros agentes:

- Não começar por telas novas se não houver comando de escrita definido.
- Não criar rota HTTP de mutação se a regra ainda não existir em camada central.
- Não mexer em autenticação completa antes de fechar o primeiro fluxo transacional.
- Não avançar para S3, importador ou produção antes de existir pelo menos um fluxo persistido e auditável.

## Decisões que devem ser registradas caso algo arquitetural mude

Registrar explicitamente em documentação se qualquer uma das decisões abaixo mudar:

- abandono ou manutenção do modo híbrido mock/Prisma
- mudança no contrato de `src/features/platform/types.ts`
- criação de nova camada arquitetural entre `features` e `server`
- mudança da estratégia de autenticação local para solução externa ou biblioteca dedicada
- mudança do ponto central de autorização
- mudança do local da regra de negócio de mutação
- mudança do padrão de auditoria obrigatória
- mudança do fluxo inicial priorizado
- mudança relevante na convenção do Next.js usada pelo projeto, especialmente `proxy`, `cookies()`, `headers()` e server actions

Cada decisão registrada deve conter:

- o que mudou
- por que mudou
- quais arquivos passaram a ser a nova fonte de verdade
- quais documentos ficaram obsoletos e precisam ser atualizados
- impacto na ordem de execução do mapa

## Guia rápido para futuros agentes

- Use `docs/CONTINUIDADE_DO_PROJETO.md` para contexto amplo.
- Use este arquivo para escolher a próxima tarefa em ordem segura.
- Antes de implementar mutações, revise `src/server/repositories/platform.repository.ts`, `src/server/db/serializers.ts`, `src/features/platform/types.ts` e `prisma/schema.prisma`.
- Antes de alterar comportamento sensível do Next.js, consulte `AGENTS.md` e a documentação local em `node_modules/next/dist/docs`.
- Se surgir dúvida entre “entregar UI” e “fechar comando e auditoria”, priorize comando e auditoria.

## Adequacao normativa 2026-04-20

Hierarquia normativa a observar neste mapa:

1. Lei no 14.133/2021, art. 121
2. Resolucao CNJ no 651, de 29 de setembro de 2025
3. Resolucao CNJ no 169/2013 apenas para contratos assinados antes de 29 de setembro de 2025
4. Caderno de Logistica de 2018 apenas como referencia operacional subsidiaria

Ajuste de ordem de execucao:

- nenhum fluxo novo deve ignorar o `normativeRegime` do contrato;
- nenhuma evolucao do modulo de liberacoes deve assumir um unico modo de movimentacao da conta vinculada;
- banco publico oficial, termo de cooperacao e documentos de operacao bancaria devem ser tratados como preparacao obrigatoria do dominio, ainda que sem integracao bancaria real;
- saldo remanescente, sucessao contratual, garantia rescisoria e prazos de 10 dias uteis ficam no backlog normativo explicito e nao devem ser implementados de forma ad hoc fora da camada de comandos e da documentacao correspondente.

Proximo passo recomendado apos esta rodada:

- expandir a execução financeira para cenários de execução parcial, reaproveitamento controlado de lançamento bancário e fechamento operacional da conciliação.

## Sincronizacao obrigatoria com o manual do usuario

`docs/MANUAL_DO_USUARIO.md` deve ser atualizado em toda entrega que altere o comportamento funcional do sistema.

`docs/HOMOLOGACAO_FUNCIONAL.md` deve acompanhar mudancas que afetem a validacao operacional do comportamento entregue.

Isso inclui, no minimo:

- novas telas ou remocao de telas;
- mudanca de campos, filtros ou nomenclaturas;
- mudanca de status, pendencias ou alertas;
- alteracao de fluxo operacional;
- alteracao de permissao funcional por perfil;
- disponibilizacao ou retirada de operacoes para o usuario final.

Uma tarefa funcional nao deve ser tratada como concluida se essa sincronizacao documental nao acontecer no mesmo ciclo.

### Atualiza��o da rodada

- [x] Expandir a execu��o financeira para cen�rios de execu��o parcial, com m�ltiplos `ReleaseExecution` por solicita��o.
- [x] Recalcular valor executado acumulado e valor pendente de execu��o sem duplicar regra fora do backend.
- [x] Manter a solicita��o como `liberada` apenas quando o pendente de execu��o chegar a zero.
- [x] Expor leitura m�nima de fechamento operacional da concilia��o.
- [ ] Consolidar fechamento formal e reabertura controlada da compet�ncia com ocorr�ncias de concilia��o.

### Atualizacao da rodada

- [x] Expandir a execucao financeira para cenarios de execucao parcial, com multiplos ReleaseExecution por solicitacao.
- [x] Recalcular valor executado acumulado e valor pendente de execucao sem duplicar regra fora do backend.
- [x] Manter a solicitacao como liberada apenas quando o pendente de execucao chegar a zero.
- [x] Expor leitura minima de fechamento operacional da conciliacao.
- [x] Consolidar fechamento formal e reabertura controlada da competencia com ocorrencias de conciliacao.
- [ ] Estruturar leitura historica minima das ocorrencias por competencia e criterios de tratamento operacional subsequente.

### Atualizacao da rodada

- [x] Estruturar leitura historica minima das ocorrencias por competencia.
- [x] Expor linha do tempo operacional derivada na conciliacao e no detalhe do contrato.
- [x] Diferenciar situacao atual, historico registrado e proxima acao sugerida.
- [x] Manter a recomendacao operacional como leitura derivada simples, sem criar workflow adicional.

### Atualizacao da rodada

- [x] Qualificar divergencias conciliatorias com classificacao operacional minima derivada.
- [x] Expor apontamentos simples por competencia sem criar fila de tarefas.
- [x] Adicionar filtros leves de acompanhamento na conciliacao.
- [x] Diferenciar tipo de problema, situacao atual e prioridade operacional.

### Atualizacao da rodada

- [x] Materializar itens conciliatorios minimos por competencia.
- [x] Permitir vinculo simples de item conciliatorio a lancamento bancario da mesma competencia.
- [x] Registrar justificativa minima da diferenca explicada sem criar nova etapa formal.
- [x] Expor na conciliacao e no detalhe do contrato a separacao entre diferenca explicada itemizada, diferenca explicada ainda sem item e diferenca nao explicada residual.

### Proximo bloco sugerido

- [ ] Consolidar criterios minimos de cobertura da diferenca explicada e revisao dirigida dos saldos ainda sem itemizacao.

### Atualizacao da rodada

- [x] Derivar grau simples de cobertura da diferenca explicada por competencia.
- [x] Expor percentual minimo de cobertura, saldo itemizado e saldo ainda sem itemizacao.
- [x] Diferenciar cobertura parcial, suficiente e completa sem criar workflow novo.
- [x] Expor recomendacao leve de revisao dirigida para saldo explicado ainda sem itemizacao relevante.

### Proximo bloco sugerido

- [ ] Qualificar minimamente as faixas de saldo explicado ainda sem itemizacao por origem operacional.

### Atualizacao da rodada

- [x] Classificar minimamente a origem operacional do saldo explicado ainda sem itemizacao.
- [x] Distinguir cobertura parcial de justificativa insuficiente e de saldo residual de baixa materialidade.
- [x] Manter a recomendacao de revisao dirigida coerente com a origem classificada.
- [x] Expor a mesma leitura na conciliacao e no detalhe do contrato.

### Proximo bloco sugerido

- [ ] Consolidar criterios minimos de priorizacao visual e filtros leves para faixas explicadas remanescentes.



### Atualizacao da rodada

- [x] Derivar prioridade visual minima para o saldo explicado ainda sem itemizacao.
- [x] Expor motivo principal da priorizacao com base na origem operacional remanescente.
- [x] Adicionar filtros leves para remanescente relevante, justificativa insuficiente, itemizacao em andamento e baixa materialidade.
- [x] Manter coerencia entre a conciliacao e o detalhe do contrato sem criar fila de tarefas.

### Proximo bloco sugerido

- [ ] Consolidar quadro resumido por contrato com cobertura, remanescente explicado e residual nao explicado para leitura gerencial minima.
