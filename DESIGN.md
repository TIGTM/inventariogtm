# Gestão de equipamentos de TI — visual original

## Regra do projeto

O visual deve permanecer igual ao sistema JSP original. A conversão para HTML, CSS e JavaScript não autoriza redesenhar a interface.

## Fonte visual

A cópia local `../teste inicial sistema` contém os mesmos arquivos e tamanhos da versão recebida inicialmente. `css/style.css` e o logotipo foram restaurados integralmente dessa cópia.

As telas `visaogeral.html`, `patrimonio.html`, `cadastrar.html`, `editar.html` e `movimentacoes.html` preservam o HTML visível, a navegação, os formulários e os modais dos respectivos arquivos JSP. `index.html` é uma cópia da visão geral. Os antigos blocos `<style>` ficam em `css/style.css`; as regras específicas de edição usam `:where(.pagina-editar)` para manter sua especificidade e não afetar as outras telas.

## Contrato visual

- Cores, fonte Arial/Helvetica, dimensões, espaçamentos, grades e estados vêm do CSS original.
- Não acrescentar cartões, ícones, arredondamentos, fontes ou uma estrutura de navegação nova.
- Manter os nomes e a ordem dos campos, botões, colunas e ações existentes.
- Alterar somente o necessário para substituir os recursos de servidor por JavaScript local.

## Adaptação para celular autorizada

- O desktop conserva a identidade original. A aplicação ocupa toda a largura e altura da janela.
- Até 900px, a navegação fica acima do conteúdo; até 700px, usa duas colunas e os formulários usam uma coluna.
- As tabelas mantêm todos os dados e ações em registros empilhados com rótulos até 700px. No tablet, a tabela larga pode rolar dentro de seu contêiner.
- Controles de toque têm pelo menos 44px e campos usam fonte de 16px para evitar zoom automático durante a digitação.
- Modais se ajustam à altura disponível, incluindo áreas seguras, com conteúdo rolável e ações acessíveis.
- Todos os estilos, incluindo os responsivos, permanecem em `css/style.css`.

## Dados

`js/local-data.js` concentra a persistência no `localStorage`, usando a chave `gtm-patrimonio-v1` e preservando os dados da primeira conversão. `js/local-view.js` preenche a estrutura original com os registros locais. Os scripts de cada tela mantêm os componentes de apresentação existentes.

Não há consultas, dependências JSP ou serviços remotos. Para uma origem de armazenamento consistente entre páginas em qualquer navegador, abra a pasta por um servidor de arquivos estáticos, como o Live Server do editor; isso não exige backend da aplicação.

## TI e Marketing

As duas áreas utilizam exatamente os mesmos HTMLs, CSS e scripts de apresentação em frontend/. Apenas a identificação do departamento e a API escolhida pela sessão mudam. A API valida o setor em todas as operações. Marketing inclui visão geral, cadastro completo, edição, movimentações e histórico, com os mesmos componentes e layout do TI.

## Ajustes visuais autorizados

As duas áreas ocupam a janela inteira, usam uma navegação lateral mais larga e compartilham cantos arredondados em cartões, campos, botões, etiquetas, modais e linhas de tabela no celular. As cores e a estrutura são iguais nas duas áreas.

O cabeçalho das telas internas tem um interruptor de tema ao lado de Sair, com sol para o modo claro e lua para o escuro. A escolha fica salva no navegador sob `gtm-theme` e vale para TI e Marketing. O login mantém o tema original; o modo escuro cobre navegação, formulários, tabelas, históricos e modais.

