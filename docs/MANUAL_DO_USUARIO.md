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
- a execução financeira completa ainda não está concluída no sistema.

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
- `liberada`: etapa financeira considerada concluída;
- `cancelada`: pedido interrompido.

Leitura complementar importante:

- o status global da solicitação não elimina a leitura separada de exigência documental, análise e decisão agregada;
- a aprovação administrativa deve ser lida separadamente da decisão agregada dos itens;
- uma solicitação pode estar com decisão agregada suficiente e ainda não ter aprovação administrativa registrada;
- a aptidão para futura etapa financeira depende da consolidação administrativa e não deve ser confundida com liberação bancária efetivamente realizada;
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

Não. O sistema já cobre o registro e o acompanhamento inicial das solicitações, mas a execução financeira completa ainda não está concluída.

### O que significa “aprovação administrativa”?

É a consolidação administrativa da solicitação depois da análise dos itens. Ela confirma a leitura global do pedido, mas ainda não executa financeiramente a liberação.

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
