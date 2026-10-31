# Automation Exercise

Testes E2E em JavaScript com Cypress 13, Mocha (`describe`, `it` e hooks), Chai
(`expect` e `should`) e cypress-mochawesome-reporter. Mocha e Chai ja fazem parte
do Cypress e nao precisam de instalacao separada.

## Executar

Requer Node.js compativel com Cypress 13, acesso ao registro npm e ao site alvo.
Ambiente validado: Windows, Node.js 24.11.0, Cypress 13.7.3, Electron 118.

```sh
npm ci
npx cypress install
npm test
```

O comando `cypress install` instala o binario se ele ainda nao estiver no cache.
`npm test` executa somente os dez casos solicitados no Electron headless.
`npm run cy:open` abre a interface do Cypress. `npm run test:all` inclui tambem
os exemplos originais, que acessam outros sites e nao fazem parte desta entrega.

## Cobertura

Referencia: https://automationexercise.com/test_cases

| Caso | Validacao |
| --- | --- |
| 1 | Cadastro completo, confirmacao, autenticacao e exclusao |
| 2 | Login valido e exclusao |
| 3 | Credenciais invalidas e mensagem de erro |
| 4 | Logout e retorno ao login |
| 5 | Email ja cadastrado e mensagem de erro |
| 8 | Catalogo e nome, categoria, preco, disponibilidade, condicao e marca |
| 9 | Busca e comparacao de todos os resultados relacionados por nome ou categoria |
| 10 | Inscricao pelo rodape e confirmacao |
| 15 | Cadastro pela interface antes da compra, checkout, pagamento e exclusao |
| 16 | Login antes da compra, checkout, pagamento e exclusao |

Implementacao: `cypress/e2e/1-getting-started/automation-exercise.cy.js`.

## Padroes

- Cada teste possui isolamento de navegador e email unico por execucao.
- Contas pre-existentes sao criadas pela API publica em cada teste que precisa
  dessa pre-condicao, sem depender de outro caso nem de credenciais pessoais.
- Cadastros, logins, compras e exclusoes previstos nos cenarios usam a interface.
- `afterEach` remove a conta pela API inclusive quando um teste falha; conta ja
  excluida pela interface e aceita como limpeza concluida.
- Seletores priorizam `data-qa`, IDs, links por `href` e escopo do componente.
- Comandos reutilizaveis ficam em `cypress/support/commands.js`; dados ficticios
  ficam em `cypress/fixtures/user.json`. O cartao e apenas massa de teste.
- A busca usa o catalogo da API como referencia para conferir todos os nomes e
  a quantidade de resultados, sem simular respostas da aplicacao.
- Checkout valida os enderecos de entrega e cobranca, produto, quantidade,
  preco e total antes de preencher os dados ficticios de pagamento.
- Nao ha esperas fixas, cliques forcados ou supressao global de excecoes.
- Apenas requisicoes de publicidade de terceiros sao bloqueadas para evitar
  sobreposicoes nos cliques; as respostas funcionais do site nao sao simuladas.
- A confirmacao de pagamento valida a URL final, `Order Placed!` e
  `Congratulations! Your order has been confirmed!`, exibidos atualmente pelo
  site, em vez de depender da mensagem transitoria descrita nos casos oficiais.

## Relatorio Mochawesome

Ao terminar `npm test`, o reporter gera automaticamente:

- `cypress/reports/html/index.html`: relatorio HTML independente, com assets inline.
- `cypress/reports/html/index.json`: resultados estruturados.
- Capturas de falhas incorporadas ao HTML, quando houver.

Abra o HTML no navegador. Cada execucao substitui o relatorio anterior. O comando
de teste retorna codigo diferente de zero se houver falha; gerar o relatorio nao
significa que os testes passaram. Os artefatos estao excluidos do versionamento.
Como o alvo e um site publico, disponibilidade e alteracoes externas podem
afetar o resultado.

## Validacao realizada

`npm test`: 10 aprovados, 0 reprovados, 0 pendentes, 0 ignorados; duracao de
1 minuto e 40 segundos. Relatorios HTML e JSON gerados com sucesso.

O npm apontou 11 vulnerabilidades na arvore instalada (9 moderadas e 2 altas).
Mesmo com `--omit=dev`, ha alertas em dependencias diretas que ja existiam:
`extract-zip`, `qs` e `uuid`. Atualizacoes automaticas com possiveis quebras de
compatibilidade nao foram aplicadas como parte da implementacao dos testes.