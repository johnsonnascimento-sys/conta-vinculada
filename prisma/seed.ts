import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: "tenant-jmu" },
    update: {},
    create: {
      id: "tenant-jmu",
      name: "Justica Militar da Uniao",
      jurisdiction: "2a Circunscricao Judiciaria Militar",
    },
  });

  const organization = await prisma.organization.upsert({
    where: { id: "org-2cjm" },
    update: {},
    create: {
      id: "org-2cjm",
      tenantId: tenant.id,
      name: "2a Circunscricao Judiciaria Militar",
      code: "2CJM",
    },
  });

  const atlas = await prisma.company.upsert({
    where: { id: "company-atlas" },
    update: {},
    create: {
      id: "company-atlas",
      tenantId: tenant.id,
      legalName: "Atlas Servicos Integrados Ltda.",
      tradeName: "Atlas Servicos",
      cnpj: "12.345.678/0001-90",
    },
  });

  const vigil = await prisma.company.upsert({
    where: { id: "company-vigil" },
    update: {},
    create: {
      id: "company-vigil",
      tenantId: tenant.id,
      legalName: "Vigil Prime Seguranca Patrimonial S.A.",
      tradeName: "Vigil Prime",
      cnpj: "98.765.432/0001-10",
    },
  });

  const contractOne = await prisma.contract.upsert({
    where: { id: "c-2cjm-001" },
    update: {},
    create: {
      id: "c-2cjm-001",
      tenantId: tenant.id,
      organizationId: organization.id,
      companyId: atlas.id,
      code: "CT 07/2025",
      name: "Apoio administrativo e recepcao",
      object:
        "Prestacao continuada com dedicacao exclusiva de mao de obra para recepcao e apoio administrativo.",
      startDate: new Date("2025-02-01"),
      endDate: new Date("2027-01-31"),
      status: "ativo",
    },
  });

  const contractTwo = await prisma.contract.upsert({
    where: { id: "c-2cjm-002" },
    update: {},
    create: {
      id: "c-2cjm-002",
      tenantId: tenant.id,
      organizationId: organization.id,
      companyId: vigil.id,
      code: "CT 12/2024",
      name: "Vigilancia armada e desarmada",
      object: "Servicos continuados de vigilancia armada e desarmada.",
      startDate: new Date("2024-08-01"),
      endDate: new Date("2026-07-31"),
      status: "ativo",
    },
  });

  await prisma.linkedAccount.upsert({
    where: { id: "bank-001" },
    update: {},
    create: {
      id: "bank-001",
      contractId: contractOne.id,
      bankName: "Banco do Brasil",
      branch: "1234-5",
      accountNumber: "98765-4",
      currentBalance: 148320.48,
    },
  });

  await prisma.linkedAccount.upsert({
    where: { id: "bank-002" },
    update: {},
    create: {
      id: "bank-002",
      contractId: contractTwo.id,
      bankName: "Caixa Economica Federal",
      branch: "0021",
      accountNumber: "778899-0",
      currentBalance: 232904.12,
    },
  });

  const parameterOne = await prisma.contractParameter.upsert({
    where: { id: "param-001" },
    update: {},
    create: {
      id: "param-001",
      contractId: contractOne.id,
      version: 1,
      effectiveFrom: new Date("2025-02-01"),
      payload: {
        workflow: "padrao_interno",
        checks: ["saldo_bancario", "saldo_gerencial", "documentacao"],
      },
    },
  });

  const parameterTwo = await prisma.contractParameter.upsert({
    where: { id: "param-002" },
    update: {},
    create: {
      id: "param-002",
      contractId: contractTwo.id,
      version: 1,
      effectiveFrom: new Date("2024-08-01"),
      payload: {
        workflow: "padrao_interno",
        checks: ["saldo_bancario", "saldo_gerencial", "documentacao"],
      },
    },
  });

  const employees = [
    {
      id: "emp-001",
      name: "Luciana Freitas",
      cpf: "123.456.789-10",
      role: "Recepcionista",
      status: "ativo" as const,
      admissionDate: new Date("2024-03-10"),
    },
    {
      id: "emp-002",
      name: "Carlos Menezes",
      cpf: "987.654.321-00",
      role: "Assistente administrativo",
      status: "ativo" as const,
      admissionDate: new Date("2023-11-01"),
    },
    {
      id: "emp-003",
      name: "Aline Tavares",
      cpf: "111.222.333-44",
      role: "Vigilante",
      status: "ativo" as const,
      admissionDate: new Date("2024-08-14"),
    },
    {
      id: "emp-004",
      name: "Marcos Faria",
      cpf: "444.555.666-77",
      role: "Vigilante",
      status: "desligado" as const,
      admissionDate: new Date("2024-08-14"),
      terminationDate: new Date("2026-03-20"),
    },
  ];

  for (const employee of employees) {
    await prisma.employee.upsert({
      where: { id: employee.id },
      update: {},
      create: { tenantId: tenant.id, ...employee },
    });
  }

  await prisma.employeeAllocation.upsert({
    where: { id: "alloc-001" },
    update: {},
    create: {
      id: "alloc-001",
      employeeId: "emp-001",
      contractId: contractOne.id,
      startDate: new Date("2025-02-01"),
      costCenter: "Recepcao",
    },
  });

  await prisma.employeeAllocation.upsert({
    where: { id: "alloc-002" },
    update: {},
    create: {
      id: "alloc-002",
      employeeId: "emp-002",
      contractId: contractOne.id,
      startDate: new Date("2025-02-01"),
      costCenter: "Apoio administrativo",
    },
  });

  await prisma.employeeAllocation.upsert({
    where: { id: "alloc-003" },
    update: {},
    create: {
      id: "alloc-003",
      employeeId: "emp-003",
      contractId: contractTwo.id,
      startDate: new Date("2024-08-01"),
      costCenter: "Vigilancia armada",
    },
  });

  await prisma.employeeAllocation.upsert({
    where: { id: "alloc-004" },
    update: {},
    create: {
      id: "alloc-004",
      employeeId: "emp-004",
      contractId: contractTwo.id,
      startDate: new Date("2024-08-01"),
      endDate: new Date("2026-03-20"),
      costCenter: "Vigilancia desarmada",
    },
  });

  const competencies = [
    {
      id: "comp-2026-01-c1",
      contractId: contractOne.id,
      competency: "2026-01",
      status: "fechada" as const,
      processedAt: new Date("2026-02-03T15:00:00Z"),
    },
    {
      id: "comp-2026-02-c1",
      contractId: contractOne.id,
      competency: "2026-02",
      status: "conciliada" as const,
      processedAt: new Date("2026-03-05T13:00:00Z"),
    },
    {
      id: "comp-2026-03-c1",
      contractId: contractOne.id,
      competency: "2026-03",
      status: "calculada" as const,
      processedAt: new Date("2026-04-02T18:10:00Z"),
    },
    {
      id: "comp-2026-03-c2",
      contractId: contractTwo.id,
      competency: "2026-03",
      status: "reaberta" as const,
      processedAt: new Date("2026-04-04T11:00:00Z"),
    },
  ];

  for (const competency of competencies) {
    await prisma.competency.upsert({
      where: { id: competency.id },
      update: {},
      create: competency,
    });
  }

  const balances = [
    ["pb-001", contractOne.id, "comp-2026-03-c1", "emp-001", "13o salario", 6840, 0, 1260],
    ["pb-002", contractOne.id, "comp-2026-03-c1", "emp-001", "Ferias + 1/3", 9120, 1560, 880],
    ["pb-003", contractOne.id, "comp-2026-03-c1", "emp-002", "Ferias + 1/3", 10830, 0, 2310],
    ["pb-004", contractTwo.id, "comp-2026-03-c2", "emp-003", "13o salario", 7740, 0, 0],
    ["pb-005", contractTwo.id, "comp-2026-03-c2", "emp-004", "Multa FGTS", 3920, 3920, 0],
  ] as const;

  for (const [
    id,
    contractId,
    competencyId,
    employeeId,
    rubric,
    balance,
    reservedAmount,
    releasedAmount,
  ] of balances) {
    await prisma.provisionBalance.upsert({
      where: { id },
      update: {},
      create: {
        id,
        contractId,
        competencyId,
        employeeId,
        rubric,
        balance,
        reservedAmount,
        releasedAmount,
      },
    });
  }

  const provisionEntries = [
    ["pe-001", contractOne.id, "comp-2026-03-c1", "emp-001", "13o salario", parameterOne.id, 6840, 0, 1260],
    ["pe-002", contractOne.id, "comp-2026-03-c1", "emp-001", "Ferias + 1/3", parameterOne.id, 9120, 1560, 880],
    ["pe-003", contractOne.id, "comp-2026-03-c1", "emp-002", "Ferias + 1/3", parameterOne.id, 10830, 0, 2310],
    ["pe-004", contractTwo.id, "comp-2026-03-c2", "emp-003", "13o salario", parameterTwo.id, 7740, 0, 0],
    ["pe-005", contractTwo.id, "comp-2026-03-c2", "emp-004", "Multa FGTS", parameterTwo.id, 3920, 3920, 0],
  ] as const;

  for (const [
    id,
    contractId,
    competencyId,
    employeeId,
    rubric,
    parameterVersionId,
    amount,
    reservedAmount,
    releasedAmount,
  ] of provisionEntries) {
    await prisma.provisionEntry.upsert({
      where: { id },
      update: {},
      create: {
        id,
        contractId,
        competencyId,
        employeeId,
        rubric,
        parameterVersionId,
        amount,
        reservedAmount,
        releasedAmount,
        sourceType: "migracao",
      },
    });
  }

  const requestOne = await prisma.releaseRequest.upsert({
    where: { id: "rr-001" },
    update: {},
    create: {
      id: "rr-001",
      contractId: contractOne.id,
      companyId: atlas.id,
      protocol: "RR-2026-00018",
      releaseType: "ferias",
      status: "em_analise",
      requestedByName: "Marina Gomes",
      requestedByUserId: "user-002",
      analystName: "Felipe Costa",
      factualBasis: "Ferias vencidas com concessao prevista para abril de 2026.",
      competencyStart: "2026-03",
      competencyEnd: "2026-03",
      requestedTotalAmount: 1560,
      notes: "Solicitacao seed para fila de analise.",
    },
  });

  const requestTwo = await prisma.releaseRequest.upsert({
    where: { id: "rr-002" },
    update: {},
    create: {
      id: "rr-002",
      contractId: contractTwo.id,
      companyId: vigil.id,
      protocol: "RR-2026-00021",
      releaseType: "rescisao",
      status: "aprovada_parcial",
      requestedByName: "Priscila Moraes",
      requestedByUserId: "user-001",
      analystName: "Guilherme Nunes",
      approverName: "Cap. Rodrigo Neves",
      factualBasis: "Desligamento do empregado com verbas rescisorias e multa de FGTS.",
      competencyStart: "2026-03",
      competencyEnd: "2026-03",
      requestedTotalAmount: 3920,
      notes: "Solicitacao seed parcialmente aprovada.",
    },
  });

  await prisma.releaseRequestItem.upsert({
    where: { id: "rr-item-001" },
    update: {},
    create: {
      id: "rr-item-001",
      releaseRequestId: requestOne.id,
      employeeId: "emp-001",
      releaseRubric: "ferias",
      competencyRef: "2026-03",
      allocationStartDate: new Date("2025-02-01"),
      employmentStartDate: new Date("2024-03-10"),
      factOccurredOn: new Date("2026-03-15"),
      calculationMemory: {
        baseAmount: 1170,
        proportionalFraction: 1,
        referenceMonths: 12,
        notes: "Ferias vencidas no periodo com base integral.",
      },
      requestedAmount: 1560,
      validatedAmount: 1560,
      approvedAmount: 0,
      decision: "pendente",
      notes: "Item seed em analise.",
    },
  });

  await prisma.releaseRequestItem.upsert({
    where: { id: "rr-item-002" },
    update: {},
    create: {
      id: "rr-item-002",
      releaseRequestId: requestTwo.id,
      employeeId: "emp-004",
      releaseRubric: "multa_fgts_rescisoria",
      competencyRef: "2026-03",
      allocationStartDate: new Date("2024-08-01"),
      allocationEndDate: new Date("2026-03-20"),
      employmentStartDate: new Date("2024-08-14"),
      factOccurredOn: new Date("2026-03-20"),
      calculationMemory: {
        baseAmount: 3920,
        proportionalFraction: 1,
        referenceMonths: 19,
        notes: "Multa rescisoria com memoria validada parcialmente.",
      },
      requestedAmount: 3920,
      validatedAmount: 3920,
      approvedAmount: 3650,
      decision: "aprovado_parcial",
      notes: "Glosa parcial aplicada em analise.",
    },
  });

  for (const [id, releaseRequestId, contractId, kind, originalName] of [
    ["doc-001", requestOne.id, contractOne.id, "ferias", "recibo-ferias.pdf"],
    ["doc-002", requestOne.id, contractOne.id, "comprovante_pagamento", "comprovante-ferias.pdf"],
    ["doc-003", requestTwo.id, contractTwo.id, "rescisao", "trct-marcos.pdf"],
    ["doc-004", requestTwo.id, contractTwo.id, "fgts", "fgts-marcos.pdf"],
    ["doc-005", requestTwo.id, contractTwo.id, "comprovante_pagamento", "comprovante-rescisao.pdf"],
  ] as const) {
    await prisma.document.upsert({
      where: { id },
      update: {},
      create: {
        id,
        contractId,
        releaseRequestId,
        kind,
        originalName,
        storageKey: `seed/${originalName}`,
        fileHash: `hash-${id}`,
      },
    });
  }

  for (const reconciliation of [
    ["rec-001", contractOne.id, "comp-2026-03-c1", 148320.48, 142990, 1560, 2827.3, 943.18, "nao_explicada"],
    ["rec-002", contractTwo.id, "comp-2026-03-c2", 232904.12, 230810, 3650, 444.12, 0, "explicada"],
  ] as const) {
    const [
      id,
      contractId,
      competencyId,
      bankBalance,
      provisionBalance,
      approvedPendingExecution,
      explainedDifference,
      unexplainedDifference,
      differenceType,
    ] = reconciliation;

    await prisma.bankReconciliation.upsert({
      where: { id },
      update: {},
      create: {
        id,
        contractId,
        competencyId,
        bankBalance,
        provisionBalance,
        approvedPendingExecution,
        explainedDifference,
        unexplainedDifference,
        differenceType,
      },
    });
  }

  for (const user of [
    ["user-001", "Beatriz Campos", "beatriz.campos@jmu.mil.br", "Administrador do órgão", "2CJM"],
    ["user-002", "Felipe Costa", "felipe.costa@jmu.mil.br", "Analista", "CT 07/2025"],
    ["user-003", "Rafaela Vasques", "rafaela.vasques@jmu.mil.br", "Financeiro", "2CJM"],
    ["user-004", "Henrique Dias", "henrique.dias@jmu.mil.br", "Auditoria interna", "Leitura institucional"],
  ] as const) {
    const [id, name, email, role, scope] = user;

    await prisma.user.upsert({
      where: { id },
      update: {},
      create: {
        id,
        tenantId: tenant.id,
        name,
        email,
        role,
        scope,
        mfaEnabled: true,
      },
    });
  }

  for (const audit of [
    [
      "audit-001",
      contractOne.id,
      "user-002",
      "Felipe Costa",
      "Solicitacao em exigencia",
      "release_request",
      "Folha da competencia 03/2026 nao anexada. Pedido devolvido para complementacao.",
    ],
    [
      "audit-002",
      contractTwo.id,
      "user-001",
      "Cap. Rodrigo Neves",
      "Aprovacao parcial",
      "release_request_item",
      "Glosa de R$ 270,00 por divergencia em memoria de calculo da multa FGTS.",
    ],
    [
      "audit-003",
      contractTwo.id,
      "user-001",
      "Beatriz Campos",
      "Reabertura de competencia",
      "competency",
      "Competencia 03/2026 reaberta para reprocessamento apos desligamento retroativo.",
    ],
  ] as const) {
    const [id, contractId, userId, actorName, action, entity, details] = audit;

    await prisma.auditLog.upsert({
      where: { id },
      update: {},
      create: {
        id,
        contractId,
        userId,
        actorName,
        action,
        entity,
        details,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
