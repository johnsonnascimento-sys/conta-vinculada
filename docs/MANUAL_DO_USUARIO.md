# Manual do Usuario

## 1. Apresentacao do sistema

O Sistema de Conta Vinculada e um ambiente interno de apoio a gestao de contratos administrativos com dedicacao exclusiva de mao de obra. Ele concentra, em uma unica interface, a visao de contratos, saldos, solicitacoes de liberacao, conciliacao, trilha de auditoria e administracao basica de usuarios internos.

Este manual foi escrito para orientar a operacao do sistema por usuarios internos do orgao. O foco aqui e explicar o que cada area faz, quais informacoes aparecem na tela e como registrar ou consultar dados com seguranca.

## 2. Finalidade do sistema

O sistema foi criado para apoiar o acompanhamento institucional da conta vinculada, reduzindo controles paralelos e facilitando a visao operacional sobre:

- contratos em acompanhamento;
- saldo bancario e provisoes gerenciais;
- solicitacoes de liberacao e seu andamento;
- diferencas de conciliacao;
- eventos relevantes para auditoria interna;
- perfis internos de acesso.

Na pratica, o sistema ajuda a organizar a fila de trabalho e a leitura das informacoes mais sensiveis do contrato, especialmente no contexto do Judiciario.

## 3. Perfis de usuario

Os perfis internos atualmente previstos no sistema sao:

- `Administrador do orgao`: possui a visao mais ampla do ambiente, incluindo administracao.
- `Analista`: acompanha contratos, liberacoes e auditoria, com foco em analise operacional.
- `Financeiro`: acompanha contratos, liberacoes e conciliacao.
- `Auditoria interna`: acompanha contratos, conciliacao e trilha de auditoria.

O menu lateral pode variar conforme o perfil. Nem todos os usuarios visualizam os mesmos modulos.

## 4. Acesso ao sistema

O acesso e feito pela tela de login. Depois da autenticacao, o usuario e direcionado ao ambiente interno do sistema.

Ao entrar, o usuario encontra:

- o nome da instituicao no menu lateral;
- o proprio nome, perfil, email e escopo;
- o botao para encerrar a sessao.

Se o acesso nao estiver disponivel, confirme com a administracao interna se o seu perfil esta habilitado no ambiente.

## 5. Visao geral da navegacao

O menu lateral organiza o sistema por modulos:

- Painel institucional
- Contratos
- Liberacoes
- Conciliacao
- Auditoria
- Administracao

Cada modulo tem foco diferente:

- o painel principal resume a situacao geral;
- contratos mostra a visao por contrato;
- liberacoes concentra a fila de solicitacoes;
- conciliacao destaca diferencas entre valores;
- auditoria mostra a trilha de eventos;
- administracao exibe usuarios e perfis internos.

## 6. Painel principal

O painel principal apresenta uma visao executiva do ambiente.

O usuario encontra, logo na entrada:

- saldo bancario total;
- provisoes liquidas;
- quantidade de solicitacoes pendentes;
- diferenca nao explicada;
- contratos monitorados;
- itens pendentes de analise.

Tambem existe uma lista priorizada de contratos com maior risco operacional imediato. Essa lista ajuda a decidir por onde comecar a analise.

O usuario deve usar o painel para:

- identificar contratos com maior urgencia;
- localizar diferencas conciliatorias;
- perceber aumento de pendencias;
- entrar rapidamente no detalhe do contrato.

## 7. Modulo de contratos

O modulo de contratos apresenta uma visao consolidada de cada contrato monitorado.

Na lista principal, o usuario visualiza:

- nome e codigo do contrato;
- empresa vinculada;
- saldo bancario;
- provisoes;
- valor reservado;
- diferenca conciliatoria;
- acao para abrir o detalhe.

Ao abrir um contrato, o usuario encontra uma visao mais completa, com:

- dados gerais do contrato;
- situacao do contrato;
- empresa relacionada;
- competencias e seus status;
- empregados alocados;
- provisoes por empregado e rubrica;
- conta vinculada e eventos bancarios;
- solicitacoes de liberacao do contrato;
- trilha de auditoria ligada ao contrato.

Esse modulo deve ser usado para confirmar contexto antes de agir em liberacoes, conciliacao ou auditoria.

## 8. Modulo de liberacoes

O modulo de liberacoes e o principal ponto de operacao do fluxo de solicitacao de liberacao.

Hoje a tela possui duas partes:

- formulario de criacao da solicitacao;
- fila de solicitacoes ja registradas.

### 8.1 Criacao de solicitacao

O formulario atual permite registrar uma solicitacao com os seguintes elementos principais:

- contrato;
- tipo de liberacao;
- forma de movimentacao;
- competencia inicial;
- competencia final;
- fundamento do pedido;
- observacoes internas;
- um ou mais itens da solicitacao.

Cada item da solicitacao pode conter:

- empregado;
- rubrica;
- competencia do item;
- data de admissao;
- inicio da alocacao;
- fim da alocacao, quando houver;
- data do fato gerador;
- valor solicitado;
- memoria de calculo;
- observacoes do item.

O sistema calcula e exibe o total solicitado com base nos itens informados.

### 8.2 Como operar a criacao

Passo a passo funcional:

1. selecionar o contrato;
2. selecionar o tipo de liberacao;
3. selecionar a forma de movimentacao;
4. informar a competencia inicial e final do pedido;
5. descrever o fundamento do pedido;
6. preencher pelo menos um item;
7. adicionar novos itens, se o pedido abranger mais de um empregado ou rubrica;
8. revisar o total solicitado;
9. enviar a solicitacao.

### 8.3 Fila de solicitacoes

Na mesma tela, o usuario acompanha a fila de solicitacoes registradas.

Cada bloco da fila mostra:

- protocolo;
- tipo de liberacao;
- quem criou;
- periodo do pedido;
- forma de movimentacao;
- status;
- valor solicitado;
- valor aprovado;
- quantidade de pendencias documentais.

Dentro de cada solicitacao, o sistema mostra os itens com:

- rubrica;
- competencia;
- empregado;
- data do fato gerador;
- valor solicitado;
- valor validado;
- valor aprovado;
- decisao do item;
- memoria de calculo, quando informada.

### 8.4 Fluxo funcional atual

Funcionalmente, o usuario deve entender o fluxo assim:

- a solicitacao e registrada e passa a compor a fila interna;
- os itens podem ser acompanhados pelo status e pelos valores;
- a analise e o acompanhamento ja aparecem na leitura do modulo;
- a execucao financeira completa ainda nao esta concluida no sistema.

### 8.5 Pendencias documentais e acompanhamento

O sistema ja indica documentos obrigatorios e pendencias documentais na leitura das solicitacoes. Isso ajuda o usuario a perceber se a instrucao do pedido ainda esta incompleta.

Neste momento do projeto:

- o acompanhamento das pendencias existe na leitura;
- o upload e a gestao completa de documentos ainda nao estao concluidos.

O usuario deve usar essa informacao como sinalizacao operacional de acompanhamento.

### 8.6 Modo somente leitura

Quando o sistema estiver sem base de dados habilitada para gravacao, a tela de liberacoes entra em modo somente leitura.

Nesse caso:

- a fila continua visivel para consulta;
- a criacao de nova solicitacao fica indisponivel;
- o proprio sistema informa que a gravacao depende de base de dados habilitada.

Se isso acontecer, o usuario deve tratar o ambiente como consulta, e nao como ambiente de registro operacional.

## 9. Modulo de conciliacao

O modulo de conciliacao apresenta a comparacao entre:

- saldo bancario;
- provisoes;
- aprovado pendente de execucao;
- diferenca explicada;
- diferenca nao explicada.

Tambem mostra um status resumido da diferenca.

Esse modulo serve para:

- identificar divergencias entre o controle gerencial e a situacao bancaria;
- priorizar analises;
- apoiar a verificacao de saldos e pendencias.

Hoje o modulo esta voltado principalmente para consulta.

## 10. Modulo de auditoria

O modulo de auditoria apresenta a linha do tempo de eventos relevantes do sistema.

Em cada registro, o usuario ve:

- acao realizada;
- responsavel;
- data e hora do evento;
- entidade envolvida;
- descricao resumida.

Esse modulo e util para:

- rastrear decisoes;
- acompanhar eventos relevantes;
- apoiar verificacoes internas;
- recuperar o historico recente de movimentacoes registradas no sistema.

## 11. Modulo de administracao

O modulo de administracao exibe a relacao de usuarios internos cadastrados no ambiente atual.

O usuario visualiza:

- nome;
- perfil;
- escopo;
- situacao de MFA.

Neste momento, o modulo funciona principalmente como visao administrativa e de consulta. A gestao completa de usuarios ainda nao esta concluida.

## 12. Como interpretar status, pendencias e alertas

### 12.1 Status de contrato

O contrato pode aparecer com situacoes que ajudam a interpretar o momento operacional. O usuario deve observar sempre a situacao do contrato junto com saldos, provisoes e diferenca conciliatoria.

### 12.2 Status de competencia

As competencias podem aparecer com situacoes como:

- em processamento;
- fechada;
- conciliada;
- reaberta.

Interpretacao pratica:

- `em processamento`: a competencia ainda esta em andamento;
- `fechada`: o ciclo foi encerrado;
- `conciliada`: os valores ja passaram pelo tratamento de conciliacao;
- `reaberta`: houve necessidade de reavaliacao.

### 12.3 Status de solicitacao de liberacao

As solicitacoes podem aparecer com status como:

- `em elaboracao`
- `enviada`
- `em exigencia`
- `em analise`
- `aprovada`
- `aprovada parcial`
- `rejeitada`
- `liberada`
- `cancelada`

Nem todos esses estados representam funcionalidade completa ja concluida ponta a ponta, mas a nomenclatura orienta a leitura operacional da fila.

Interpretacao pratica:

- `em elaboracao`: pedido ainda em montagem;
- `enviada`: pedido formalizado na fila;
- `em exigencia`: ha necessidade de complemento;
- `em analise`: pedido em avaliacao;
- `aprovada`: pedido aceito integralmente;
- `aprovada parcial`: parte do pedido foi acolhida;
- `rejeitada`: pedido nao acolhido;
- `liberada`: etapa financeira considerada concluida;
- `cancelada`: pedido interrompido.

### 12.4 Decisao do item

Os itens podem indicar situacoes como:

- `pendente`
- `aprovado`
- `aprovado parcial`
- `glosado`

Essas informacoes ajudam a diferenciar o resultado de cada item dentro da solicitacao.

### 12.5 Alertas e diferencas

Alertas normalmente aparecem quando ha:

- diferenca nao explicada;
- pendencias documentais;
- reabertura de competencia;
- itens aguardando analise.

O usuario deve usar esses alertas como prioridade de acompanhamento, e nao como mera informacao visual.

## 13. Boas praticas de uso

- conferir o contrato antes de registrar qualquer solicitacao;
- revisar empregado, rubrica, competencia e datas antes do envio;
- registrar fundamento claro e objetivo;
- descrever memoria de calculo suficiente para entendimento posterior;
- acompanhar a fila de solicitacoes apos o registro;
- usar a conciliacao e a auditoria como apoio de verificacao;
- encerrar a sessao ao finalizar o uso.

## 14. Cuidados ao registrar informacoes

- nao registrar pedido em contrato errado;
- nao informar valor sem revisar a memoria de calculo;
- nao usar observacoes internas para textos vagos ou sem contexto;
- nao ignorar pendencias documentais sinalizadas na leitura;
- nao tratar o sistema como ambiente transacional completo quando ele estiver em modo somente leitura;
- nao presumir que todos os modulos ja fazem todas as etapas do processo sem confirmacao na tela.

## 15. Perguntas frequentes

### O que fazer se eu entrar em Liberacoes e o sistema informar que esta em modo somente leitura?

Use a tela apenas para consulta. Nesse modo, novas solicitacoes nao podem ser registradas.

### Posso registrar mais de um item na mesma solicitacao?

Sim. O formulario permite adicionar mais de um item.

### O que significa pendencia documental?

E a indicacao de que a solicitacao ainda demanda comprovacao obrigatoria esperada para o pedido.

### O sistema ja faz a execucao financeira completa?

Nao. O sistema ja cobre o registro e o acompanhamento inicial das solicitacoes, mas a execucao financeira completa ainda nao esta concluida.

### O modulo de administracao ja permite gerir tudo sobre usuarios?

Nao. Atualmente ele funciona principalmente como visao de consulta sobre usuarios, perfis, escopo e situacao de MFA.

### O modulo de conciliacao ja resolve divergencias diretamente?

Hoje ele serve principalmente para leitura e acompanhamento das diferencas.

## 16. Glossario funcional basico

- `Conta vinculada`: conta utilizada para controle de valores relacionados ao contrato.
- `Competencia`: periodo de referencia usado para processamento e acompanhamento.
- `Provisao gerencial`: controle interno de valor por empregado e rubrica.
- `Saldo bancario`: valor registrado na conta vinculada do contrato.
- `Solicitacao de liberacao`: pedido registrado no sistema para liberar valores ligados ao contrato.
- `Rubrica`: natureza da verba registrada em um item da solicitacao.
- `Fato gerador`: evento que justifica o pedido, como ferias, decimo terceiro ou rescisao.
- `Pendencia documental`: indicacao de documento esperado que ainda nao esta considerado completo na leitura do pedido.
- `Conciliacao`: comparacao entre valores bancarios e valores gerenciais.
- `Auditoria`: historico de eventos relevantes do sistema.
