# Adequacao Normativa Lei 14.133 e CNJ 651/2025

## 1. Base normativa atual do projeto

A base normativa principal do projeto passa a ser:

- Lei no 14.133/2021, especialmente art. 121, caput e paragrafos 2o, 3o e 4o
- Resolucao CNJ no 651, de 29 de setembro de 2025

Leitura operacional adotada nesta rodada:

- o art. 121 da Lei no 14.133/2021 mantem a responsabilidade primaria do contratado pelas obrigacoes trabalhistas, admite conta vinculada em contratos com dedicacao exclusiva de mao de obra e preve mecanismos como pagamento direto ao trabalhador e garantia especifica;
- a Resolucao CNJ no 651/2025 detalha, no ambito do Poder Judiciario, retencao mensal, banco publico oficial, termo de cooperacao, modos de movimentacao da conta vinculada, prazos, saldo remanescente e sucessao contratual;
- a Resolucao CNJ no 169/2013 permanece relevante apenas para contratos assinados antes de 29 de setembro de 2025, por forca do art. 18 da Resolucao CNJ no 651/2025.

Referencias oficiais:

- Lei no 14.133/2021: https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm
- Resolucao CNJ no 651/2025: https://atos.cnj.jus.br/files/original2239532025092968db0ab9e2822.pdf

## 2. O que mudou em relacao ao manual de 2018

O Caderno de Logistica de 2018 deixa de ser fonte normativa principal.

Mudancas materiais para o sistema:

- o manual de 2018 tratava a conta vinculada como referencia operacional ampla; agora o projeto precisa se alinhar primeiro ao art. 121 da Lei no 14.133/2021 e, no Judiciario, a Resolucao CNJ no 651/2025;
- a Resolucao CNJ no 651/2025 distingue expressamente pagamento direto aos empregados e resgate pela contratada;
- a Resolucao CNJ no 651/2025 exige banco publico oficial e termo de cooperacao;
- a Resolucao CNJ no 651/2025 trata expressamente saldo remanescente, encerramento contratual, sucessao contratual e possibilidade de garantia para verbas rescisorias inadimplidas;
- o proprio art. 15 da Resolucao CNJ no 651/2025 rebaixa o Caderno de Logistica de 2018 para papel subsidiario, no que couber.

## 3. O que o sistema ja atende

Apos esta rodada, o sistema passou a atender estruturalmente os seguintes pontos:

- diferenciacao do regime normativo por contrato via `Contract.signedAt` e `Contract.normativeRegime`;
- diferenciacao do modo de movimentacao da conta vinculada via `ReleaseRequest.movementMode`;
- preparacao da conta vinculada para banco publico oficial e termo de cooperacao via `LinkedAccount.isOfficialPublicBank` e `LinkedAccount.cooperationTermRef`;
- ampliacao do vocabulario documental para incluir:
  - comprovante de operacao bancaria
  - encerramento contratual
  - sucessao contratual
  - termo de cooperacao
  - garantia rescisoria
- manutencao do fluxo ja implementado de criacao de `ReleaseRequest` e `ReleaseRequestItem`, sem destruir a arquitetura nem o modo hibrido mock/Prisma.
- consolidacao da aprovacao administrativa posterior da solicitacao, sem confundir essa etapa com execucao bancaria.
- leitura e registro interno do preparo da futura execucao financeira, considerando forma de movimentacao, regime normativo, evidencias minimas, saldo e conciliacao, sem criar integracao bancaria real.

## 4. O que ainda nao atende

O sistema ainda nao atende integralmente, nesta rodada, os seguintes pontos normativos:

- workflow completo dos prazos de 10 dias uteis da Resolucao CNJ no 651/2025 para autorizacao e comprovacao da movimentacao;
- fluxo operacional de pagamento direto aos empregados com comprovacao bancaria posterior;
- fluxo operacional de resgate/reembolso com conferencias especificas por etapa;
- execucao financeira efetiva com vinculacao a lancamento bancario real e baixa correspondente;
- uso proporcional do saldo remanescente para empregados remanescentes, com calculo e autorizacao formal;
- sucessao contratual com a mesma empresa e reaproveitamento do saldo remanescente, com planilhas individualizadas por empregado;
- garantia contratual especifica para verbas rescisorias inadimplidas como parte do cadastro/gestao contratual;
- clausulas de edital e contrato, percentuais de retencao e controles formais de abertura/encerramento da conta vinculada.

## 5. Ajustes feitos no codigo nesta rodada

Schema e dominio:

- `Contract` ganhou `signedAt` e `normativeRegime`.
- `LinkedAccount` ganhou `isOfficialPublicBank` e `cooperationTermRef`.
- `ReleaseRequest` ganhou `movementMode`.
- `DocumentKind` ganhou novos valores relacionados a operacao bancaria, encerramento, sucessao, termo de cooperacao e garantia rescisoria.

Fluxo de liberacao:

- `CreateReleaseRequestInput` passou a exigir `movementMode`.
- a validacao backend passou a validar o modo de movimentacao.
- o comando `createReleaseRequest` passou a persistir `movementMode` e a registrar o dado na auditoria.
- a UI minima de criacao passou a permitir a escolha do modo de movimentacao.
- o workflow passou a separar aprovacao administrativa, preparo da futura execucao e execucao financeira efetiva.
- o preparo financeiro passou a considerar conta vinculada, saldo, diferenca nao explicada da conciliacao e evidencias minimas da etapa.
- o registro do preparo financeiro passou a ser interno e auditavel, sem gerar `BankEntry` ficticio nem `ReleaseExecution` efetiva.

Leitura e mocks:

- serializers e repositorio passaram a refletir os novos campos.
- mocks e seed foram ajustados para o novo shape normativo.

## 6. Backlog normativo remanescente

Itens a tratar depois, sem expandir indevidamente o escopo agora:

- adicionar politica de prazo normativo para autorizacao e comprovacao de movimentacao;
- modelar melhor o encerramento contratual e a sucessao entre contratos da mesma empresa;
- decidir se a garantia rescisoria vira entidade propria, campo contratual ou apenas documento estruturado;
- evoluir a matriz documental por etapa do fluxo, separando claramente documentos exigidos na criacao, na analise, na operacao bancaria e no encerramento;
- refletir no workflow o art. 6o da Resolucao CNJ no 651/2025 quando houver exigencia sindical em rescisoes;
- registrar de forma mais explicita a unidade administrativa responsavel por calculos, conferencias e autorizacoes, conforme arts. 4o, 10 e 13 da Resolucao CNJ no 651/2025.

## 7. Decisoes arquiteturais decorrentes da nova norma

As decisoes adotadas nesta rodada foram:

- o regime normativo nao sera inferido apenas por data de inicio do contrato; ele passa a ser persistido em `Contract.normativeRegime`, com `signedAt` como dado de referencia;
- o modo de movimentacao nao sera inferido implicitamente no fluxo de liberacao; ele passa a ser persistido em `ReleaseRequest.movementMode`;
- banco publico oficial e termo de cooperacao ficam modelados no dominio da conta vinculada, mas sem qualquer integracao bancaria real neste ciclo;
- o Caderno de Logistica de 2018 nao desaparece da documentacao, mas deixa de orientar modelagem principal;
- sucessao contratual, saldo remanescente e garantia rescisoria foram tratados como backlog normativo controlado para evitar overengineering fora do fluxo atual.
