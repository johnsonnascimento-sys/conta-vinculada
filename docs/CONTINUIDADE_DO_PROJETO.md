# Continuidade do Projeto

## Atualizacao normativa obrigatoria

Desde 20 de abril de 2026, a referencia normativa principal deste projeto passou a ser:

- Lei no 14.133/2021, especialmente art. 121, caput, paragrafos 2o, 3o e 4o
- Resolucao CNJ no 651, de 29 de setembro de 2025

Consequencia pratica para o sistema:

- contratos assinados ate 29 de setembro de 2025 devem permanecer identificaveis como sujeitos ao regime da Resolucao CNJ no 169/2013, conforme art. 18 da Resolucao CNJ no 651/2025;
- contratos assinados apos 29 de setembro de 2025 devem ser tratados sob o regime da Resolucao CNJ no 651/2025;
- o Caderno de Logistica de 2018 deixa de ser fonte normativa principal e passa a ser apenas referencia operacional subsidiaria, no que nao contrariar a Lei no 14.133/2021 e a Resolucao CNJ no 651/2025.

Esta rodada ajustou o schema, o contrato tipado e o fluxo de `ReleaseRequest` para refletir:

- regime normativo por contrato;
- modo de movimentacao da conta vinculada;
- preparacao para banco publico oficial e termo de cooperacao;
- matriz documental mais aderente ao novo marco normativo.

## 1. Visão geral do projeto

Este repositório implementa um MVP web para gestão institucional de conta vinculada em contratos administrativos com dedicação exclusiva de mão de obra. O sistema organiza a visão operacional de contratos, provisões por empregado e rubrica, solicitações de liberação, conciliação bancária e eventos de auditoria em um backoffice único.

O problema que o sistema endereça é a fragmentação operacional típica desse domínio: saldo bancário real da conta vinculada, provisões gerenciais, decisões administrativas, documentação e reconciliação tendem a ficar dispersos em planilhas e controles paralelos. A solução atual centraliza leitura e navegação desses dados, com distinção explícita entre saldo bancário do contrato e provisão gerencial por empregado.

Os usuários materializados no código são perfis internos do órgão, não usuários externos da contratada. Os perfis já previstos são:

- Administrador do órgão
- Analista
- Financeiro
- Auditoria interna

O estágio atual do projeto é de MVP navegável com foco em consulta e demonstração operacional. O sistema já possui layout institucional, login local, autorização por perfil, páginas do backoffice, rotas `GET`, dados seed e leitura híbrida entre mock em memória e Prisma. Ainda não há fluxos transacionais completos de negócio.

O primeiro fluxo transacional formalmente priorizado para sair desse estado é a criação de solicitação de liberação. Essa base já existe no código com validação, server action, comando server-side, persistência via Prisma, auditoria mínima e comportamento explícito de somente leitura quando não há `DATABASE_URL`. O recorte imediatamente seguinte, já operável na própria fila do módulo de liberações, é a análise/decisão da solicitação por item, ainda sem entrar em execução financeira.

## 2. Estado atual implementado

### Frontend e navegação

O frontend usa App Router em `src/app`, com landing page em `src/app/page.tsx`, login em `src/app/login/page.tsx` e área autenticada em `src/app/(dashboard)`.

Há páginas navegáveis para:

- painel institucional em `src/app/(dashboard)/dashboard/page.tsx`
- contratos em `src/app/(dashboard)/dashboard/contracts/page.tsx`
- detalhe de contrato em `src/app/(dashboard)/dashboard/contracts/[contractId]/page.tsx`
- liberações em `src/app/(dashboard)/dashboard/releases/page.tsx`
- conciliação em `src/app/(dashboard)/dashboard/reconciliation/page.tsx`
- auditoria em `src/app/(dashboard)/dashboard/audit/page.tsx`
- administração em `src/app/(dashboard)/dashboard/admin/page.tsx`

O shell autenticado é composto por `src/app/(dashboard)/layout.tsx`, `src/features/shell/queries.ts` e `src/shared/components/ui/sidebar.tsx`. A navegação lateral já respeita o perfil do usuário.

O design system é simples e próprio do projeto, apoiado por componentes reutilizáveis em `src/shared/components/ui`, especialmente:

- `badge.tsx`
- `metric-chip.tsx`
- `section-card.tsx`
- `stat-card.tsx`
- `table-card.tsx`
- `sidebar.tsx`

O estilo global está em `src/app/globals.css`, com tokens de cor e tipografia via Tailwind CSS v4 e `next/font`.

O que parece pronto:

- navegação principal entre páginas
- composição visual consistente
- leitura server-side das consultas
- diferenciação visual entre landing page, login e backoffice

O que parece MVP/demo:

- telas são majoritariamente de leitura
- não há formulários de negócio além do login
- não há estados de loading, empty state e erro mais sofisticados
- não há componentes de edição, wizard, upload ou aprovação operacional

### Autenticação e autorização

A autenticação local está implementada com:

- ação de login/logout em `src/features/auth/actions.ts`
- autenticação por credencial simples em `src/server/auth/credentials.ts`
- sessão em cookie assinado em `src/server/auth/session.ts`
- assinatura HMAC do token em `src/server/auth/crypto.ts`
- constantes de sessão em `src/server/auth/constants.ts`

A autorização é feita por perfil e rota com:

- `src/features/auth/permissions.ts`
- `src/features/auth/queries.ts`
- `src/proxy.ts`

`src/proxy.ts` protege `/dashboard` e redireciona conforme sessão e role. O projeto já usa a convenção `proxy.ts`, alinhada ao Next.js 16, em vez da convenção antiga `middleware.ts`.

O que parece pronto:

- login local funcional
- sessão persistida por cookie HTTP-only
- redirecionamento para `/login` quando não autenticado
- bloqueio de rotas do backoffice por perfil

O que parece MVP/demo:

- senha única de desenvolvimento via `AUTH_DEV_PASSWORD`
- autenticação baseada em usuários seed
- ausência de hash de senha, MFA real, recuperação de conta, gestão de credenciais ou identidade federada
- autorização concentrada em rotas de UI e `proxy`, sem evidência de políticas mais finas por operação

### Domínio e modelagem

O domínio tipado está em `src/features/platform/types.ts` e os dados em memória estão em `src/features/platform/data.ts`.

O schema Prisma em `prisma/schema.prisma` modela as entidades principais do domínio:

- `Tenant`
- `Organization`
- `Company`
- `Contract`
- `ContractParameter`
- `Employee`
- `EmployeeAllocation`
- `Competency`
- `PayrollEntry`
- `ProvisionEntry`
- `ProvisionBalance`
- `LinkedAccount`
- `BankEntry`
- `BankReconciliation`
- `BankReconciliationItem`
- `ReleaseRequest`
- `ReleaseRequestItem`
- `Approval`
- `ReleaseExecution`
- `Document`
- `User`
- `AuditLog`

Também há enums explícitos para status de contrato, competência, solicitação, aprovação, tipos de documento, workflow e origem de provisão.

O que parece pronto:

- vocabulário central do domínio
- tipagem do frontend e das queries
- modelo relacional inicial coerente com o problema do produto

O que parece parcial:

- parte relevante do schema ainda não é usada pelas telas atuais
- não há evidência de regras transacionais materializadas para entidades como `Approval`, `ReleaseExecution`, `PayrollEntry` e `BankReconciliationItem`
- `ContractParameter.payload` e outros campos JSON ainda parecem mais estruturais do que operacionais

### Persistência e repositórios

A estratégia de persistência atual é híbrida.

Sem `DATABASE_URL`:

- a aplicação usa dados em memória a partir de `src/features/platform/data.ts`

Com `DATABASE_URL`:

- a aplicação passa a ler do banco via Prisma usando `src/server/db/prisma.ts`
- os objetos são serializados para o formato consumido pelo app em `src/server/db/serializers.ts`
- a camada de acesso central fica em `src/server/repositories/platform.repository.ts`

O repositório hoje expõe apenas operações de leitura, como:

- `getTenant`
- `getOrganizations`
- `getContracts`
- `getCompanies`
- `getEmployees`
- `getAllocations`
- `getCompetencies`
- `getProvisionBalances`
- `getBankAccounts`
- `getBankEntries`
- `getReleaseRequests`
- `getReconciliations`
- `getAuditEvents`
- `getUsers`

O que parece pronto:

- fallback controlado para memória
- ligação com Prisma para leitura
- adaptação de `Decimal` e `Date` para os tipos do app

O que parece parcial ou frágil:

- não existe DAL completa de escrita
- não há transações de negócio (`$transaction`) materializadas
- a lógica de leitura agrega dados em `src/features/contracts/queries.ts` e `src/features/dashboard/queries.ts`, mas ainda sem comandos correspondentes de mutação
- o fallback memória e o modo Prisma não possuem a mesma cobertura funcional de evolução, apenas de leitura

### APIs e rotas

As rotas HTTP implementadas em `src/app/api` são:

- `src/app/api/dashboard/summary/route.ts`
- `src/app/api/contracts/route.ts`
- `src/app/api/contracts/[contractId]/route.ts`

Todas expõem somente `GET`.

Não foram encontrados handlers `POST`, `PUT`, `PATCH` ou `DELETE` no diretório `src/app/api`.

O que parece pronto:

- leitura programática do resumo do dashboard
- leitura de contratos e detalhe do contrato

O que parece MVP/demo:

- ausência de API transacional
- ausência de rotas para criação, edição, workflow, upload, aprovação ou reconciliação

### Dados de seed

O seed está em `prisma/seed.ts` e popula:

- tenant e organização
- empresas
- contratos
- contas vinculadas
- parâmetros contratuais
- empregados e alocações
- competências
- saldos e lançamentos de provisão
- solicitações de liberação
- documentos ligados às solicitações
- conciliações
- usuários
- auditoria

O arquivo `.env.example` existe na raiz do projeto e documenta `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `AUTH_SECRET` e `AUTH_DEV_PASSWORD`.

O que parece pronto:

- seed suficiente para demonstrar navegação relevante
- usuários internos de exemplo
- dataset coerente com as páginas atuais

O que parece parcial:

- o seed simula cenários importantes, mas não representa operação real
- parte do domínio do schema não recebe seed abrangente
- não há importação de histórico externo ou migração de legado

### Componentes compartilhados

Os utilitários compartilhados estão em `src/shared`.

Arquivos relevantes:

- `src/shared/lib/formatters.ts`
- `src/shared/lib/utils.ts`
- `src/shared/components/ui/*`

Eles concentram formatação de moeda, percentual, competência, composição de classes e blocos de apresentação.

O que parece pronto:

- camada pequena e objetiva de componentes compartilhados
- reaproveitamento visual entre telas

O que parece MVP:

- ausência de componentes de formulário
- ausência de feedback de erro carregável, toasts, modais de decisão e uploads

## 3. Arquitetura atual

### `src/app`

É a camada de rotas, layouts e route handlers do App Router. Também concentra a landing page, login, páginas autenticadas e APIs HTTP.

Papéis observados:

- `layout.tsx` e `globals.css` definem a base visual global
- `page.tsx` representa a entrada pública
- `login/page.tsx` contém a UI de autenticação
- `(dashboard)` organiza o backoffice autenticado
- `api/*` expõe endpoints de leitura

### `src/features`

É a camada de domínio de aplicação e consultas agregadas. Reúne tipos, mocks de negócio, autenticação, queries do dashboard e consultas de contratos.

Papéis observados:

- `platform` concentra tipos e dados mockados
- `auth` concentra ações, autorização e consulta do usuário atual
- `contracts` e `dashboard` agregam dados vindos do repositório
- `shell` lê estado do shell a partir dos headers

### `src/shared`

É a camada de reutilização transversal de UI e helpers puros. Não contém regra de negócio do domínio.

### `src/server`

É a camada server-side de infraestrutura e acesso a dados.

Papéis observados:

- `auth` implementa sessão e assinatura de token
- `db` concentra Prisma e serialização
- `repositories` centraliza leitura híbrida mock/Prisma

### `prisma`

Contém o schema relacional e o seed inicial do banco. Hoje funciona mais como fundação da persistência do que como base completa do produto operacional.

### Padrões percebidos

- separação razoável entre página, query agregada e repositório
- App Router com páginas server-side buscando dados diretamente
- fallback de infraestrutura no repositório, e não espalhado nas páginas
- serialização explícita para adaptar tipos Prisma ao contrato do frontend

### Inconsistências arquiteturais percebidas

- o projeto ainda depende de `src/features/platform/data.ts` como base do modo sem banco, mas o shell autenticado já deixou de importar `tenant` diretamente desse mock e passou a consumi-lo via repositório no layout
- a modelagem do schema Prisma é mais rica do que a superfície funcional hoje usada pelas telas
- há separação entre queries e repositório para leitura, mas ainda não existe a mesma disciplina para comandos de escrita porque eles ainda não foram implementados
- o RBAC está expresso em rotas, mas não há uma camada de política de autorização por ação de domínio

## 4. Decisões técnicas já tomadas

As decisões abaixo já estão materializadas no código.

### App Router do Next.js

Evidência:

- `src/app`
- `src/app/api`
- `src/app/(dashboard)`

O projeto usa a estrutura de App Router com layouts, páginas e route handlers.

### Uso de `proxy.ts` no Next.js 16

Evidência:

- `src/proxy.ts`

O projeto já adotou a convenção `proxy.ts`, coerente com a documentação local do Next.js 16 em `node_modules/next/dist/docs`.

### Prisma como camada de persistência real

Evidência:

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/server/db/prisma.ts`
- `src/server/repositories/platform.repository.ts`

O banco real pretendido é PostgreSQL com Prisma Client.

### Fallback para memória quando não há banco

Evidência:

- `src/server/db/prisma.ts`
- `src/server/repositories/platform.repository.ts`
- `src/features/platform/data.ts`

A aplicação foi desenhada para permanecer navegável sem `DATABASE_URL`.

### Sessão em cookie assinado

Evidência:

- `src/server/auth/session.ts`
- `src/server/auth/crypto.ts`
- `src/server/auth/constants.ts`

Não há JWT externo nem biblioteca de autenticação de terceiros neste estágio.

### RBAC por perfil e rota

Evidência:

- `src/features/auth/permissions.ts`
- `src/proxy.ts`
- `src/shared/components/ui/sidebar.tsx`

O perfil influencia tanto a autorização de navegação quanto o menu exibido.

### Separação entre páginas, queries agregadas e repositories

Evidência:

- páginas em `src/app/(dashboard)`
- queries em `src/features/contracts/queries.ts` e `src/features/dashboard/queries.ts`
- repositório em `src/server/repositories/platform.repository.ts`

Essa separação já existe e deve ser preservada na continuidade.

### Tipagem explícita do domínio fora do Prisma

Evidência:

- `src/features/platform/types.ts`
- `src/server/db/serializers.ts`

O frontend não consome diretamente os tipos do Prisma; ele consome um contrato próprio do app.

## 5. O que falta

### Não implementado

- autenticação real com senha persistida, hash, MFA e gestão de credenciais
- fluxos transacionais de negócio para contratos, competências, solicitações, aprovações e conciliações
- CRUD de entidades centrais
- rotas `POST`, `PUT`, `PATCH` e `DELETE`
- upload real e armazenamento de documentos
- importador histórico de planilha ou legado
- trilha de auditoria disparada por mutações reais do sistema
- suíte de testes automatizados do app
- pipeline de CI/CD no repositório
- observabilidade de aplicação, logs estruturados, métricas e tracing
- hardening de produção, rate limiting, rotação de segredo, gestão de ambiente e políticas de erro

### Parcialmente implementado

- persistência: leitura via Prisma existe, mas a cobertura do domínio no banco ainda não chega aos fluxos de escrita
- autorização: existe por rota e perfil, mas não há evidência de autorização por operação de domínio
- server actions: já existem `loginAction`, `createReleaseRequestAction` e `reviewReleaseRequestAction`, mas o uso ainda está concentrado no login e no fluxo inicial de liberações
- auditoria: há modelo, seed e consulta, mas não há evidência de gravação automática em mutações do app
- administração: existe página de usuários, porém sem gestão real de perfis, MFA ou escopo
- conciliação: existe leitura e apresentação, mas não há workflow de classificação, justificativa e fechamento

### Implementado, mas frágil

- sessão caseira baseada em token assinado customizado, sem mecanismos mais robustos de revogação, refresh ou trilha de segurança
- dependência de `AUTH_DEV_PASSWORD` para autenticação
- acoplamento residual ao modo mock ainda existe no produto como estratégia de fallback, mas o vazamento direto do `tenant` para a `Sidebar` foi removido
- agregação de dados montada para leitura; risco de duplicação se mutações forem implementadas diretamente em páginas ou APIs sem uma camada de comando
- ausência de testes para proteger regressões durante a transição memória -> Prisma

### Implementado apenas para desenvolvimento/demo

- usuários seed como base de login
- senha padrão global de desenvolvimento
- dataset em memória em `src/features/platform/data.ts`
- páginas do backoffice operando majoritariamente sobre consultas e cenários simulados

### Verificações específicas pedidas

- autenticação real: ausente
- persistência completa: ausente
- formulários de negócio: ausentes
- fluxos transacionais: ausentes
- CRUD: ausente
- server actions: apenas login
- rotas POST/PUT/DELETE: ausentes
- auditoria persistida por mutação real: ausente
- testes: existe cobertura mínima de validação para criação e análise de solicitação de liberação, além de teste de policy do módulo de liberações, via `node:test`
- CI/CD: não encontrado
- validação de entrada: mínima, praticamente restrita ao login
- segurança: básica para ambiente local; insuficiente para produção
- observabilidade: não encontrada
- preparação para produção: parcial e ainda inicial

## 6. Próximos passos priorizados

### Fase 1: Estabilização da base

Objetivo:

Transformar o MVP navegável em uma base segura para evolução sem quebrar o modo híbrido atual.

Tarefas:

- consolidar um contrato de dados único entre mocks, serializers e Prisma
- remover imports diretos de mock da UI onde a origem deveria vir do repositório ou query
- adicionar validação de entrada para autenticação e futuras mutações
- mapear claramente quais entidades do schema já terão suporte operacional na primeira onda
- criar base de testes mínimos para queries críticas e autenticação local

Dependências:

- entendimento fechado do contrato atual de `src/features/platform/types.ts`

Resultado esperado:

- código mais previsível para a transição de leitura para escrita

### Fase 2: Fluxos transacionais essenciais

Objetivo:

Implementar o primeiro conjunto de mutações reais do produto.

Tarefas:

- criar comandos de escrita no `src/server` para solicitações de liberação
- implementar formulários e server actions para criação e atualização desses fluxos
- adicionar rotas transacionais quando necessário
- consolidar a leitura documental por solicitação com documentos esperados por etapa, pendências atuais e documentos previstos para etapa posterior
- registrar auditoria a cada mutação relevante

Dependências:

- Fase 1 concluída
- definição do recorte de domínio a ser operacionalizado primeiro

Resultado esperado:

- primeiro fluxo ponta a ponta saindo do estado somente leitura

### Fase 3: Governança e administração

Objetivo:

Fortalecer controle de acesso, operação administrativa e governança do sistema.

Tarefas:

- evoluir usuários, perfis e escopos para persistência e gestão real
- implementar autenticação real
- formalizar autorização por ação de domínio
- ampliar trilha de auditoria e histórico transacional
- criar telas administrativas além da mera consulta de usuários

Dependências:

- fluxos transacionais já existentes

Resultado esperado:

- backoffice com governança coerente para uso institucional

### Fase 4: Produção e integrações

Objetivo:

Preparar o sistema para operação real e integração com infraestrutura externa.

Tarefas:

- integrar storage compatível com S3 para documentos
- criar importador histórico
- adicionar observabilidade, logs e monitoramento
- definir pipeline de build, checagem e deploy
- revisar segredos, configuração de ambiente e políticas de erro

Dependências:

- domínio operacional estável
- autenticação e auditoria maduras

Resultado esperado:

- aplicação apta a sair do contexto de MVP local/demo

## 7. Backlog operacional

### Infraestrutura

- [ ] Padronizar criação do cliente Prisma e política de conexão para ambientes de desenvolvimento e produção.
- [ ] Definir estratégia formal para coexistência entre modo mock e modo banco real.
- [ ] Criar camada de comandos no `src/server` para operações de escrita.
- [ ] Mapear quais entidades do schema entram na primeira versão operacional.

### Autenticação

- [ ] Substituir `AUTH_DEV_PASSWORD` por autenticação persistida com hash de senha.
- [ ] Definir estratégia de MFA compatível com os perfis internos.
- [ ] Persistir credenciais e eventos de login.
- [ ] Adicionar logout invalidando sessão de forma mais controlada.
- [ ] Revisar autorização para que regras críticas não dependam só da navegação.

### Contratos

- [ ] Implementar criação e edição de contratos.
- [ ] Implementar gestão de parâmetros contratuais por versão.
- [ ] Implementar cadastro e edição de empresas e organizações relacionadas.
- [ ] Garantir atualização consistente de alocações de empregados por contrato.

### Liberações

- [x] Implementar criação de solicitação de liberação.
- [x] Implementar análise/decisão mínima por item da solicitação de liberação.
- [ ] Expandir a decisão de solicitação para múltiplos itens, revisão controlada e etapas posteriores do workflow.
- [ ] Implementar execução financeira vinculada a lançamento bancário.
- [x] Consolidar pendências documentais derivadas da matriz de documentos por tipo, etapa e modo de movimentação.

### Conciliação

- [ ] Implementar classificação de diferença explicada e não explicada.
- [ ] Implementar itens de conciliação associados a lançamentos bancários.
- [ ] Implementar fechamento e reabertura controlada por competência.
- [ ] Registrar justificativas e usuário responsável por cada ajuste.

### Auditoria

- [ ] Gerar `AuditLog` a partir de mutações reais do sistema.
- [ ] Padronizar quais entidades e ações precisam de trilha obrigatória.
- [ ] Expor filtros de auditoria por contrato, competência, usuário e período.

### Administração

- [ ] Implementar CRUD de usuários internos.
- [ ] Implementar gestão de perfis e escopos.
- [ ] Exibir e administrar status de MFA por usuário.
- [ ] Criar política de acesso por ação além da rota.

### Testes

- [ ] Adicionar testes unitários para formatadores, autorização e serializers.
- [ ] Adicionar testes de integração para `platform.repository`.
- [ ] Adicionar testes de autenticação e proteção de rota.
- [ ] Adicionar testes de fluxo para o primeiro caso transacional implementado.

### DevOps

- [ ] Criar pipeline de `lint`, `typecheck` e testes.
- [ ] Definir estratégia de migração Prisma para ambientes reais.
- [ ] Definir configuração de variáveis sensíveis por ambiente.
- [ ] Incluir monitoramento de falhas e logs estruturados.

### Documentação

- [ ] Manter este documento sincronizado a cada marco funcional.
- [ ] Documentar contratos de API conforme novas rotas surgirem.
- [ ] Documentar regras de negócio dos fluxos de liberação e conciliação.
- [ ] Documentar a transição planejada do modo mock para o modo Prisma integral.

## 8. Ordem recomendada para continuidade

A ordem recomendada é:

1. estabilizar contratos de dados e arquitetura de leitura atual
2. escolher um fluxo transacional prioritário
3. implementar escrita no servidor com auditoria obrigatória
4. expor UI e APIs de mutação
5. fortalecer autenticação e governança
6. só então avançar para integrações externas e produção

Essa ordem evita retrabalho porque:

- formular interfaces de edição antes de existir camada de comando e auditoria tende a espalhar regra de negócio nas páginas
- trocar autenticação de forma tardia, mas antes de haver fluxos reais, costuma ser mais barato do que reescrever autorização após vários casos de uso mal definidos
- integrar S3, importadores ou observabilidade antes de fechar o fluxo principal pode cristalizar abstrações erradas
- abandonar cedo demais o modo mock sem testes e sem equivalência de contrato com Prisma aumenta risco de regressão em telas já prontas

Dependências técnicas relevantes:

- comandos de escrita dependem da consolidação do contrato entre `types`, `serializers` e Prisma
- auditoria robusta depende da existência das mutações reais
- autorização por ação depende de casos de uso concretos já modelados
- produção e integrações dependem de fluxos estáveis, não apenas de páginas navegáveis

## 9. Riscos e cuidados

- Não quebrar a compatibilidade entre o modo em memória e o modo Prisma durante a transição. Enquanto ambos coexistirem, o contrato retornado pelo repositório precisa permanecer estável.
- Não implementar proteção apenas na UI. Toda mutação futura deve validar autenticação e autorização no backend.
- Não criar mutações sem trilha de auditoria. O domínio do projeto exige rastreabilidade.
- Evitar colocar regra de negócio em páginas de `src/app`. Páginas devem orquestrar renderização e delegar comportamento para `features` e `server`.
- Evitar duplicação de lógica entre queries, APIs e repositories. Se surgir camada de comando, centralizar nela as mutações.
- Preservar a separação entre tipos do app e modelos Prisma; ela já existe e reduz acoplamento.
- Antes de alterar partes sensíveis de roteamento, `proxy`, `headers()` ou `cookies()`, consultar a documentação local do Next.js em `node_modules/next/dist/docs`, conforme exigido em `AGENTS.md`.
- Há indício de exibição com caracteres acentuados corrompidos em algumas leituras via terminal. Não está confirmado se é problema do arquivo ou apenas da saída do shell; qualquer ajuste de encoding deve ser tratado com cuidado e validação explícita.

## 10. Mapa rápido do código

- `AGENTS.md`: regras locais do repositório, incluindo cautelas com Next.js 16 e uso de agentes.
- `README.md`: resumo funcional do MVP e instruções básicas de execução.
- `package.json`: stack, scripts e dependências principais.
- `next.config.ts`: configuração atual do Next.js.
- `src/app/layout.tsx`: layout raiz e metadados globais.
- `src/app/page.tsx`: landing page institucional pública.
- `src/app/login/page.tsx`: tela de autenticação local.
- `src/app/(dashboard)/layout.tsx`: shell autenticado do backoffice.
- `src/app/(dashboard)/dashboard/page.tsx`: visão executiva principal do sistema.
- `src/app/(dashboard)/dashboard/contracts/[contractId]/page.tsx`: melhor visão consolidada do domínio em uma tela.
- `src/app/api/*`: rotas HTTP atualmente disponíveis.
- `src/proxy.ts`: proteção de acesso e redirecionamento por sessão/role.
- `src/features/platform/types.ts`: contrato tipado central consumido pela aplicação.
- `src/features/platform/data.ts`: base mock do produto para modo sem banco.
- `src/features/contracts/queries.ts`: agregação de leitura de contratos e detalhe.
- `src/features/dashboard/queries.ts`: agregação de indicadores e risco.
- `src/features/auth/*`: autenticação local, estado de sessão e RBAC.
- `src/server/repositories/platform.repository.ts`: ponto central da leitura híbrida mock/Prisma.
- `src/server/db/prisma.ts`: inicialização do Prisma condicionada à presença de `DATABASE_URL`.
- `src/server/db/serializers.ts`: adaptação entre modelos Prisma e tipos do app.
- `src/server/auth/*`: assinatura de token e sessão por cookie.
- `src/shared/components/ui/*`: biblioteca de componentes reutilizáveis do projeto.
- `prisma/schema.prisma`: modelo relacional atual do domínio.
- `prisma/seed.ts`: dataset de demonstração e base de usuários seed.

## Observações finais para futuros agentes

- O sistema já entrega valor como backoffice navegável, mas ainda não deve ser interpretado como produto transacional completo.
- A prioridade correta não é criar mais páginas primeiro; é transformar um fluxo crítico em fluxo persistido, auditável e autorizado de ponta a ponta.
- Sempre partir do código real. O schema Prisma sugere mais capacidade do que a aplicação realmente usa hoje.

## Adequacao normativa 2026-04-20

Base normativa principal no projeto a partir desta rodada:

- Lei no 14.133/2021, art. 121, caput e paragrafos 2o, 3o e 4o
- Resolucao CNJ no 651, de 29 de setembro de 2025
- Resolucao CNJ no 169/2013 apenas para contratos assinados antes de 29 de setembro de 2025, conforme art. 18 da Resolucao CNJ no 651/2025
- Caderno de Logistica de 2018 apenas como referencia operacional subsidiaria

Impacto direto na continuidade:

- `Contract` passa a registrar `signedAt` e `normativeRegime`, para distinguir contratos ainda sujeitos a CNJ 169/2013 dos contratos sujeitos a CNJ 651/2025.
- `ReleaseRequest` passa a registrar `movementMode`, distinguindo pagamento direto aos empregados e resgate/reembolso a contratada, em linha com o art. 5o da Resolucao CNJ no 651/2025.
- `LinkedAccount` passa a registrar se a conta esta em banco publico oficial e o identificador do termo de cooperacao, em linha com os arts. 3o, 7o e 8o da Resolucao CNJ no 651/2025.
- O vocabulario documental foi ampliado para incluir comprovante de operacao bancaria, encerramento contratual, sucessao contratual, termo de cooperacao e garantia rescisoria.

Lacunas que permanecem documentadas, sem implementacao completa nesta rodada:

- workflow operacional dos prazos de 10 dias uteis para autorizacao e comprovacao da operacao, previstos nos arts. 5o e 6o da Resolucao CNJ no 651/2025;
- tratamento transacional do saldo remanescente proporcional para empregados remanescentes e da sucessao contratual com a mesma empresa, conforme arts. 14 e 15;
- exigencia facultativa de garantia especifica para verbas rescisorias inadimplidas, prevista no art. 8o, paragrafo 3o, mantida como backlog normativo.

## Governanca de documentacao funcional

`docs/MANUAL_DO_USUARIO.md` passa a ser a referencia funcional de uso do sistema para usuarios internos.

Regra permanente de continuidade:

- toda funcionalidade criada, alterada ou removida que impacte a operacao do sistema deve atualizar o manual do usuario;
- alteracoes funcionais relevantes para validacao operacional tambem devem revisar `docs/HOMOLOGACAO_FUNCIONAL.md`;
- o manual deve permanecer em portugues do Brasil;
- o manual deve descrever uso operacional, sem detalhes de implementacao tecnica;
- mudancas de tela, fluxo, nomenclatura, campos, status, permissoes funcionais, alertas e comportamento operacional devem ser refletidas no manual;
- entregas funcionais nao devem ser consideradas completas se deixarem o manual desatualizado.
