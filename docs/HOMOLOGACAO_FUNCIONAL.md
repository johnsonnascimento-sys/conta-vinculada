# Homologação Funcional

## 1. Apresentação

Este documento foi criado para apoiar a homologação funcional do Sistema de Conta Vinculada. Ele deve ser usado por quem precisa verificar, de forma prática, se o comportamento do sistema está coerente com o uso esperado pelos perfis internos do órgão.

O foco deste material é operacional. O objetivo não é avaliar aspectos técnicos de implementação, mas confirmar se as telas, informações, fluxos, alertas e restrições de uso estão funcionando de acordo com o que o sistema apresenta ao usuário.

## 2. Objetivo da homologação

Esta homologação deve confirmar se:

- o sistema está navegável para os perfis internos previstos;
- os módulos disponíveis apresentam as informações esperadas;
- o fluxo funcional de solicitação de liberação está utilizável dentro do escopo já implementado;
- o modo somente leitura está claramente sinalizado quando aplicável;
- o comportamento observado no sistema está coerente com `docs/MANUAL_DO_USUARIO.md`;
- a adequação normativa já incorporada aparece de forma funcional mínima no sistema.

## 3. Instruções de preenchimento

- [ ] Executar a validação preferencialmente com usuário de perfil compatível com o módulo avaliado.
- [ ] Registrar observações objetivas e descrever o que foi visto na tela.
- [ ] Marcar apenas um resultado por item.
- [ ] Quando necessário, anexar evidências externas ao processo de homologação.
- [ ] Se o item não se aplicar ao ambiente avaliado, marcar como `Não aplicável`.

Observações gerais:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Não aplicável

## 4. Critérios de resultado

- `Aprovado`: o comportamento observado está aderente ao uso esperado e ao manual do usuário.
- `Aprovado com ressalva`: o item funciona, mas há limitação ou divergência que não impede totalmente o uso.
- `Reprovado`: o item não funciona como esperado, apresenta erro ou diverge do manual de forma relevante.
- `Não aplicável`: o item não se aplica ao perfil, ao ambiente ou ao escopo funcional hoje disponível.

## 5. Checklist por módulo

### 5.1 Painel principal

- [ ] O menu lateral permite acesso ao Painel institucional.
- [ ] O painel exibe visão executiva com indicadores gerais.
- [ ] O painel mostra saldo bancário total.
- [ ] O painel mostra provisões líquidas.
- [ ] O painel mostra solicitações pendentes.
- [ ] O painel mostra diferença não explicada.
- [ ] O painel apresenta contratos priorizados para acompanhamento.
- [ ] O acesso ao detalhe do contrato a partir do painel funciona.

Observações:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Não aplicável

### 5.2 Contratos

- [ ] O módulo de contratos pode ser acessado pelo menu.
- [ ] A lista apresenta nome e código do contrato.
- [ ] A lista apresenta empresa vinculada.
- [ ] A lista apresenta saldo bancário, provisões, valor reservado e diferença conciliatória.
- [ ] A ação de abrir o contrato funciona.
- [ ] O detalhe do contrato apresenta dados gerais.
- [ ] O detalhe do contrato apresenta competências.
- [ ] O detalhe do contrato apresenta empregados alocados.
- [ ] O detalhe do contrato apresenta provisões por empregado e rubrica.
- [ ] O detalhe do contrato apresenta conta vinculada e eventos bancários.
- [ ] O detalhe do contrato apresenta solicitações de liberação ligadas ao contrato.
- [ ] O detalhe do contrato mostra documentos esperados na etapa atual das solicitações vinculadas.
- [ ] O detalhe do contrato mostra pendências documentais das solicitações vinculadas.
- [ ] O detalhe do contrato mostra a situação de aprovação administrativa das solicitações vinculadas.
- [ ] O detalhe do contrato mostra a leitura de aptidão para futura etapa financeira sem indicar execução bancária concluída.
- [ ] O detalhe do contrato mostra a situação de preparo da futura execução financeira das solicitações vinculadas.
- [ ] O detalhe do contrato mostra o valor apto à futura execução e o movimento esperado.
- [ ] O detalhe do contrato apresenta trilha de auditoria ligada ao contrato.

Observações:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Não aplicável

### 5.3 Liberações

- [ ] O módulo de liberações pode ser acessado pelo menu.
- [ ] A tela apresenta a área de criação de solicitação.
- [ ] A tela apresenta a fila de solicitações já registradas.
- [ ] O formulário permite selecionar contrato.
- [ ] O formulário permite selecionar tipo de liberação.
- [ ] O formulário permite selecionar forma de movimentação.
- [ ] O formulário permite informar competência inicial e final.
- [ ] O formulário permite informar fundamento do pedido.
- [ ] O formulário permite informar observações internas.
- [ ] O formulário permite adicionar mais de um item.
- [ ] Cada item permite informar empregado, rubrica, competência, datas, valor e memória de cálculo.
- [ ] O total solicitado é apresentado ao usuário.
- [ ] O envio da solicitação está funcional no ambiente de gravação.
- [ ] A fila mostra protocolo, tipo de liberação, período, forma de movimentação, status e valores.
- [ ] Os itens da solicitação mostram decisão e valores por item.
- [ ] A leitura da solicitação mostra documentos esperados na etapa atual.
- [ ] A leitura da solicitação mostra pendências documentais da etapa atual.
- [ ] Quando aplicável, a leitura da solicitação distingue documentos previstos para etapa posterior.
- [ ] Quando aplicável, a leitura documental aparece agrupada por natureza, como fato gerador, cálculo, quitação, operação ou encerramento.
- [ ] A fila distingue visualmente exigência documental, análise e decisão agregada da solicitação.
- [ ] A fila informa quando a solicitação ainda aguarda início de análise.
- [ ] A fila informa quando a solicitação já possui itens decididos, mas ainda sem decisão agregada final.
- [ ] A fila informa quando a solicitação já possui decisão agregada suficiente.
- [ ] A fila informa quando a solicitação ainda não está apta para aprovação administrativa.
- [ ] A fila informa quando a solicitação já está pronta para aprovação administrativa.
- [ ] A fila informa a decisão administrativa consolidada quando ela já existir.
- [ ] A fila informa a aptidão para futura etapa financeira sem indicar que a execução financeira já ocorreu.
- [ ] A fila informa quando a solicitação ainda não está apta para preparo da futura execução financeira.
- [ ] A fila informa quando a solicitação já está pronta para preparo da futura execução financeira.
- [ ] A fila mostra o valor apto à futura execução financeira.
- [ ] A fila mostra as evidências mínimas da etapa de preparo e o que ainda falta.
- [ ] A fila mostra a leitura mínima de saldo e conciliação usada para essa etapa.
- [ ] Itens pendentes exibem ação de decisão quando o perfil e o ambiente permitem.
- [ ] A decisão por item pode ser registrada na própria fila de solicitações.
- [ ] Solicitação em exigência documental não apresenta ação de decisão por item.
- [ ] Solicitação com pendência documental relevante não apresenta ação de aprovação administrativa.
- [ ] Solicitação sem consolidação suficiente dos itens não apresenta ação de aprovação administrativa.
- [ ] A aprovação administrativa pode ser registrada por perfil autorizado no ambiente com gravação habilitada.
- [ ] A aprovação administrativa parcial e a rejeição exigem fundamentação.
- [ ] Solicitação ainda sem preparo suficiente não apresenta ação de registro do preparo financeiro.
- [ ] A ação de registro do preparo financeiro não cria execução bancária efetiva no sistema.
- [ ] O preparo financeiro pode ser registrado por perfil autorizado no ambiente com gravação habilitada.
- [ ] Aprovação total, aprovação parcial e rejeição ou glosa se comportam de forma coerente com os valores informados.
- [ ] Item já decidido não volta a apresentar ação de decisão na mesma etapa.

Observações:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Não aplicável

### 5.4 Conciliação

- [ ] O módulo de conciliação pode ser acessado pelo menu.
- [ ] A tela apresenta saldo bancário.
- [ ] A tela apresenta provisões.
- [ ] A tela apresenta aprovado pendente de execução.
- [ ] A tela apresenta diferença explicada.
- [ ] A tela apresenta diferença não explicada.
- [ ] A tela apresenta status resumido da diferença.

Observações:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Não aplicável

### 5.5 Auditoria

- [ ] O módulo de auditoria pode ser acessado pelo menu.
- [ ] A tela apresenta linha do tempo de eventos.
- [ ] Cada evento mostra ação, responsável, data/hora, entidade e descrição resumida.
- [ ] A leitura da auditoria está coerente com o uso operacional esperado.

Observações:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Não aplicável

### 5.6 Administração

- [ ] O módulo de administração pode ser acessado pelo menu, quando o perfil permitir.
- [ ] A tela apresenta usuários internos do ambiente.
- [ ] A tela apresenta perfil de cada usuário.
- [ ] A tela apresenta escopo do usuário.
- [ ] A tela apresenta situação de MFA.
- [ ] A homologação confirma que o módulo hoje funciona como consulta, e não como gestão completa.

Observações:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Não aplicável

### 5.7 Manual do usuário no sistema

- [ ] O menu lateral apresenta acesso ao Manual do usuário.
- [ ] A página do manual abre dentro do sistema.
- [ ] O conteúdo do manual está legível e navegável.
- [ ] O manual exibido no sistema está coerente com `docs/MANUAL_DO_USUARIO.md`.

Observações:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Não aplicável

## 6. Validação do modo somente leitura

- [ ] O homologador verificou o comportamento do sistema sem base de gravação habilitada, quando aplicável.
- [ ] A tela de liberações informa claramente quando a criação está indisponível.
- [ ] A tela de liberações também impede decisão por item quando a gravação não está habilitada.
- [ ] A fila de solicitações continua visível em modo somente leitura.
- [ ] O sistema não induz o usuário a acreditar que a gravação está disponível nesse modo.
- [ ] A leitura dos demais módulos permanece utilizável.

Observações:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Não aplicável

## 7. Validação de aderência entre sistema e manual do usuário

- [ ] O painel principal corresponde ao que o manual descreve.
- [ ] O módulo de contratos corresponde ao que o manual descreve.
- [ ] O módulo de liberações corresponde ao que o manual descreve.
- [ ] A apresentação de documentos esperados, pendências da etapa e documentos previstos para depois corresponde ao que o manual descreve.
- [ ] A separação entre exigência documental, análise e decisão agregada corresponde ao que o manual descreve.
- [ ] A leitura de aprovação administrativa posterior corresponde ao que o manual descreve.
- [ ] A distinção entre aprovação administrativa e futura etapa financeira corresponde ao que o manual descreve.
- [ ] A leitura de preparo da futura execução financeira corresponde ao que o manual descreve.
- [ ] A distinção entre preparo da futura execução e execução financeira efetiva corresponde ao que o manual descreve.
- [ ] O módulo de conciliação corresponde ao que o manual descreve.
- [ ] O módulo de auditoria corresponde ao que o manual descreve.
- [ ] O módulo de administração corresponde ao que o manual descreve.
- [ ] O comportamento do modo somente leitura corresponde ao que o manual descreve.
- [ ] Não foram identificadas instruções funcionais no manual que contradigam o sistema atual.

Observações:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Não aplicável

## 8. Validação funcional mínima da adequação normativa já incorporada

- [ ] O homologador confirmou que o sistema trata contratos em contexto de conta vinculada institucional.
- [ ] A solicitação de liberação apresenta forma de movimentação como campo funcional.
- [ ] A leitura das solicitações permite identificar tipo de liberação e forma de movimentação.
- [ ] As pendências documentais continuam visíveis na leitura do pedido.
- [ ] Não foi identificada funcionalidade que contradiga a adequação normativa já incorporada ao escopo atual.
- [ ] O homologador reconhece que o sistema ainda não concluiu o ciclo completo de execução financeira, sucessão contratual, garantias e prazos operacionais mais amplos.

Observações:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Não aplicável

## 9. Registro de inconsistências encontradas

- [ ] Foi aberta lista de inconsistências encontradas durante a homologação.
- [ ] Cada inconsistência contém módulo afetado.
- [ ] Cada inconsistência contém descrição objetiva do problema.
- [ ] Cada inconsistência contém impacto funcional percebido.
- [ ] Cada inconsistência contém classificação de severidade, quando o processo interno exigir.

Observações:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Não aplicável

## 10. Consolidação final da homologação

- [ ] A homologação foi concluída com base neste documento.
- [ ] O comportamento observado foi comparado com `docs/MANUAL_DO_USUARIO.md`.
- [ ] As ressalvas foram registradas, quando existentes.
- [ ] As reprovações foram registradas, quando existentes.
- [ ] Há conclusão final formal sobre a aptidão funcional do sistema no escopo avaliado.

Data da homologação:

Responsável pela homologação:

Perfis utilizados na validação:

Ambiente validado:

Resumo final:

Resultado final:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Não aplicável
