# Manual do Usuário

## 1. Apresentação do sistema

O Sistema de Conta Vinculada é um ambiente interno de apoio à gestão de contratos administrativos com dedicação exclusiva de mão de obra. Ele concentra, em uma única interface, a visão de contratos, saldos, solicitações de liberação, conciliação, trilha de auditoria e administração básica de usuários internos.

Este manual foi escrito para orientar a operação do sistema por usuários internos do órgão. O foco aqui é explicar o que cada área faz, quais informações aparecem na tela e como registrar ou consultar dados com segurança.

## 2. Finalidade do sistema

O sistema foi criado para apoiar o acompanhamento institucional da conta vinculada, reduzindo controles paralelos e facilitando a visão operacional sobre:

- contratos em acompanhamento;
- saldo bancário e provisões gerenciais;
- solicitações de liberação e seu andamento;
- diferenças de conciliação;
- eventos relevantes para auditoria interna;
- perfis internos de acesso.

Na prática, o sistema ajuda a organizar a fila de trabalho e a leitura das informações mais sensíveis do contrato, especialmente no contexto do Judiciário.

## 3. Perfis de usuário

Os perfis internos atualmente previstos no sistema são:

- `Administrador do órgão`: possui a visão mais ampla do ambiente, incluindo administração.
- `Analista`: acompanha contratos, liberações e auditoria, com foco em análise operacional.
- `Financeiro`: acompanha contratos, liberações e conciliação.
- `Auditoria interna`: acompanha contratos, conciliação e trilha de auditoria.

O menu lateral pode variar conforme o perfil. Nem todos os usuários visualizam os mesmos módulos.

## 4. Acesso ao sistema

O acesso é feito pela tela de login. Depois da autenticação, o usuário é direcionado ao ambiente interno do sistema.

Ao entrar, o usuário encontra:

- o nome da instituição no menu lateral;
- o próprio nome, perfil, email e escopo;
- o botão para encerrar a sessão.

Se o acesso não estiver disponível, confirme com a administração interna se o seu perfil está habilitado no ambiente.

## 5. Visão geral da navegação

O menu lateral organiza o sistema por módulos:

- Painel institucional
- Contratos
- Liberações
- Conciliação
- Auditoria
- Administração
- Manual do usuário

Cada módulo tem foco diferente:

- o painel principal resume a situação geral;
- contratos mostra a visão por contrato;
- liberações concentra a fila de solicitações;
- conciliação destaca diferenças entre valores;
- auditoria mostra a trilha de eventos;
- administração exibe usuários e perfis internos;
- manual do usuário apresenta a orientação funcional de uso dentro do próprio sistema.

## 6. Painel principal

O painel principal apresenta uma visão executiva do ambiente.

O usuário encontra, logo na entrada:

- saldo bancário total;
- provisões líquidas;
- quantidade de solicitações pendentes;
- diferença não explicada;
- contratos monitorados;
- itens pendentes de análise.

Também existe uma lista priorizada de contratos com maior risco operacional imediato. Essa lista ajuda a decidir por onde começar a análise.

O usuário deve usar o painel para:

- identificar contratos com maior urgência;
- localizar diferenças conciliatórias;
- perceber aumento de pendências;
- entrar rapidamente no detalhe do contrato.

## 7. Módulo de contratos

O módulo de contratos apresenta uma visão consolidada de cada contrato monitorado.

Na lista principal, o usuário visualiza:

- nome e código do contrato;
- empresa vinculada;
- saldo bancário;
- provisões;
- valor reservado;
- diferença conciliatória;
- ação para abrir o detalhe.

Ao abrir um contrato, o usuário encontra uma visão mais completa, com:

- dados gerais do contrato;
- situação do contrato;
- empresa relacionada;
- competências e seus status;
- empregados alocados;
- provisões por empregado e rubrica;
- conta vinculada e eventos bancários;
- solicitações de liberação do contrato;
- trilha de auditoria ligada ao contrato.

Esse módulo deve ser usado para confirmar contexto antes de agir em liberações, conciliação ou auditoria.

## 8. Módulo de liberações

O módulo de liberações é o principal ponto de operação do fluxo de solicitação de liberação.

Hoje a tela possui duas partes:

- formulário de criação da solicitação;
- fila de solicitações já registradas.

### 8.1 Criação de solicitação

O formulário atual permite registrar uma solicitação com os seguintes elementos principais:

- contrato;
- tipo de liberação;
- forma de movimentação;
- competência inicial;
- competência final;
- fundamento do pedido;
- observações internas;
- um ou mais itens da solicitação.

Cada item da solicitação pode conter:

- empregado;
- rubrica;
- competência do item;
- data de admissão;
- início da alocação;
- fim da alocação, quando houver;
- data do fato gerador;
- valor solicitado;
- memória de cálculo;
- observações do item.

O sistema calcula e exibe o total solicitado com base nos itens informados.

### 8.2 Como operar a criação

Passo a passo funcional:

1. selecionar o contrato;
2. selecionar o tipo de liberação;
3. selecionar a forma de movimentação;
4. informar a competência inicial e final do pedido;
5. descrever o fundamento do pedido;
6. preencher pelo menos um item;
7. adicionar novos itens, se o pedido abranger mais de um empregado ou rubrica;
8. revisar o total solicitado;
9. enviar a solicitação.

### 8.3 Fila de solicitações

Na mesma tela, o usuário acompanha a fila de solicitações registradas.

Cada bloco da fila mostra:

- protocolo;
- tipo de liberação;
- quem criou;
- período do pedido;
- forma de movimentação;
- status;
- valor solicitado;
- valor aprovado;
- quantidade de pendências documentais.

Dentro de cada solicitação, o sistema mostra os itens com:

- rubrica;
- competência;
- empregado;
- data do fato gerador;
- valor solicitado;
- valor validado;
- valor aprovado;
- decisão do item;
- memória de cálculo, quando informada.

### 8.4 Fluxo funcional atual

Funcionalmente, o usuário deve entender o fluxo assim:

- a solicitação é registrada e passa a compor a fila interna;
- os itens podem ser acompanhados pelo status e pelos valores;
- quando o perfil tiver permissão e a gravação estiver habilitada, a decisão por item pode ser registrada na própria fila;
- a aprovação total, a aprovação parcial e a rejeição ou glosa exigem conferência do valor aprovado e, quando necessário, justificativa;
- a execução financeira efetiva agora pode ser registrada com vínculo a lançamento bancário já existente;
- a integração bancária automática continua fora do sistema.

### 8.4.1 Fronteira entre exigência documental, análise e decisão agregada

Nesta etapa do sistema, a leitura da solicitação passou a ficar separada em três perguntas operacionais:

- `Exigência documental`: mostra se ainda existe pendência documental da etapa atual;
- `Análise`: mostra se a solicitação ainda aguarda início de análise, se está em exigência documental, se está em análise em andamento ou se a análise já foi concluída;
- `Decisão agregada`: mostra se o pedido ainda não tem decisão suficiente, se já tem decisões parciais sem consolidação final ou se a solicitação já permite uma leitura agregada de aprovação, aprovação parcial ou rejeição.

Interpretação prática:

- uma solicitação pode estar com pendência documental e ainda sem decisão agregada;
- uma solicitação pode já ter itens analisados e, ainda assim, não estar consolidada globalmente;
- decisão de item não substitui a verificação documental da etapa;
- a situação consolidada do pedido deve ser lida pelo conjunto dessas três informações, e não apenas pelo resultado isolado de um item.

### 8.4.2 Aprovação administrativa posterior da solicitação

Depois que a análise dos itens estiver suficientemente consolidada, o sistema passa a mostrar uma quarta leitura operacional: a `Aprovação administrativa`.

Na prática, essa leitura indica se a solicitação:

- ainda não está apta para aprovação administrativa;
- já está pronta para aprovação administrativa;
- foi aprovada administrativamente;
- foi aprovada parcialmente na consolidação;
- foi rejeitada na consolidação administrativa.

Para que a solicitação fique apta a essa consolidação, o usuário deve interpretar que:

- não pode haver pendência documental relevante na etapa atual;
- os itens precisam já ter decisão suficiente para leitura agregada do pedido;
- a aprovação administrativa é posterior à decisão por item;
- essa aprovação ainda não significa execução financeira concluída.

Quando houver permissão e ambiente de gravação habilitado, a fila permite registrar a consolidação administrativa diretamente na solicitação.

O sistema também passa a informar a `Aptidão para futura etapa financeira`. Essa mensagem serve apenas para mostrar se a solicitação ficou preparada para a etapa posterior, considerando a forma de movimentação e o regime normativo do contrato. Ela não representa pagamento, resgate ou operação bancária já executada.

### 8.4.3 Preparo da futura execução financeira

Depois da aprovação administrativa, o sistema passa a mostrar também a leitura de `Preparo da futura execução financeira`.

Essa leitura serve para o usuário entender:

- se a solicitação já pode seguir para um preparo interno da etapa financeira;
- qual valor consolidado está apto para a futura movimentação;
- qual é o movimento esperado;
- quais evidências mínimas ainda faltam;
- se a leitura de saldo e conciliação já permite avançar com segurança;
- e se já existe registro interno desse preparo.

Na prática, o sistema considera essa etapa distinta da execução efetiva. O registro de preparo:

- não cria movimentação bancária real;
- não gera extrato bancário verdadeiro;
- não significa que a liberação foi executada;
- apenas registra que a solicitação foi preparada internamente para a futura execução.

O usuário deve interpretar essa etapa assim:

- `Ainda não apta`: ainda falta condição mínima para o preparo;
- `Pronta para preparo da futura execução`: a solicitação já pode receber o registro interno de preparo;
- `Preparo interno já registrado`: o preparo da futura execução já foi lançado internamente, mas a execução bancária efetiva continua separada.

O sistema também passa a mostrar:

- `Valor apto à futura execução`;
- `Movimento esperado`;
- `Evidências mínimas desta etapa`;
- `Evidências ainda faltantes`;
- leitura de saldo considerada;
- leitura da conciliação considerada;
- indicação explícita de que não existe execução financeira efetiva registrada, quando for o caso.

### 8.4.4 Execução financeira efetiva

Depois do preparo financeiro interno, o sistema passa a mostrar também a leitura de `Execução financeira efetiva`.

Essa leitura serve para o usuário entender:

- se a solicitação ainda não pode ser executada;
- se ela já está preparada e apenas aguarda vínculo com lançamento bancário compatível;
- se a execução efetiva já foi registrada;
- qual valor foi efetivamente executado;
- em que data a execução foi registrada;
- a qual lançamento bancário a execução ficou vinculada.

Na prática, essa etapa:

- exige que o preparo financeiro já tenha sido registrado;
- usa lançamento bancário já existente e compatível com a solicitação;
- grava internamente a execução efetiva da solicitação;
- reduz a leitura de valor pendente de execução na conciliação;
- não representa integração automática com o banco nem importação automática de extrato.

O usuário deve interpretar essa etapa assim:

- `Ainda não apta para execução efetiva`: a solicitação ainda não reuniu as condições mínimas para o registro final;
- `Preparada e aguardando execução efetiva`: a solicitação já foi preparada e aguarda apenas o vínculo com o lançamento bancário compatível;
- `Execução financeira efetiva registrada`: o sistema já registrou a execução, com valor, data e vínculo bancário.

Quando houver permissão e ambiente de gravação habilitado, a fila permite registrar a execução efetiva escolhendo o lançamento bancário compatível da própria etapa.

### 8.5 Pendências documentais e acompanhamento

O sistema passou a organizar a leitura documental da solicitação por etapa do fluxo. Isso ajuda o usuário a perceber com mais clareza o que já deveria estar instruído agora e o que só será exigido em momento posterior.

Neste momento do projeto:

- a fila e o detalhe do contrato mostram os documentos esperados na etapa atual;
- a fila e o detalhe do contrato mostram as pendências documentais da etapa atual;
- o sistema também pode indicar documentos previstos para etapa posterior, como operação bancária ou encerramento;
- o upload e a gestão completa de documentos ainda não estão concluídos.

Na prática, o usuário deve interpretar essa leitura assim:

- `Documentos esperados nesta etapa`: conjunto mínimo de documentos que a solicitação já deveria apresentar no estágio atual;
- `Pendências documentais desta etapa`: documentos ainda faltantes para a etapa atual;
- `Documentos previstos para etapa posterior`: documentos ligados a fases futuras, que ainda não entram como pendência imediata.

Quando disponível, essa leitura também aparece agrupada por natureza do documento, como:

- fato gerador;
- cálculo;
- quitação;
- operação;
- encerramento.

O usuário deve usar essa informação como sinalização operacional de acompanhamento, e não como substituto da gestão documental completa.

### 8.6 Análise e decisão por item

Quando o usuário tiver perfil autorizado e o ambiente estiver com gravação habilitada, a própria fila de solicitações permite registrar a decisão dos itens ainda pendentes.

Na prática, o usuário pode:

- aprovar integralmente o item;
- aprovar parcialmente o item;
- rejeitar ou glosar o item.

Na análise, o usuário deve observar:

- valor solicitado;
- valor validado;
- valor aprovado;
- justificativa informada na decisão, quando exigida.

Regras funcionais importantes:

- aprovação total exige valor aprovado igual ao valor solicitado;
- aprovação parcial exige justificativa e valor aprovado menor que o solicitado;
- rejeição ou glosa exige valor aprovado igual a zero e justificativa;
- solicitação em exigência documental não deve receber decisão de item enquanto permanecer nessa situação;
- item já decidido não deve voltar para nova análise na mesma etapa.

### 8.7 Modo somente leitura

Quando o sistema estiver sem base de dados habilitada para gravação, a tela de liberações entra em modo somente leitura.

Nesse caso:

- a fila continua visível para consulta;
- a criação de nova solicitação fica indisponível;
- o próprio sistema informa que a gravação depende de base de dados habilitada.

Se isso acontecer, o usuário deve tratar o ambiente como consulta, e não como ambiente de registro operacional.

## 9. Módulo de conciliação

O módulo de conciliação apresenta a comparação entre:

- saldo bancário;
- provisões;
- aprovado pendente de execução;
- diferença explicada;
- diferença não explicada.

Também mostra um status resumido da diferença.

Esse módulo serve para:

- identificar divergências entre o controle gerencial e a situação bancária;
- priorizar análises;
- apoiar a verificação de saldos e pendências.

Hoje o módulo está voltado principalmente para consulta.

## 10. Módulo de auditoria

O módulo de auditoria apresenta a linha do tempo de eventos relevantes do sistema.

Em cada registro, o usuário vê:

- ação realizada;
- responsável;
- data e hora do evento;
- entidade envolvida;
- descrição resumida.

Esse módulo é útil para:

- rastrear decisões;
- acompanhar eventos relevantes;
- apoiar verificações internas;
- recuperar o histórico recente de movimentações registradas no sistema.

## 11. Módulo de administração

O módulo de administração exibe a relação de usuários internos cadastrados no ambiente atual.

O usuário visualiza:

- nome;
- perfil;
- escopo;
- situação de MFA.

Neste momento, o módulo funciona principalmente como visão administrativa e de consulta. A gestão completa de usuários ainda não está concluída.

## 12. Como interpretar status, pendências e alertas

### 12.1 Status de contrato

O contrato pode aparecer com situações que ajudam a interpretar o momento operacional. O usuário deve observar sempre a situação do contrato junto com saldos, provisões e diferença conciliatória.

### 12.2 Status de competência

As competências podem aparecer com situações como:

- em processamento;
- fechada;
- conciliada;
- reaberta.

Interpretação prática:

- `em processamento`: a competência ainda está em andamento;
- `fechada`: o ciclo foi encerrado;
- `conciliada`: os valores já passaram pelo tratamento de conciliação;
- `reaberta`: houve necessidade de reavaliação.

### 12.3 Status de solicitação de liberação

As solicitações podem aparecer com status como:

- `em elaboracao`
- `enviada`
- `em exigencia`
- `em analise`
- `aprovada`
- `aprovada parcial`
- `rejeitada`
- `liberada`
- `cancelada`

Nem todos esses estados representam funcionalidade completa já concluída ponta a ponta, mas a nomenclatura orienta a leitura operacional da fila.

Interpretação prática:

- `em elaboracao`: pedido ainda em montagem;
- `enviada`: pedido formalizado na fila e ainda aguardando início de análise;
- `em exigencia`: há pendência documental ou complemento exigido para a etapa atual;
- `em analise`: a análise está em andamento e ainda não há decisão agregada final;
- `aprovada`: pedido aceito integralmente;
- `aprovada parcial`: parte do pedido foi acolhida;
- `rejeitada`: pedido não acolhido;
- `liberada`: execução financeira efetiva já registrada com vínculo interno ao lançamento bancário;
- `cancelada`: pedido interrompido.

Leitura complementar importante:

- o status global da solicitação não elimina a leitura separada de exigência documental, análise e decisão agregada;
- a aprovação administrativa deve ser lida separadamente da decisão agregada dos itens;
- uma solicitação pode estar com decisão agregada suficiente e ainda não ter aprovação administrativa registrada;
- a aptidão para futura etapa financeira depende da consolidação administrativa e não deve ser confundida com liberação bancária efetivamente realizada;
- o preparo da futura execução financeira também deve ser lido separadamente da execução bancária efetiva;
- uma solicitação pode estar preparada internamente para a etapa financeira e, ainda assim, continuar sem execução financeira registrada;
- a execução financeira efetiva depende de vínculo explícito com lançamento bancário compatível;
- a decisão agregada só deve ser considerada consolidada quando os itens necessários já tiverem recebido decisão suficiente;
- o usuário deve observar também a contagem de itens ainda pendentes e as pendências documentais da etapa.

### 12.4 Decisão do item

Os itens podem indicar situações como:

- `pendente`
- `aprovado`
- `aprovado parcial`
- `glosado`

Essas informações ajudam a diferenciar o resultado de cada item dentro da solicitação.

### 12.5 Alertas e diferenças

Alertas normalmente aparecem quando há:

- diferença não explicada;
- pendências documentais;
- reabertura de competência;
- itens aguardando análise.

O usuário deve usar esses alertas como prioridade de acompanhamento, e não como mera informação visual.

## 13. Boas práticas de uso

- conferir o contrato antes de registrar qualquer solicitação;
- revisar empregado, rubrica, competência e datas antes do envio;
- registrar fundamento claro e objetivo;
- descrever memória de cálculo suficiente para entendimento posterior;
- acompanhar a fila de solicitações após o registro;
- usar a conciliação e a auditoria como apoio de verificação;
- encerrar a sessão ao finalizar o uso.

## 14. Cuidados ao registrar informações

- não registrar pedido em contrato errado;
- não informar valor sem revisar a memória de cálculo;
- não usar observações internas para textos vagos ou sem contexto;
- não ignorar pendências documentais sinalizadas na leitura;
- não tratar o sistema como ambiente transacional completo quando ele estiver em modo somente leitura;
- não presumir que todos os módulos já fazem todas as etapas do processo sem confirmação na tela.

## 15. Perguntas frequentes

### O que fazer se eu entrar em Liberações e o sistema informar que está em modo somente leitura?

Use a tela apenas para consulta. Nesse modo, novas solicitações não podem ser registradas.

### Posso registrar mais de um item na mesma solicitação?

Sim. O formulário permite adicionar mais de um item.

### O que significa pendência documental?

É a indicação de que a solicitação ainda demanda documento esperado para a etapa atual do pedido.

### O que significa “decisão agregada”?

É a leitura consolidada da solicitação como um todo, calculada a partir das decisões dos itens já registradas. Ela não se confunde com a decisão isolada de um item nem substitui a análise documental.

### O que significa “documento previsto para etapa posterior”?

É um documento que o sistema já reconhece como parte do fluxo, mas que ainda não é tratado como pendência imediata naquele estágio da solicitação.

### O sistema já faz a execução financeira completa?

Parcialmente. O sistema já permite registrar a execução financeira efetiva com vínculo a lançamento bancário existente, mas ainda não faz integração bancária automática nem cobre todo o ciclo operacional de forma externa.

### O que significa “aprovação administrativa”?

É a consolidação administrativa da solicitação depois da análise dos itens. Ela confirma a leitura global do pedido, mas ainda não executa financeiramente a liberação.

### O que significa “preparo da futura execução financeira”?

É o registro interno de que a solicitação já reuniu condições mínimas para seguir à próxima etapa financeira. Esse preparo continua diferente da execução bancária efetiva e não substitui lançamento bancário real.

### O que significa “execução financeira efetiva”?

É o registro interno de que a solicitação foi efetivamente executada, com valor, data e vínculo a um lançamento bancário já existente. Essa etapa continua diferente de integração bancária automática.

### O módulo de administração já permite gerir tudo sobre usuários?

Não. Atualmente ele funciona principalmente como visão de consulta sobre usuários, perfis, escopo e situação de MFA.

### O módulo de conciliação já resolve divergências diretamente?

Hoje ele serve principalmente para leitura e acompanhamento das diferenças.

## 16. Glossário funcional básico

- `Conta vinculada`: conta utilizada para controle de valores relacionados ao contrato.
- `Competência`: período de referência usado para processamento e acompanhamento.
- `Provisão gerencial`: controle interno de valor por empregado e rubrica.
- `Saldo bancário`: valor registrado na conta vinculada do contrato.
- `Solicitação de liberação`: pedido registrado no sistema para liberar valores ligados ao contrato.
- `Rubrica`: natureza da verba registrada em um item da solicitação.
- `Fato gerador`: evento que justifica o pedido, como férias, décimo terceiro ou rescisão.
- `Pendência documental`: indicação de documento esperado para a etapa atual que ainda não está considerado completo na leitura do pedido.
- `Conciliação`: comparação entre valores bancários e valores gerenciais.
- `Auditoria`: histórico de eventos relevantes do sistema.

## 17. Atualiza��o desta rodada

O m�dulo de libera��es passou a admitir execu��o financeira parcial da solicita��o, sem perder a distin��o entre:

- preparo financeiro;
- execu��o efetiva parcial;
- execu��o efetiva total.

Na leitura operacional da fila e do contrato, o usu�rio agora deve observar tamb�m:

- `Valor total aprovado` para a etapa financeira;
- `Valor executado acumulado`;
- `Valor pendente de execu��o`;
- `Quantidade de execu��es registradas`;
- �ltima data e �ltimo lan�amento banc�rio vinculado.

Interpreta��o pr�tica adicional:

- `Execu��o financeira parcial registrada`: parte do valor j� foi executada, mas a solicita��o ainda n�o deve ser lida como totalmente liberada;
- `Execu��o financeira efetiva registrada`: o valor pendente chegou a zero e a solicita��o passou a ser lida como liberada;
- um lan�amento banc�rio compat�vel pode registrar apenas parte do saldo pendente, desde que n�o ultrapasse esse saldo.

No m�dulo de concilia��o, a tela passou a mostrar tamb�m a leitura de `Fechamento m�nimo` da compet�ncia:

- `pronta`: n�o existe valor aprovado pendente de execu��o e n�o existe diferen�a n�o explicada;
- `com pend�ncias`: ainda resta valor pendente de execu��o e/ou diferen�a n�o explicada.

Essa leitura de fechamento m�nimo � apenas operacional. Ela n�o substitui eventual fluxo futuro de fechamento formal da compet�ncia.

## 18. Atualiza??o desta rodada

O m?dulo de concilia??o passou a diferenciar tamb?m o `Fechamento formal` da compet?ncia:

- `aberta`: a compet?ncia segue em acompanhamento operacional;
- `apta ao fechamento`: a compet?ncia j? atende ao fechamento m?nimo e pode receber fechamento formal;
- `fechada`: o fechamento formal foi registrado com justificativa;
- `reaberta`: a compet?ncia foi reaberta de forma controlada, tamb?m com justificativa pr?pria.

Leitura pr?tica adicional:

- o fechamento formal n?o acontece automaticamente s? porque a compet?ncia ficou pronta no fechamento m?nimo;
- para fechar formalmente, o usu?rio precisa registrar uma justificativa operacional;
- para reabrir uma compet?ncia fechada, o usu?rio tamb?m precisa registrar justificativa;
- a tela passa a mostrar a justificativa do fechamento, a justificativa da reabertura e as ocorr?ncias m?nimas ligadas ? compet?ncia;
- o detalhe do contrato passa a refletir essa mesma leitura por compet?ncia, sem tratar isso como encerramento cont?bil total do contrato.

## 19. Atualizacao desta rodada

O modulo de conciliacao passou a diferenciar com mais clareza tres camadas de leitura da competencia:

- `situacao atual`;
- `historico operacional`;
- `proxima acao sugerida`.

Na pratica, a tela de conciliacao agora mostra para cada competencia:

- a situacao atual consolidada da competencia;
- a ultima ocorrencia relevante;
- a linha do tempo operacional em ordem cronologica;
- as justificativas de fechamento e reabertura, quando existirem;
- a proxima acao recomendada pelo sistema.

Leitura pratica adicional:

- `situacao atual` mostra como a competencia deve ser lida agora, considerando fechamento minimo, fechamento formal, reabertura e pendencias remanescentes;
- `historico operacional` mostra o que ja foi registrado ao longo do tempo, sem confundir passado com estado atual;
- `proxima acao sugerida` indica apenas um tratamento operacional recomendado, sem criar obrigacao automatica nem workflow adicional.

As recomendacoes operacionais podem aparecer, de forma simples, como:

- `acompanhar`;
- `apta para fechamento`;
- `revisar justificativa`;
- `reavaliar apos reabertura`;
- `verificar divergencia residual`.

O detalhe do contrato passou a refletir a mesma leitura da conciliacao para cada competencia vinculada ao contrato. Assim, o usuario encontra a mesma interpretacao da competencia tanto no modulo de conciliacao quanto na visao detalhada do contrato.

## 20. Atualizacao desta rodada

O modulo de conciliacao passou a qualificar de forma minima os apontamentos de divergencia da competencia, sem criar fila de tarefas formal.

A leitura operacional agora pode destacar, para cada competencia:

- `classificacao minima da divergencia`;
- `situacao de acompanhamento`;
- `prioridade operacional`;
- `apontamentos simples` ligados a diferenca residual, pendencia de execucao, reabertura, justificativa pendente ou justificativa sensivel.

Na pratica, a classificacao minima pode aparecer como:

- `divergencia residual`;
- `pendencia de execucao`;
- `justificativa sensivel`;
- `acompanhamento regular`;
- `apta para fechamento`.

A tela de conciliacao tambem passou a oferecer filtros simples de acompanhamento para localizar:

- divergencias residuais;
- competencias reabertas;
- competencias aptas a fechamento;
- competencias com justificativa pendente ou sensivel.

Leitura pratica adicional:

- `classificacao minima da divergencia` ajuda a entender o tipo predominante de problema da competencia no momento;
- `situacao de acompanhamento` indica se a competencia esta apenas em acompanhamento, se exige revisao ou se ja foi tratada minimamente;
- `prioridade operacional` serve para ordenar a atencao diaria do usuario, sem transformar a conciliacao em gerenciador de tarefas.

O detalhe do contrato passou a refletir a mesma classificacao, a mesma prioridade e os mesmos apontamentos simples exibidos no modulo de conciliacao.

### 11.6 Itens conciliatorios minimos e diferenca explicada

A conciliacao passou a exibir, por competencia, itens conciliatorios minimos para detalhar a parte da diferenca que ja esta tratada como explicada.

Cada item conciliatorio pode apresentar:

- classificacao simples do item;
- valor associado ao item;
- indicacao se o item foi registrado manualmente ou apenas derivado da leitura residual;
- lancamento bancario vinculado, quando existir;
- justificativa minima da diferenca explicada.

Leitura pratica da tela:

- diferenca explicada com itemizacao minima mostra o montante da diferenca explicada que ja possui item conciliatorio registrado;
- diferenca explicada ainda sem item mostra a parte explicada que ainda nao recebeu detalhamento minimo por item;
- diferenca nao explicada remanescente mostra o saldo que continua sem explicacao na competencia.

Quando houver permissao operacional e banco habilitado, o usuario pode registrar um item conciliatorio minimo selecionando um lancamento bancario da mesma competencia e informando justificativa curta da diferenca explicada.

Esse registro:

- nao fecha automaticamente a competencia;
- nao elimina, por si so, a diferenca nao explicada residual;
- nao cria nova etapa formal de aprovacao;
- serve apenas para qualificar a leitura operacional da conciliacao.

O detalhe do contrato passou a refletir os mesmos itens conciliatorios, os mesmos vinculos com lancamentos e a mesma separacao entre diferenca explicada com item minimo, diferenca explicada ainda sem item e diferenca nao explicada residual.

### 11.7 Cobertura minima da diferenca explicada

A conciliacao passou a mostrar, por competencia, o grau minimo de cobertura da diferenca explicada com base nos itens conciliatorios ja registrados.

A leitura operacional agora destaca:

- valor total da diferenca explicada;
- valor da diferenca explicada ja coberto por itemizacao minima;
- valor da diferenca explicada ainda sem itemizacao;
- percentual simples de cobertura;
- situacao operacional da cobertura.

A situacao operacional da cobertura pode aparecer como:

- sem cobertura, quando existe diferenca explicada sem qualquer item conciliatorio minimo;
- cobertura parcial, quando ha itemizacao inicial, mas ainda resta saldo relevante sem itemizacao;
- cobertura suficiente, quando a maior parte ja esta itemizada e sobra apenas saldo residual menor;
- cobertura completa, quando toda a diferenca explicada ja esta coberta ou quando nao ha diferenca explicada a itemizar.

Quando ainda houver saldo explicado sem itemizacao relevante, a conciliacao tambem mostra uma recomendacao simples de revisao dirigida para orientar a leitura diaria. Essa recomendacao nao cria tarefa formal, nao gera aprovacao adicional e nao encerra automaticamente a competencia.

O detalhe do contrato passou a refletir a mesma leitura de cobertura, com o mesmo grau, o mesmo percentual e a mesma recomendacao simples de revisao dirigida exibidos no modulo de conciliacao.

### 11.8 Origem operacional do saldo explicado sem itemizacao

Quando ainda existir saldo explicado sem itemizacao minima, a conciliacao passa a indicar uma origem operacional presumida para esse remanescente.

Essa origem pode aparecer, de forma simples, como:

- saldo explicado sem detalhamento, quando existe diferenca explicada, mas ainda sem item conciliatorio minimo;
- itemizacao em andamento, quando ja existe itemizacao parcial, mas ainda resta saldo relevante sem cobertura;
- justificativa insuficiente, quando ja existe item conciliatorio, mas a sustentacao operacional ainda depende de justificativa minima melhor definida;
- saldo residual de baixa materialidade, quando o remanescente sem itemizacao e pequeno diante da cobertura ja registrada;
- sem saldo remanescente, quando nao resta faixa explicada sem itemizacao.

Essa classificacao serve apenas para orientar a revisao dirigida do saldo explicado remanescente. Ela nao cria tarefa formal, nao representa verdade contabil definitiva e nao substitui a leitura do historico, da cobertura e da diferenca nao explicada residual.

O detalhe do contrato passou a refletir a mesma origem operacional presumida exibida na conciliacao, junto com a mesma recomendacao simples de revisao dirigida.

### 11.9 Priorizacao visual e filtros leves do saldo remanescente
Quando ainda existir saldo explicado remanescente sem itemizacao minima, a conciliacao passa a indicar uma priorizacao visual simples para ajudar a leitura diaria.
Essa priorizacao pode aparecer como:
- alta, quando a faixa remanescente decorre principalmente de ausencia de detalhamento minimo ou de justificativa ainda insuficiente;
- media, quando a itemizacao ja comecou, mas o saldo remanescente ainda pede revisao dirigida;
- baixa, quando nao ha saldo remanescente ou quando a faixa restante tem baixa materialidade dentro da cobertura ja registrada.
Junto dessa prioridade, a tela tambem informa o motivo principal do destaque visual. Assim, o usuario consegue distinguir com mais clareza se a atencao maior decorre de falta de detalhamento, justificativa insuficiente, itemizacao em andamento ou simples baixa materialidade residual.
Os filtros da conciliacao passaram a incluir recortes especificos para localizar rapidamente:
- remanescente relevante;
- justificativa insuficiente;
- itemizacao em andamento;
- baixa materialidade.
Esses filtros nao criam fila de tarefas, nao geram aprovacao adicional e nao alteram o fechamento, a reabertura ou a diferenca nao explicada residual. Eles servem apenas para organizar melhor a leitura diaria da conciliacao.
O detalhe do contrato passou a refletir a mesma prioridade visual do saldo remanescente e o mesmo motivo principal exibidos na conciliacao.



### 11.10 Quadro gerencial resumido por contrato

O detalhe do contrato passou a exibir, quando houver pelo menos uma competencia conciliatoria registrada, um quadro resumido da situacao conciliatoria agregada do contrato.

Esse quadro nao substitui a leitura detalhada das competencias individuais. Ele oferece uma visao gerencial leve, de leitura rapida, para quem precisa entender rapidamente a situacao do contrato sem precisar entrar competencia por competencia.

O quadro gerencial exibe:

- valor total da diferenca explicada agregada ao longo das competencias do contrato;
- valor ja coberto por itemizacao minima registrada;
- valor explicado ainda sem itemizacao minima;
- valor residual nao explicado ainda aberto.

Alem dos valores, o quadro tambem informa:

- percentual geral de cobertura, calculado a partir do que ja esta coberto por itens diante da diferenca total registrada;
- situacao operacional da cobertura geral, que pode aparecer como sem divergencia registrada, cobertura suficiente, cobertura parcial ou residual nao explicado presente;
- atencao gerencial do contrato, que indica de forma simples se o contrato esta em situacao normal, requer acompanhamento ou requer revisao.

A atencao gerencial e sinalizada visualmente como:

- normal, quando nao ha diferenca nao explicada aberta, nenhuma competencia reaberta e nenhum saldo explicado remanescente de prioridade relevante;
- requer acompanhamento, quando existe saldo explicado sem itemizacao suficiente em pelo menos uma competencia, mesmo sem diferenca residual aberta;
- requer revisao, quando existe diferenca nao explicada aberta em alguma competencia ou quando alguma competencia esta reaberta.

O quadro tambem exibe, de forma resumida, as situacoes de alerta do contrato, sinalizando com indicadores simples se o contrato possui competencia com residual aberto, competencia reaberta ou remanescente de prioridade relevante.

Esse quadro e uma leitura derivada das competencias ja registradas. Ele nao cria nova etapa formal, nao exige aprovacao adicional e nao altera a leitura detalhada de cada competencia.
### 11.11 Leitura transversal minima na listagem de contratos
A listagem de contratos passou a mostrar uma leitura gerencial minima da conciliacao ja na propria linha do contrato, sem exigir abertura imediata do detalhe.
Essa leitura exibe, de forma resumida:
- atencao gerencial do contrato, com indicacao simples de normal, requer acompanhamento ou requer revisao;
- valor residual nao explicado ainda aberto no contrato;
- valor explicado ainda remanescente sem itemizacao minima;
- cobertura agregada minima do contrato.
A atencao gerencial na listagem segue a mesma logica ja usada no detalhe do contrato:
- normal, quando a leitura conciliatoria agregada nao indica residual aberto, competencia reaberta nem remanescente relevante;
- requer acompanhamento, quando ainda existe saldo explicado remanescente relevante sem itemizacao suficiente;
- requer revisao, quando existe residual nao explicado aberto ou competencia reaberta.
A listagem tambem mostra marcadores simples para ajudar a priorizar rapidamente quais contratos abrir primeiro, indicando residual aberto, competencia reaberta, remanescente relevante ou situacao normal.
Essa leitura continua leve. Ela nao cria dashboard executivo pesado, nao substitui o detalhe do contrato e nao transforma a atencao gerencial em decisao formal do sistema.### 11.12 Leitura leve de divergencia estrutural e pontual
A conciliacao passou a indicar, por competencia, uma leitura simples do tipo predominante de divergencia.
Essa leitura pode aparecer como:
- estrutural, quando a competencia mostra sinal mais amplo de divergencia, como residual nao explicado aberto, reabertura ou falta de detalhamento minimo suficiente;
- pontual, quando a diferenca parece mais localizada, ja coberta ou restrita a complemento operacional limitado;
- mista, quando coexistem sinais mais amplos e tambem tratamento localizado por itens ou cobertura parcial;
- indeterminada, quando nao ha divergencia relevante ou quando os sinais atuais nao permitem apontar predominio claro.
Junto da classificacao, a tela informa o motivo operacional principal dessa leitura.
Essa leitura nao substitui a cobertura, a origem do saldo remanescente, a prioridade visual nem a diferenca nao explicada residual. Ela funciona como uma camada adicional de interpretacao operacional para ajudar o usuario a entender se o problema parece mais recorrente e amplo ou mais localizado dentro da competencia.
A mesma leitura passou a aparecer tanto no modulo de conciliacao quanto no detalhe do contrato, sempre de forma coerente com os sinais ja existentes da competencia.