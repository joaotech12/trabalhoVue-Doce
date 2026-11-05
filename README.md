# Doce Controle

Sistema web para Maria controlar as vendas e os resultados mensais da sua loja de doces. Feito com Vue 3, TypeScript e Vite.

Os dados ficam em um banco PostgreSQL, acessado pela API do repositório [SERVER-DOCE](https://github.com/joaotech12/SERVER-DOCE):

```
Vue (porta 5173) -> /api -> Express (porta 3000) -> PostgreSQL
```

## Como rodar

1. Configure e inicie a API seguindo o README do `SERVER-DOCE`.
2. Neste projeto, instale as dependências e inicie o front:

   ```
   npm install
   npm run dev
   ```

Só a dona entra no sistema: não há cadastro, e o e-mail e a senha são definidos no servidor com `npm run owner:set`. Todos os dados exigem login.

Em desenvolvimento, o Vite encaminha as chamadas de `/api` para `http://localhost:3000` (veja `vite.config.ts`). Esse encaminhamento não existe no build de produção: lá, a API precisa estar no mesmo domínio do front.
