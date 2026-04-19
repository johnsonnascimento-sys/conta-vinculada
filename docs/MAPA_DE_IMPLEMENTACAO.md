# Mapa de Implementação

## Objetivo do próximo ciclo de desenvolvimento

O próximo ciclo deve tirar o projeto do estado de MVP predominantemente de leitura e entregar o primeiro fluxo transacional real, persistido, auditável e compatível com a arquitetura atual.

Fluxo inicial escolhido:

- criação de solicitação de liberação
- recorte atual: iniciar a solicitação, persistir dados mínimos, validar entrada, validar autenticação/autorização no backend e registrar auditoria mínima
- fora do recorte atual: aprovação, glosa, execução financeira, upload S3 e autenticação corporativa completa

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
- [ ] Remover dependências diretas de mock em componentes que deveriam depender de query ou repository.
- [ ] Definir onde ficará a futura camada de comandos de escrita em `src/server`.
- [ ] Cobrir com testes o comportamento mínimo de `platform.repository`, serializers e RBAC atual.

### Épico 2: Camada de comandos

- [ ] Criar funções explícitas de escrita no `src/server` para o fluxo inicial.
- [ ] Garantir que cada comando valide pré-condições de domínio antes de gravar.
- [ ] Garantir que cada comando use transação quando houver múltiplas gravações relacionadas.
- [ ] Garantir que cada comando grave auditoria junto da mutação principal.
- [ ] Manter o contrato de retorno compatível com o restante do app.

### Épico 3: Fluxo inicial de criação de solicitação de liberação

- [x] Formalizar o recorte do fluxo inicial como criação de solicitação de liberação.
- [ ] Implementar persistência do caso de uso escolhido usando Prisma.
- [ ] Implementar server actions para o fluxo.
- [ ] Implementar UI mínima para operar o fluxo sem espalhar regra de negócio na página.
- [ ] Garantir autorização no backend para a ação executada.

### Épico 4: Exposição controlada no app

- [ ] Conectar a UI existente ao fluxo persistido.
- [ ] Atualizar consultas e telas impactadas pelo novo dado transacional.
- [ ] Evitar duplicar regra entre página, API e comando.
- [ ] Se houver rota HTTP nova, manter a mesma regra de negócio centralizada no servidor.

### Épico 5: Proteção contra regressão

- [ ] Adicionar testes do fluxo inicial.
- [ ] Validar `typecheck` e `lint`.
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
- Épico 5 depende de todos os anteriores.

### Dependências por fluxo

- Criar solicitação depende de:
  `ReleaseRequest`, `ReleaseRequestItem`, validação de entrada, autenticação e auditoria mínima.
- Aprovar ou glosar solicitação depende de:
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
5. Implementar persistência, validação, autorização e auditoria desse fluxo.
6. Expor o fluxo na UI via server action.
7. Atualizar telas de leitura impactadas.
8. Adicionar testes do fluxo e validar `typecheck` e `lint`.

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
