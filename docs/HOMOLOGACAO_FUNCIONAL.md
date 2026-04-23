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
- [ ] O detalhe do contrato mostra a situação da execução financeira efetiva das solicitações vinculadas.
- [ ] O detalhe do contrato mostra valor executado, data da execução e vínculo com lançamento bancário, quando existentes.
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
- [ ] Solicitação sem preparo financeiro registrado não apresenta ação de execução efetiva.
- [ ] Solicitação preparada mostra quando aguarda apenas lançamento bancário compatível para a execução efetiva.
- [ ] A execução efetiva pode ser registrada por perfil autorizado no ambiente com gravação habilitada.
- [ ] A execução efetiva exige seleção de lançamento bancário compatível.
- [ ] A execução efetiva não permite reutilizar lançamento bancário já vinculado.
- [ ] A fila passa a mostrar valor executado, data da execução e vínculo bancário quando a execução já existir.
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
- [ ] O aprovado pendente de execução reflete a baixa mínima de solicitações já executadas efetivamente.

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
- [ ] A leitura de execução financeira efetiva corresponde ao que o manual descreve.
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
- [ ] O homologador reconhece que a execução efetiva agora depende de vínculo explícito com lançamento bancário já existente.
- [ ] Não foi identificada funcionalidade que contradiga a adequação normativa já incorporada ao escopo atual.
- [ ] O homologador reconhece que o sistema ainda não concluiu integração bancária automática, sucessão contratual, garantias e prazos operacionais mais amplos.

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

## 11. Atualiza��o desta rodada

### 11.1 Execu��o parcial

- [ ] A fila de libera��es informa quando a solicita��o est� com execu��o parcial.
- [ ] A fila mostra valor total aprovado, valor executado acumulado e valor pendente.
- [ ] O detalhe do contrato mostra a mesma leitura acumulada da execu��o.
- [ ] O sistema bloqueia registro de execu��o com valor acima do pendente.
- [ ] O sistema s� passa a ler a solicita��o como `liberada` quando o pendente chega a zero.
- [ ] A auditoria registra o valor executado, o acumulado e o saldo remanescente ap�s execu��o parcial.

Observa��es:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] N�o aplic�vel

### 11.2 Fechamento m�nimo da concilia��o

- [ ] A tela de concilia��o mostra a leitura de fechamento m�nimo da compet�ncia.
- [ ] A compet�ncia s� aparece como pronta para fechamento m�nimo quando n�o h� aprovado pendente de execu��o nem diferen�a n�o explicada.
- [ ] A execu��o parcial reduz o aprovado pendente de execu��o sem fingir fechamento autom�tico completo.
- [ ] A leitura de fechamento m�nimo corresponde ao que o manual descreve.

Observa��es:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] N�o aplic�vel

### 11.3 Fechamento formal e reabertura controlada da compet?ncia

- [ ] A tela de concilia??o mostra se a compet?ncia est? aberta, apta ao fechamento, fechada ou reaberta.
- [ ] O sistema s? permite fechamento formal quando a compet?ncia estiver pronta para fechamento m?nimo.
- [ ] O fechamento formal exige justificativa operacional.
- [ ] A reabertura controlada s? ? permitida para compet?ncia formalmente fechada.
- [ ] A reabertura controlada exige justificativa operacional.
- [ ] A tela mostra justificativa do fechamento e da reabertura quando existirem.
- [ ] A tela mostra ocorr?ncias m?nimas associadas ? compet?ncia.
- [ ] O detalhe do contrato reflete a mesma leitura operacional da compet?ncia.
- [ ] A auditoria registra o fechamento formal da compet?ncia.
- [ ] A auditoria registra a reabertura controlada da compet?ncia.

Observa??es:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] N?o aplic?vel

### 11.4 Historico minimo e tratamento subsequente da competencia

- [ ] A tela de conciliacao diferencia situacao atual, historico operacional e proxima acao sugerida da competencia.
- [ ] A tela de conciliacao mostra a ultima ocorrencia relevante da competencia.
- [ ] A linha do tempo operacional da competencia aparece em ordem cronologica.
- [ ] As justificativas de fechamento e reabertura permanecem visiveis quando existirem.
- [ ] A recomendacao operacional derivada pode aparecer como acompanhar, apta para fechamento, revisar justificativa, reavaliar apos reabertura ou verificar divergencia residual.
- [ ] O detalhe do contrato reflete a mesma leitura historica e a mesma recomendacao operacional exibidas na conciliacao.
- [ ] A serializacao preserva as ocorrencias existentes e a leitura derivada continua coerente no modo hibrido.

Observacoes:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Nao aplicavel

### 11.5 Classificacao minima das divergencias e filtros leves

- [ ] A tela de conciliacao mostra classificacao minima da divergencia por competencia.
- [ ] A tela de conciliacao mostra situacao de acompanhamento e prioridade operacional da competencia.
- [ ] A tela de conciliacao mostra apontamentos simples, como divergencia residual, pendencia de execucao, competencia reaberta, justificativa pendente ou justificativa sensivel.
- [ ] Os filtros simples permitem localizar divergencias residuais.
- [ ] Os filtros simples permitem localizar competencias reabertas.
- [ ] Os filtros simples permitem localizar competencias aptas a fechamento.
- [ ] Os filtros simples permitem localizar competencias com justificativa pendente ou sensivel.
- [ ] O detalhe do contrato reflete a mesma classificacao minima, prioridade e apontamentos exibidos na conciliacao.
- [ ] A leitura historica anterior da competencia permanece preservada.
- [ ] O fechamento e a reabertura controlada continuam sem regressao funcional.

Observacoes:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Nao aplicavel

### 11.6 Itens conciliatorios minimos e diferenca explicada

- [ ] A tela de conciliacao mostra itens conciliatorios minimos por competencia.
- [ ] Cada item conciliatorio informa se representa diferenca explicada registrada ou diferenca nao explicada residual.
- [ ] Quando houver item conciliatorio explicado, a tela mostra o lancamento bancario vinculado.
- [ ] Quando houver item conciliatorio explicado, a tela mostra a justificativa minima registrada.
- [ ] A conciliacao mostra a diferenca explicada com itemizacao minima.
- [ ] A conciliacao mostra a diferenca explicada ainda sem item conciliatorio minimo.
- [ ] A conciliacao mostra o que permanece como diferenca nao explicada residual.
- [ ] O registro de item conciliatorio minimo exige selecao de lancamento bancario e justificativa.
- [ ] O registro de item conciliatorio minimo nao altera indevidamente o fechamento ou a reabertura da competencia.
- [ ] O detalhe do contrato reflete os mesmos itens conciliatorios e a mesma leitura de diferenca explicada x nao explicada exibida na conciliacao.

Observacoes:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Nao aplicavel

### 11.7 Cobertura minima da diferenca explicada

- [ ] A conciliacao mostra o valor total da diferenca explicada por competencia.
- [ ] A conciliacao mostra o valor da diferenca explicada ja coberto por itemizacao minima.
- [ ] A conciliacao mostra o valor da diferenca explicada ainda sem itemizacao.
- [ ] A conciliacao mostra percentual simples de cobertura da diferenca explicada.
- [ ] A conciliacao classifica a cobertura como sem cobertura, cobertura parcial, cobertura suficiente ou cobertura completa.
- [ ] Quando houver saldo explicado sem itemizacao relevante, a conciliacao mostra recomendacao simples de revisao dirigida.
- [ ] A classificacao de cobertura completa nao altera indevidamente o fechamento ou a reabertura da competencia.
- [ ] A classificacao de cobertura suficiente nao cria tarefa formal nem workflow adicional.
- [ ] O detalhe do contrato reflete a mesma leitura de cobertura e revisao dirigida exibida na conciliacao.
- [ ] A leitura historica, a classificacao operacional e a diferenca nao explicada residual permanecem preservadas.

Observacoes:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Nao aplicavel

### 11.8 Origem operacional do saldo explicado sem itemizacao

- [ ] A conciliacao mostra a origem operacional presumida do saldo explicado ainda sem itemizacao.
- [ ] A leitura diferencia saldo explicado sem detalhamento de itemizacao em andamento.
- [ ] A leitura diferencia justificativa insuficiente de mera cobertura parcial.
- [ ] A leitura diferencia saldo residual de baixa materialidade de saldo ainda relevante para revisao.
- [ ] Quando nao houver saldo remanescente, a conciliacao mostra essa situacao sem gerar revisao indevida.
- [ ] A recomendacao de revisao dirigida permanece coerente com a origem operacional classificada.
- [ ] O detalhe do contrato reflete a mesma origem operacional presumida exibida na conciliacao.
- [ ] A classificacao nao altera indevidamente o fechamento, a reabertura, a cobertura minima ou a diferenca nao explicada residual.

Observacoes:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Nao aplicavel

### 11.9 Priorizacao visual e filtros leves do saldo remanescente
- [ ] A conciliacao mostra prioridade visual baixa, media ou alta para o saldo explicado remanescente sem itemizacao.
- [ ] A prioridade visual permanece coerente com a origem operacional classificada do saldo remanescente.
- [ ] A tela informa o motivo principal da priorizacao visual.
- [ ] O filtro de remanescente relevante localiza competencias com saldo explicado ainda sem itemizacao que merecem maior atencao.
- [ ] O filtro de justificativa insuficiente localiza competencias cuja faixa remanescente depende de melhor justificativa.
- [ ] O filtro de itemizacao em andamento localiza competencias com cobertura parcial ainda relevante.
- [ ] O filtro de baixa materialidade localiza competencias em que o remanescente existe, mas aparece apenas como faixa residual pequena.
- [ ] O detalhe do contrato reflete a mesma prioridade visual e o mesmo motivo principal exibidos na conciliacao.
- [ ] A priorizacao visual e os filtros leves nao alteram indevidamente a cobertura, a origem operacional, o fechamento ou a reabertura da competencia.
Observacoes:
Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Nao aplicavel



### 11.10 Quadro gerencial resumido por contrato

- [ ] O detalhe do contrato exibe o quadro gerencial quando existe pelo menos uma competencia conciliatoria registrada.
- [ ] O quadro exibe o valor total da diferenca explicada agregada de todas as competencias.
- [ ] O quadro exibe o valor coberto por itemizacao minima registrada.
- [ ] O quadro exibe o valor explicado ainda sem itemizacao.
- [ ] O quadro exibe o valor residual nao explicado ainda aberto.
- [ ] O percentual de cobertura geral e calculado corretamente a partir dos agregados.
- [ ] A situacao da cobertura geral aparece como sem divergencia, cobertura suficiente, cobertura parcial ou residual nao explicado presente, de forma coerente com os valores.
- [ ] A atencao gerencial aparece como normal, requer acompanhamento ou requer revisao, de forma coerente com as situacoes das competencias subjacentes.
- [ ] O sinal de residual aberto aparece apenas quando existe diferenca nao explicada em pelo menos uma competencia.
- [ ] O sinal de reabertura aparece apenas quando existe competencia com estado formal reaberta.
- [ ] O sinal de remanescente relevante aparece apenas quando existe saldo explicado sem itemizacao de prioridade media ou alta.
- [ ] O sinal sem alerta aparece apenas quando nenhum dos tres alertas anteriores esta ativo.
- [ ] O quadro nao e exibido quando o contrato nao possui competencias conciliatorias registradas.
- [ ] O quadro nao altera o fechamento, a reabertura, os itens conciliatorios, a cobertura por competencia ou a diferenca nao explicada de nenhuma competencia individual.
- [ ] A leitura por competencia continua coerente com a leitura agregada exibida no quadro gerencial.

Observacoes:

Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Nao aplicavel
### 11.11 Leitura transversal minima na listagem de contratos
- [ ] A listagem de contratos exibe atencao gerencial agregada como normal, requer acompanhamento ou requer revisao.
- [ ] A listagem mostra o valor residual nao explicado do contrato.
- [ ] A listagem mostra o valor explicado ainda remanescente sem itemizacao minima.
- [ ] A listagem mostra a cobertura agregada minima do contrato.
- [ ] A atencao gerencial na listagem permanece coerente com o resumo conciliatorio agregado do contrato.
- [ ] A atencao gerencial na listagem permanece coerente com o quadro resumido exibido no detalhe do contrato.
- [ ] O contrato com residual nao explicado aberto aparece como requer revisao.
- [ ] O contrato sem residual aberto e sem remanescente relevante aparece como normal.
- [ ] Os marcadores leves de residual aberto, competencia reaberta, remanescente relevante ou situacao normal aparecem de forma coerente com a agregacao.
- [ ] A listagem continua funcionalmente leve e nao passa a se comportar como dashboard pesado.
Observacoes:
Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Nao aplicavel### 11.12 Leitura leve de divergencia estrutural e pontual
- [ ] A conciliacao classifica a divergencia da competencia como estrutural, pontual, mista ou indeterminada.
- [ ] A classificacao vem acompanhada de motivo operacional simples e legivel.
- [ ] A classificacao estrutural permanece coerente com residual nao explicado aberto, reabertura ou falta de detalhamento minimo suficiente.
- [ ] A classificacao pontual permanece coerente com cobertura suficiente, ajuste localizado ou faixa residual pequena.
- [ ] A classificacao mista permanece coerente quando coexistem residual aberto e tratamento localizado parcial.
- [ ] A classificacao indeterminada nao gera alarme indevido quando nao existe divergencia relevante.
- [ ] O detalhe do contrato reflete a mesma classificacao exibida na conciliacao.
- [ ] A nova leitura nao altera indevidamente cobertura, origem remanescente, prioridade visual, fechamento ou reabertura da competencia.
Observacoes:
Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Nao aplicavel
### 11.13 Recorrencia leve dos perfis ao longo do contrato
- [ ] O detalhe do contrato indica se ha sem recorrencia relevante, recorrencia leve ou recorrencia relevante.
- [ ] Quando houver repeticao relevante, o contrato exibe os sinais recorrentes de forma legivel e coerente com as competencias.
- [ ] A competencia conciliada passa a indicar se o caso parece isolado ou parte de padrao recorrente do contrato.
- [ ] O motivo operacional da recorrencia e curto, compreensivel e coerente com os sinais ja existentes.
- [ ] A conciliacao e o detalhe do contrato exibem a mesma leitura de recorrencia para a mesma competencia.
- [ ] A nova leitura nao altera indevidamente cobertura, origem do saldo remanescente, prioridade visual, fechamento ou reabertura.
Observacoes:
Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Nao aplicavel

### 11.14 Evolucao temporal leve da recorrencia
- [ ] O detalhe do contrato indica se a recorrencia parece ativa, em reducao, historico superado ou sem base temporal suficiente.
- [ ] A justificativa curta da evolucao temporal e coerente com as competencias mais recentes e com o historico do contrato.
- [ ] Quando houver sinais recentes, eles aparecem destacados como recentes no resumo do contrato.
- [ ] Quando houver sinais restritos ao historico, eles aparecem como historicos no resumo do contrato.
- [ ] A competencia conciliada indica se pertence a padrao ainda ativo, padrao mais historico, caso isolado ou sem base temporal suficiente.
- [ ] A conciliacao, o detalhe do contrato e a listagem permanecem coerentes entre si quando houver reflexo dessa leitura.
- [ ] A nova leitura temporal nao altera indevidamente recorrencia, cobertura, prioridade visual, fechamento ou reabertura.
Observacoes:
Resultado:
- [ ] Aprovado
- [ ] Aprovado com ressalva
- [ ] Reprovado
- [ ] Nao aplicavel
