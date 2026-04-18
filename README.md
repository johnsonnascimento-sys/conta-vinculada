# Conta Vinculada

MVP web para gestão institucional de conta vinculada em contratos administrativos com dedicação exclusiva de mão de obra.

## Escopo implementado

- landing page institucional e backoffice navegável;
- dashboard com visão de saldo bancário, provisões, pendências e diferença conciliatória;
- páginas de contratos, detalhe do contrato, liberações, conciliação, auditoria e administração;
- domínio tipado para competências, provisões, solicitações, documentos, conciliação e auditoria;
- rotas `GET` para resumo do dashboard e contratos;
- schema Prisma inicial alinhado ao plano conceitual.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma schema para PostgreSQL

## Como rodar

```bash
npm install
npm run dev
```

Aplicação:
- `http://localhost:3000`
- `http://localhost:3000/dashboard`
- `http://localhost:3000/login`

## Modos de dados

- sem `DATABASE_URL`: a aplicação usa o repositório em memória e continua navegável;
- com `DATABASE_URL`: a camada de repositório passa a ler dados reais via Prisma.

## Autenticação local

- login interno em ` /login `;
- sessão assinada em cookie;
- RBAC por perfil nas rotas do backoffice.

Variáveis:

```env
AUTH_SECRET="troque-esta-chave-em-producao"
AUTH_DEV_PASSWORD="admin123"
```

Usuários de seed:

- `beatriz.campos@jmu.mil.br`
- `felipe.costa@jmu.mil.br`
- `rafaela.vasques@jmu.mil.br`
- `henrique.dias@jmu.mil.br`

## Banco de dados

Scripts disponíveis:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Exemplo de variável:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/conta_vinculada"
```

## Estrutura principal

- `src/app`: rotas, layout e APIs
- `src/features`: domínio do produto e consultas
- `src/shared`: componentes e utilitários
- `prisma/schema.prisma`: base transacional proposta para o MVP

## Próximos passos

1. trocar o repositório em memória por DAL com Prisma;
2. adicionar autenticação real com MFA e RBAC persistido;
3. implementar formulários e server actions para contratos, competências e solicitações;
4. criar importador histórico da planilha e trilha de auditoria persistida;
5. conectar storage S3 compatível para documentos.
