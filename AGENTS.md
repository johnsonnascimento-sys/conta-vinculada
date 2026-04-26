<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Model Selection

Use model capacity deliberately.

Use `GPT-5.5` for:
- planning complex blocks;
- coordinating subagents;
- interpreting normative requirements;
- architecture decisions;
- resolving conflicts between agents;
- final review of high-risk changes;
- cross-cutting changes;
- complex business rules;
- tasks where an error could compromise normative adherence, auditability or financial flow.

Use `GPT-5.4` for:
- backend implementation;
- functional frontend implementation;
- rule and command tests;
- serializers, repositories and queries;
- medium refactors;
- substantial functional documentation;
- medium or high-complexity tasks with a clear scope.

Use `GPT-5.4-mini` for:
- local adjustments;
- simple documentation updates;
- text corrections;
- badges, labels and microcopy;
- small layout adjustments;
- simple tests;
- reading and summarizing files when there is no difficult decision.

Avoid spending `GPT-5.5` on simple edits, repetitive adjustments, low-risk local changes or purely mechanical work.

## Agent Governance

This project must use a master/subagent governance model when work is complex, normatively sensitive or touches more than one functional area.

Every delivery must explicitly identify which master agent and which subagents were used. If no subagents were used, the final response must still say so in the required `Agentes utilizados` section and explain why the task was classified as simple, local and low risk.

### Master Agent / Orchestrator

Preferred model: `GPT-5.5`.

Responsibilities:
- decompose complex tasks;
- choose subagents;
- define each subagent scope and write ownership;
- resolve conflicts between subagents;
- make final decisions about architecture, business rules and normative adherence;
- consolidate the final response;
- ensure code, tests, user manual and homologation stay synchronized.

Use this role mainly for organization, planning, critical review, difficult decisions, high-risk tasks, normative interpretation, cross-cutting changes and final synthesis.

### Business Rules / Normative Subagent

Preferred model:
- `GPT-5.5` when the task involves difficult normative interpretation, Lei 14.133/2021, Resolucao CNJ no 651/2025, conta vinculada, legal risk or conceptual decisions;
- `GPT-5.4` when implementing an already defined rule.

This subagent is mandatory when a task changes:
- `rules.ts`;
- `workflow.ts`;
- release rules;
- reconciliation rules;
- derived statuses;
- normative adherence;
- required documents;
- linked account movement;
- administrative approval;
- financial execution;
- competency closing or reopening;
- managerial reading, recurrence, materiality, persistence or recovery of reconciliation signals.

### Backend / Data / Commands Subagent

Preferred model: `GPT-5.4`.

Responsibilities:
- server-side commands;
- repositories;
- serializers;
- queries;
- Prisma schema;
- seeds;
- transactions;
- audit trail;
- backend validation;
- backend authorization.

Use `GPT-5.5` only when there is a difficult architectural decision or high normative risk.

### Frontend / Operational UX Subagent

Preferred model:
- `GPT-5.4` for functional screen changes;
- `GPT-5.4-mini` for simple layout, text or badge adjustments.

Responsibilities:
- pages;
- components;
- operational reading;
- tables;
- badges;
- user-facing messages;
- coherence between screens and the user manual.

### Tests / Homologation Subagent

Preferred model:
- `GPT-5.4` for rule, workflow, command and functional integration tests;
- `GPT-5.4-mini` for simple tests or small adjustments.

Responsibilities:
- unit tests;
- command tests;
- query tests;
- regression coverage;
- coherence with `docs/HOMOLOGACAO_FUNCIONAL.md`.

### Functional Documentation Subagent

Preferred model:
- `GPT-5.4-mini` for simple updates;
- `GPT-5.4` when documentation covers a new flow, important operational change or complex homologation.

Responsibilities:
- `docs/MANUAL_DO_USUARIO.md`;
- `docs/HOMOLOGACAO_FUNCIONAL.md`;
- `docs/CONTINUIDADE_DO_PROJETO.md`;
- `docs/MAPA_DE_IMPLEMENTACAO.md`;
- keep documentation in Brazilian Portuguese;
- keep the user manual operational, without programming, database, architecture or command details.

### Final Review / Quality Subagent

Preferred model:
- `GPT-5.5` for high-risk review;
- `GPT-5.4` for ordinary review.

Responsibilities:
- verify inconsistencies between backend, frontend, tests and documentation;
- look for duplicated rules;
- verify whether manual and homologation were updated;
- ensure the scope was not expanded unnecessarily.

## Communication

- Always respond to the user in Brazilian Portuguese unless the user explicitly asks for another language.
- Keep final answers concise, direct, and action-oriented.

## Functional Documentation Governance

- Every feature created, changed, or removed that impacts system operation must update `docs/MANUAL_DO_USUARIO.md`.
- Functional changes that materially affect acceptance, operation, or user verification should also update `docs/HOMOLOGACAO_FUNCIONAL.md`.
- The user manual must always be kept in Brazilian Portuguese.
- The user manual must describe operational behavior only and must not include implementation details such as programming choices, architecture, database structure, framework internals, APIs, folders, or terminal commands.
- Changes to screens, flows, labels, fields, statuses, functional permissions, alerts, and user-facing operational behavior must be reflected in `docs/MANUAL_DO_USUARIO.md`.
- A delivery is not complete if it leaves `docs/MANUAL_DO_USUARIO.md` out of sync with the current functional behavior of the system.

### Mandatory subagent triggers

Subagents are mandatory when a task involves any of the following:
- changes to `rules.ts`;
- changes to `workflow.ts`;
- changes to `policy.ts`;
- changes to server-side commands;
- changes to serializers;
- changes to Prisma schema;
- reconciliation changes;
- release flow changes;
- calculation or derived-status changes;
- normative-adherence changes;
- required-document changes;
- financial-execution changes;
- competency closing or reopening changes;
- changes to `docs/MANUAL_DO_USUARIO.md` or `docs/HOMOLOGACAO_FUNCIONAL.md` because of functional or operational impact;
- tasks touching backend plus frontend plus documentation;
- tasks involving more than one functional area.

For these tasks, Codex must operate with at least:
1. Master Agent / Orchestrator;
2. Business Rules / Normative Subagent;
3. Backend or Frontend Subagent, according to the nature of the change;
4. Tests / Homologation Subagent;
5. Functional Documentation Subagent, when there is operational impact;
6. Final Review / Quality Subagent, when the change is cross-cutting or sensitive.

Codex must not answer that subagents were not used when the task changes `rules.ts`, `workflow.ts`, `policy.ts`, server-side commands, serializers, Prisma schema, reconciliation, releases, financial execution, normative adherence, required documents, competency closing/reopening, or user manual/homologation due to functional impact.

### When subagents are not required

Subagents are not required for simple, local and low-risk work, such as:
- reading files and answering factual questions;
- running commands;
- correcting text without functional meaning;
- adjusting a label, badge or small layout detail without business-rule impact;
- updating a single documentation paragraph without changing operational behavior.

Even then, if the work reveals normative, workflow or cross-functional risk, escalate to the mandatory subagent routine.

### Orchestration rules

- Define the task objective and non-goals before delegating.
- Assign non-overlapping scopes, such as rules/normative, backend, frontend, tests, documentation or review.
- For code changes, assign explicit file or module ownership.
- Tell subagents they are not alone in the codebase and must not revert edits made by others.
- Avoid duplicate work between subagents.
- Resolve conflicts explicitly and record the adopted decision.
- Consolidate outputs into one coherent implementation and one final response.
- Preserve a single source of truth; do not leave fragmented or contradictory conclusions.

### Mandatory agent transparency in final responses

Every final response must include a section named `Agentes utilizados`.

When subagents were used, this section must appear before `Comandos executados` and must state:

1. `Agente Mestre / Orquestrador`
   - model used;
   - function performed;
   - why that model was chosen.

2. `Subagentes acionados`
   For each subagent:
   - subagent name;
   - model used;
   - assigned scope;
   - files or areas analyzed;
   - delivered result;
   - whether there was any conflict with another subagent.

3. `Subagentes dispensados`
   - possible subagents that were not used;
   - brief reason why they were dismissed.

4. `Decisao final do orquestrador`
   - short explanation of how the master agent consolidated contributions;
   - relevant conflicts, if any;
   - which decision prevailed.

When no subagents were used, the final response must still include `Agentes utilizados` with this sentence:

> Nao foram acionados subagentes porque a tarefa foi classificada como simples, local e de baixo risco.

In that case, the response must also state:
- model used;
- reason subagents were dismissed.

The response must not claim that subagents were dismissed for low risk when the task changed `rules.ts`, `workflow.ts`, `policy.ts`, server-side commands, serializers, Prisma schema, reconciliation, releases or normative adherence. In these cases, the response must explicitly report:
- Master Agent / Orchestrator;
- Business Rules / Normative Subagent;
- corresponding technical subagent;
- Tests / Homologation Subagent;
- Functional Documentation Subagent, when there is operational impact;
- Final Review / Quality Subagent, when the change is cross-cutting or sensitive.

Recommended format:

```markdown
## Agentes utilizados

### Agente Mestre / Orquestrador
- **Modelo:** GPT-5.5
- **Funcao:** coordenacao, decomposicao da tarefa, decisao final e sintese
- **Motivo da escolha:** tarefa complexa/transversal/normativamente sensivel

### Subagente de Regras de Negocio / Normativo
- **Modelo:** GPT-5.5 ou GPT-5.4
- **Escopo:** regras, workflow, aderencia normativa, coerencia funcional
- **Arquivos ou areas analisadas:** ...
- **Resultado:** resumo objetivo da contribuicao
- **Conflitos:** nenhum / descreva o conflito

### Subagente Backend / Dados / Commands
- **Modelo:** GPT-5.4
- **Escopo:** commands, serializers, queries, repositories, schema, auditoria
- **Arquivos ou areas analisadas:** ...
- **Resultado:** resumo objetivo da contribuicao
- **Conflitos:** nenhum / descreva o conflito

### Subagente Frontend / UX Operacional
- **Modelo:** GPT-5.4 ou GPT-5.4-mini
- **Escopo:** telas, componentes, badges, mensagens, leitura operacional
- **Arquivos ou areas analisadas:** ...
- **Resultado:** resumo objetivo da contribuicao
- **Conflitos:** nenhum / descreva o conflito

### Subagente Testes / Homologacao
- **Modelo:** GPT-5.4 ou GPT-5.4-mini
- **Escopo:** testes automatizados e roteiro de homologacao funcional
- **Arquivos ou areas analisadas:** ...
- **Resultado:** resumo objetivo da contribuicao
- **Conflitos:** nenhum / descreva o conflito

### Subagente Documentacao Funcional
- **Modelo:** GPT-5.4 ou GPT-5.4-mini
- **Escopo:** manual do usuario, homologacao, continuidade e mapa
- **Arquivos ou areas analisadas:** ...
- **Resultado:** resumo objetivo da contribuicao
- **Conflitos:** nenhum / descreva o conflito

### Subagente Revisao Final / Qualidade
- **Modelo:** GPT-5.5 ou GPT-5.4
- **Escopo:** coerencia final, duplicacao de regra, regressoes, documentacao sincronizada
- **Arquivos ou areas analisadas:** ...
- **Resultado:** resumo objetivo da revisao
- **Conflitos:** nenhum / descreva o conflito

### Subagentes dispensados
- **Subagente:** nome
- **Motivo:** justificativa curta

### Decisao final do orquestrador
- sintese curta da decisao final, conflitos relevantes e decisao prevalecente
```

When subagents are used, the final response must follow this minimum order:
1. `Estrategia escolhida`
2. `Agentes utilizados`
3. `O que foi alterado no codigo`
4. `O que foi alterado na documentacao`
5. `Impacto funcional para o usuario`
6. `Impacto no roteiro de homologacao`
7. `Comandos executados`
8. `Resultado de validacao`
9. `Proximo bloco sugerido`

When subagents are not used, the final response must still include `Agentes utilizados` immediately after `Estrategia escolhida`, with the mandatory sentence above, the model used and the reason for dismissing subagents. Use the rest of the response order when applicable to the task.

The delivery is incomplete if the final response does not clearly state:
- which master agent was used;
- which subagents were used;
- which models were used;
- what each agent did;
- which agents were dismissed, when applicable.
- how the orchestrator consolidated the final decision and which decision prevailed when conflicts existed.

## Rules and Workflow Governance

Files such as:
- `src/features/releases/rules.ts`;
- `src/features/releases/workflow.ts`;
- `src/features/reconciliation/workflow.ts`;
- any `rules.ts`;
- any `workflow.ts`;
- any `policy.ts`;

must not be changed directly by a single agent without specialized review.

For changes in these files, the minimum routine is:
1. Master Agent defines the objective, constraints and limits of the rule.
2. Business Rules / Normative Subagent checks legal, functional and conceptual coherence.
3. Backend Subagent implements or adjusts the rule in the proper layer.
4. Tests / Homologation Subagent creates or updates regression tests.
5. Functional Documentation Subagent updates manual and homologation when there is operational impact.
6. Final Review / Quality Subagent checks duplication, regressions, scope creep and consistency across backend, frontend, tests and documentation.

Rules, workflows and policies must remain centralized. Do not duplicate business logic between `workflow`, `queries`, `serializers`, `pages`, route handlers and UI components.

The same mandatory routine applies when the task changes reconciliation logic, release flows, financial execution, required documents, derived statuses, competency closing/reopening, normative adherence, or functional user documentation required by those changes.
<!-- END:nextjs-agent-rules -->
