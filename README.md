# DN-Server

Denuntiare API.

## Requisitos

- Node.js 20
- npm

## Configuracao

```bash
cp .env.example .env
npm install
npm run db:setup
```

Por padrao, a API usa SQLite em `src/database/database.sqlite`.

## Execucao

```bash
npm run dev
```

A API fica disponivel em `http://localhost:3333`.

## Testes

```bash
npm test
```

O teste usa um SQLite temporario e nao altera o banco local.

## Scripts uteis

- `npm run db:migrate`: executa migrations.
- `npm run db:seed`: popula categorias iniciais.
- `npm run db:setup`: executa migrations e seeds.
- `npm start`: inicia a API sem watcher.
