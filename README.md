# Todo API

Todo CRUD API built with NestJS, TypeScript, GraphQL and MongoDB.

## Requirements

- Docker with Docker Compose
- Node.js 24 and npm for local development and unit tests

## Run with Docker

On first setup, copy the environment template from the project root:

```bash
cp .env.example .env
```

The application container reads `.env` through Compose's `env_file` setting.
`MONGODB_URI` uses `mongodb`, the database service name inside the Compose network.

Start the local application:

```bash
docker compose up --build -d
```

Open GraphiQL: http://localhost:3000/graphql

The application runs at http://localhost:3000.
MongoDB data is stored in the `mongodb_data` volume.

The Compose configuration is intended for local development.

Check container status and application logs:

```bash
docker compose ps
docker compose logs --tail=80 app
```

Stop and remove containers while keeping database data:

```bash
docker compose down
```

## Local development

Stop the application container if it is running, then start MongoDB:

```bash
docker compose stop app
docker compose up -d mongodb
npm ci
```

To run NestJS directly on your computer in watch mode, override the database
address for this command. MongoDB is reachable through its published local port:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/todo npm run start:dev
```

Keep the `mongodb` hostname in `.env` for running the application with Compose.

## GraphQL examples

Run each operation separately in GraphiQL.
Replace `TODO_ID` with the ID returned by `createTodo`.

### Create a todo

```graphql
mutation {
  createTodo(
    input: {
      title: "Learn GraphQL"
      description: "Create a todo through the API"
    }
  ) {
    id
    title
    description
    completed
    completedAt
    createdAt
    updatedAt
  }
}
```

### Get all todos

```graphql
query {
  todos {
    id
    title
    description
    completed
  }
}
```

### Get a todo by ID

```graphql
query {
  todo(id: "TODO_ID") {
    id
    title
    description
    completed
  }
}
```

### Update a todo

```graphql
mutation {
  updateTodo(id: "TODO_ID", input: { completed: true }) {
    id
    title
    completed
    completedAt
    updatedAt
  }
}
```

### Delete a todo

```graphql
mutation {
  deleteTodo(id: "TODO_ID") {
    id
    title
  }
}
```

## Validation

- Titles must contain at least one non-whitespace character.
- Updates must provide at least one field.
- Omitted fields remain unchanged during updates.
- `description: null` clears the description to an empty string.
- `completed: true` records `completedAt`; `completed: false` clears it.
- Completed todos can be edited or reopened. `completedAt` is set by the server.
- `title: null` and `completed: null` are rejected.
- Invalid IDs produce `BAD_REQUEST`.
- Missing todos produce `NOT_FOUND`.

## Linting and formatting

ESLint checks JavaScript and TypeScript files, including source code, tests and
configuration files. TypeScript checks include unhandled promises.
Prettier handles formatting separately.

```bash
npm run lint
npm run lint:fix
npm run format
```

## Unit tests

```bash
npm ci
npm test
npm run test:e2e
```

Watch mode:

```bash
npm run test:watch
```

Todo tests are located in `src/todos/tests/`.

The tests cover DTO validation and selected service and resolver
behaviors. Service and database dependencies are mocked where needed.
No running MongoDB instance is required. The GraphQL smoke test starts Nest with a mocked database connection and checks the schema and input validation.

## Build

```bash
npm run build
```

The compiled application entry point is `dist/main.js`.
