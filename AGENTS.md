<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Model Selection

For low-complexity tasks, prefer `GPT-5.4-mini`.

Treat as low-complexity:
- single-file edits with local impact;
- small refactors without architectural changes;
- straightforward bug fixes;
- simple command execution or local environment checks;
- documentation updates with no design implications.

Escalate to a larger model only when the task involves:
- architecture or cross-cutting design decisions;
- multi-step implementation across several modules;
- ambiguous requirements or high-risk changes;
- deep debugging, migration planning, or compliance-sensitive reasoning.

## Agent Usage

Use specialized agents only when the task justifies coordination overhead.

## Communication

- Always respond to the user in Brazilian Portuguese unless the user explicitly asks for another language.
- Keep final answers concise, direct, and action-oriented.

## Functional Documentation Governance

- Every feature created, changed, or removed that impacts system operation must update `docs/MANUAL_DO_USUARIO.md`.
- The user manual must always be kept in Brazilian Portuguese.
- The user manual must describe operational behavior only and must not include implementation details such as programming choices, architecture, database structure, framework internals, APIs, folders, or terminal commands.
- Changes to screens, flows, labels, fields, statuses, functional permissions, alerts, and user-facing operational behavior must be reflected in `docs/MANUAL_DO_USUARIO.md`.
- A delivery is not complete if it leaves `docs/MANUAL_DO_USUARIO.md` out of sync with the current functional behavior of the system.

### Use agents when
- the task spans multiple domains, such as frontend, backend, database, security, or migration;
- the work can be split into parallel, independent tracks;
- the task requires different specialist viewpoints before a final decision;
- the change is complex enough that synthesis and cross-review materially improve quality.
- if the user has expressed a standing preference for delegated or parallel execution, honor that preference whenever the task has meaningful independent workstreams.

### Do not use agents when
- the task is simple, local, and can be completed directly;
- the work is limited to a small edit, quick bug fix, simple command, or lightweight documentation change;
- coordination would add more overhead than execution.

### Selection rule
- simple tasks: prefer `GPT-5.4-mini` and avoid subagents;
- medium tasks: execute directly unless clear specialization is needed;
- complex tasks: use an orchestrator pattern with specialized subagents.
- when subagents are used, assign them non-overlapping scopes such as backend, frontend, testing, or documentation/review.

### Orchestration rules
- define a clear responsibility for each agent before starting;
- avoid redundant agents with overlapping scope;
- consolidate outputs into one coherent final result;
- when agents disagree, make the conflict explicit and record the adopted decision;
- preserve a single source of truth in the final synthesis instead of exposing fragmented conclusions.
<!-- END:nextjs-agent-rules -->
