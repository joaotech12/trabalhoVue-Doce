# Doce Controle

## Contexto do produto

Este projeto é um sistema web para Maria controlar as vendas e os resultados mensais de sua loja de doces. Atualmente, ela vende cupcakes por R$ 8,00, com custo variável de R$ 4,50 por unidade. As despesas fixas mensais iniciais são internet (R$ 120,00), energia elétrica (R$ 230,00) e água (R$ 90,00), totalizando R$ 440,00.

O sistema deve permitir acompanhar receitas, custos dos produtos vendidos, despesas fixas e lucro líquido por mês. Deve ser possível cadastrar novos produtos, pois a loja pretende ampliar o catálogo.

## Tecnologias e convenções

- Use Vue 3 com Composition API e `<script setup lang="ts">`.
- Use TypeScript com tipos explícitos para modelos, props e dados compartilhados.
- Use CSS tradicional, organizado e responsivo. **Não use Tailwind CSS** nem outras classes utilitárias de framework CSS.
- Mantenha a interface em português do Brasil, com valores monetários em reais (BRL).
- Preserve acessibilidade: rótulos associados aos campos, botões com nomes claros, foco visível e estrutura semântica.
- Não adicione dependências sem necessidade; reutilize as ferramentas já instaladas.

## Organização do código

- `src/components/`: componentes Vue reutilizáveis. Elementos que se repetem na interface devem ser componentes compartilhados, em vez de duplicar marcação.
- `src/composables/`: lógica reutilizável de estado e comportamento Vue.
- `src/types/`: interfaces e tipos compartilhados da aplicação.
- `src/assets/`: imagens e outros recursos processados pelo Vite.
- `public/`: arquivos estáticos servidos diretamente.
- `src/App.vue`: composição das páginas e integração dos componentes.
- `src/style.css`: estilos globais; estilos específicos devem ficar junto ao componente correspondente quando apropriado.

Agrupe arquivos por responsabilidade conforme o projeto crescer, sem criar abstrações ou pastas desnecessárias.

## Regras de negócio

- O preço de venda e o custo unitário devem pertencer ao produto; não codifique o cupcake como único produto.
- Registre no histórico da venda o preço e o custo vigentes na data da venda, para que alterações futuras no cadastro não modifiquem resultados passados.
- O lucro líquido do mês é: receita das vendas menos custos variáveis dos itens vendidos menos despesas fixas do mês.
- Despesas fixas recorrentes devem ser consideradas uma vez em cada mês selecionado.
- Formate valores com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- Persista dados locais de forma consistente. Não apresente valores de demonstração como se fossem vendas reais.
- Valide valores numéricos e campos obrigatórios antes de aceitar cadastros.

## Qualidade

- Prefira mudanças pequenas, consistentes com os padrões existentes e sem regressões.
- Atualize a documentação quando o comportamento ou a estrutura do projeto mudar.
- Antes de concluir alterações, execute `npm run build` e corrija erros de TypeScript ou compilação.
